import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { getStripe, getAppBaseUrl, isStripeConfigured } from "@/lib/stripe";
import { getStripeCustomerId, saveStripeCustomerId } from "@/lib/subscription-admin";
import { buildAuthorIdentityIndex, resolveAuthorFromIndex } from "@/lib/author-identity-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ authorId: string }>;
}

const MIN_DONATION_USD = 1;
const MAX_DONATION_USD = 500;

async function resolveAuthorDisplayName(authorId: string): Promise<string> {
  const index = await buildAuthorIdentityIndex();
  const identity = resolveAuthorFromIndex(authorId, index);
  return identity.displayName || "Autor del Imperio";
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
    }

    const { authorId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json()) as { amountUsd?: number; redirectTo?: string };
    const amountUsd = Number(body.amountUsd);

    if (!Number.isFinite(amountUsd) || amountUsd < MIN_DONATION_USD || amountUsd > MAX_DONATION_USD) {
      return NextResponse.json(
        { error: `La donación debe estar entre $${MIN_DONATION_USD} y $${MAX_DONATION_USD} USD.` },
        { status: 400 },
      );
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    const donorDisplayName = profile?.displayName ?? decoded.email ?? "Lector";
    const authorName = await resolveAuthorDisplayName(authorId);
    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    let customerId = await getStripeCustomerId(decoded.uid);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decoded.email,
        metadata: { firebaseUid: decoded.uid },
      });
      customerId = customer.id;
      await saveStripeCustomerId(decoded.uid, customerId);
    }

    const redirectTo = body.redirectTo ?? `/perfil/${authorId}?donated=true`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountUsd * 100),
            product_data: {
              name: `Apoyo a ${authorName}`,
              description: "Donación directa al autor — El Imperio de la Tinta",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "author_donation",
        firebaseUid: decoded.uid,
        userId: decoded.uid,
        authorId,
        donorDisplayName,
        grossAmount: amountUsd.toFixed(2),
      },
      payment_intent_data: {
        metadata: {
          type: "author_donation",
          firebaseUid: decoded.uid,
          authorId,
          donorDisplayName,
        },
      },
      success_url: `${baseUrl}${redirectTo}`,
      cancel_url: `${baseUrl}${redirectTo.split("?")[0]}?donate=canceled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id, amountUsd });
  } catch (error) {
    console.error("[authors/donate]", error);
    return NextResponse.json({ error: "Error al iniciar la donación" }, { status: 500 });
  }
}
