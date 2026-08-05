import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import { createPayPalOrder } from "@/lib/paypal-orders";
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
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal no está configurado" }, { status: 503 });
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

    const redirectTo = body.redirectTo ?? `/perfil/${authorId}?donated=true`;
    const cancelBase = redirectTo.split("?")[0] ?? `/perfil/${authorId}`;

    const { orderId, approveUrl } = await createPayPalOrder({
      type: "author_donation",
      firebaseUid: decoded.uid,
      amountUsd,
      description: `Apoyo a ${authorName}`,
      successPath: redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`,
      cancelPath: `${cancelBase}?donate=canceled`,
      authorId,
      donorDisplayName,
    });

    return NextResponse.json({ url: approveUrl, sessionId: orderId, amountUsd });
  } catch (error) {
    console.error("[authors/donate]", error);
    return NextResponse.json({ error: "Error al iniciar la donación" }, { status: 500 });
  }
}
