import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import {
  deactivateSubscriptionAdmin,
  getPayPalSubscriptionId,
} from "@/lib/subscription-admin";
import { cancelPayPalSubscriptionRemote } from "@/lib/paypal-subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const subscriptionId = await getPayPalSubscriptionId(decoded.uid);
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa en PayPal" },
        { status: 404 },
      );
    }

    try {
      await cancelPayPalSubscriptionRemote(subscriptionId);
    } catch (error) {
      console.error("[paypal/cancel] remote:", error);
      // Continuar: puede estar ya cancelada en PayPal
    }

    await deactivateSubscriptionAdmin(decoded.uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[paypal/cancel]", error);
    return NextResponse.json({ error: "No se pudo cancelar la suscripción" }, { status: 500 });
  }
}
