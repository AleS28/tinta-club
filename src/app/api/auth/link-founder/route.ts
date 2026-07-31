import { NextRequest, NextResponse } from "next/server";
import { findFounderByEmail } from "@/data/founder-authors";
import { linkFounderAuthorAdmin, getUserProfileAdmin } from "@/lib/founder-author-link-admin";
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

    const founder = findFounderByEmail(decoded.email);
    if (!founder) {
      const profile = await getUserProfileAdmin(decoded.uid, decoded.email);
      return NextResponse.json({ linked: false, profile, reason: "not_founder_email" });
    }

    const result = await linkFounderAuthorAdmin(decoded.uid, decoded.email, founder);

    if (result.reason === "admin_not_configured") {
      console.error("[auth/link-founder] Firebase Admin no configurado en el servidor");
      return NextResponse.json(
        {
          linked: false,
          reason: result.reason,
          error: "El servidor no puede vincular autores fundadores. Contacta al administrador.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      linked: result.linked,
      profile: result.profile,
      authorSlug: founder.slug,
      reason: result.reason,
    });
  } catch (error) {
    console.error("[auth/link-founder]", error);
    return NextResponse.json({ error: "Error al vincular autor fundador" }, { status: 500 });
  }
}
