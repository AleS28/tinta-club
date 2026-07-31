import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { hasAuthorPanelAccess } from "@/types/user";
import { getAuthorInteractionsFeed } from "@/lib/social/interactions-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
    if (!profile || !hasAuthorPanelAccess(profile)) {
      return NextResponse.json({ error: "Acceso solo para autores" }, { status: 403 });
    }

    const feed = await getAuthorInteractionsFeed(decoded.uid);
    return NextResponse.json(feed);
  } catch (error) {
    console.error("[author/interactions]", error);
    return NextResponse.json({ error: "Error al cargar interacciones" }, { status: 500 });
  }
}
