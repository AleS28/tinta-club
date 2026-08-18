import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import { createPayPalOrder } from "@/lib/paypal-orders";
import { BRAND_NAME } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_DONATION_USD = 1;
const MAX_DONATION_USD = 500;

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

    const redirectTo = body.redirectTo ?? "/?platform_donated=true";
    const cancelBase = redirectTo.split("?")[0] ?? "/";

    const { orderId, approveUrl } = await createPayPalOrder({
      type: "platform_donation",
      firebaseUid: decoded.uid,
      amountUsd,
      description: `Café para ${BRAND_NAME}`,
      successPath: redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`,
      cancelPath: `${cancelBase}?platform_donate=canceled`,
      donorDisplayName,
    });

    return NextResponse.json({ url: approveUrl, sessionId: orderId, amountUsd });
  } catch (error) {
    console.error("[platform/donate]", error);
    return NextResponse.json({ error: "Error al iniciar la donación" }, { status: 500 });
  }
}
