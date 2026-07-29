import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase-admin";
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

    const body = (await request.json()) as RevokeBody;
    const adminAuth = await getAdminAuth();
    const adminDb = await getAdminDb();

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Servicios Admin no disponibles" }, { status: 503 });
    }

    let uid = body.uid?.trim();
    let email = body.email?.trim().toLowerCase();

    if (!uid && email) {
      const user = await adminAuth.getUserByEmail(email);
      uid = user.uid;
      email = user.email ?? email;
    } else if (uid && !email) {
      const user = await adminAuth.getUser(uid);
      email = user.email ?? "";
    }

    if (!uid) {
      return NextResponse.json({ error: "Indica email o uid" }, { status: 400 });
    }

    const before = (await adminDb.collection("users").doc(uid).get()).data() ?? {};

    await deactivateSubscriptionAdmin(uid);

    await adminDb.collection("users").doc(uid).set(
      {
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
    const message =
      error instanceof Error && error.message.includes("no user record")
        ? "No existe cuenta con ese email"
        : "Error al revocar membresía";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
