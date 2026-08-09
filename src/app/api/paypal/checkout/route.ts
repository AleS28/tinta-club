import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import { createPayPalSubscription } from "@/lib/paypal-subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutBody {
  bookId?: string;
  redirectTo?: string;
  priceUsd?: number;
}

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal no está configurado" }, { status: 503 });
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
    const successPath = `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}subscription=success`;
    const cancelPath = `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}subscription=canceled`;

    const { approveUrl } = await createPayPalSubscription({
      firebaseUid: decoded.uid,
      email: decoded.email,
      priceUsd,
      bookId: body.bookId,
      successPath,
      cancelPath,
    });

    return NextResponse.json({ url: approveUrl });
  } catch (error) {
    console.error("[paypal/checkout]", error);
    const message =
      error instanceof Error ? error.message : "Error al iniciar el pago con PayPal";
    const status = message.includes("no están configurados") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
