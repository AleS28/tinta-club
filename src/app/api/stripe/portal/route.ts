import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getStripe, getAppBaseUrl, isStripeConfigured } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/subscription-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const customerId = await getStripeCustomerId(decoded.uid);
    if (!customerId) {
      return NextResponse.json({ error: "No tienes una suscripción activa en Stripe" }, { status: 404 });
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/biblioteca`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe/portal]", error);
    return NextResponse.json({ error: "No se pudo abrir el portal de facturación" }, { status: 500 });
  }
}
