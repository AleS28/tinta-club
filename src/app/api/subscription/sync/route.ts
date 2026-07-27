import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { isPremiumUser } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminConfigured())) {
      return NextResponse.json({ error: "Servidor no configurado" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: "Auth no disponible" }, { status: 503 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);

    if (!profile || !isPremiumUser(profile)) {
      return NextResponse.json({ error: "Sin suscripción activa" }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(decoded.uid, {
      premium: true,
      subscriptionStatus: "premium",
    });

    return NextResponse.json({ synced: true });
  } catch (error) {
    console.error("[subscription/sync]", error);
    return NextResponse.json({ error: "No se pudo sincronizar la suscripción" }, { status: 500 });
  }
}
