import { NextRequest, NextResponse } from "next/server";
import { isSiteAdminEmail } from "@/data/site-admins";
import { getUserProfileAdmin, linkSiteAdminAdmin } from "@/lib/site-admin-link-admin";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    if (!isSiteAdminEmail(decoded.email)) {
      const profile = await getUserProfileAdmin(decoded.uid, decoded.email);
      return NextResponse.json({ linked: false, profile, reason: "not_admin_email" });
    }

    const result = await linkSiteAdminAdmin(decoded.uid, decoded.email);

    return NextResponse.json({
      linked: result.linked,
      profile: result.profile,
      reason: result.reason,
    });
  } catch (error) {
    console.error("[auth/link-admin]", error);
    return NextResponse.json({ error: "Error al vincular administrador" }, { status: 500 });
  }
}
