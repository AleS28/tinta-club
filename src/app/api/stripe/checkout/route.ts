import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getStripe, getAppBaseUrl, isStripeConfigured } from "@/lib/stripe";
import { getStripeCustomerId, saveStripeCustomerId } from "@/lib/subscription-admin";
import { BRAND_NAME } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutBody {
  bookId?: string;
  redirectTo?: string;
  priceUsd?: number;
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as CheckoutBody;
    const priceUsd = body.priceUsd ?? DEFAULT_SUBSCRIPTION_PRICE;
    const redirectTo = body.redirectTo ?? "/biblioteca";
    const baseUrl = getAppBaseUrl();

    const stripe = getStripe();
    let customerId = await getStripeCustomerId(decoded.uid);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decoded.email,
        metadata: { firebaseUid: decoded.uid },
      });
      customerId = customer.id;
      await saveStripeCustomerId(decoded.uid, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(priceUsd * 100),
            recurring: { interval: "month" },
            product_data: {
              name: `Socia del Imperio — ${BRAND_NAME}`,
              description: "Acceso ilimitado a capítulos premium y apoyo a autores independientes.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        firebaseUid: decoded.uid,
        bookId: body.bookId ?? "",
      },
      subscription_data: {
        metadata: {
          firebaseUid: decoded.uid,
          bookId: body.bookId ?? "",
        },
      },
      success_url: `${baseUrl}${redirectTo}${redirectTo.includes("?") ? "&" : "?"}subscription=success`,
      cancel_url: `${baseUrl}${redirectTo}${redirectTo.includes("?") ? "&" : "?"}subscription=canceled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
  }
}
