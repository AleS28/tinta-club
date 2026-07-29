import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { resolveUserByEmailOrUid } from "@/lib/admin-user-lookup";
import { deactivateSubscriptionAdmin } from "@/lib/subscription-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RevokeBody {
  email?: string;
  uid?: string;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_API_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("x-admin-secret");
  return header === secret;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await isAdminConfigured())) {
      return NextResponse.json({ error: "Firebase Admin no configurado" }, { status: 503 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Firestore Admin no disponible" }, { status: 503 });
    }

    const body = (await request.json()) as RevokeBody;
    const { uid, email } = await resolveUserByEmailOrUid(body);

    const before = (await adminDb.collection("users").doc(uid).get()).data() ?? {};

    await deactivateSubscriptionAdmin(uid);

    await adminDb.collection("users").doc(uid).set(
      {
        uid,
        email,
        role: "reader",
        subscriptionStatus: "free",
        isPremium: false,
        isSubscriber: false,
      },
      { merge: true },
    );

    return NextResponse.json({
      ok: true,
      uid,
      email,
      hadStripeSubscription: Boolean(before.stripeSubscriptionId),
      message: "Membresía revocada. La usuaria debe cerrar sesión e iniciar de nuevo.",
    });
  } catch (error) {
    console.error("[admin/revoke-member]", error);
    const message = error instanceof Error ? error.message : "Error al revocar membresía";
    const status = message.includes("No se encontró") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
