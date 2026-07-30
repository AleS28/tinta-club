import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { hasAuthorPanelAccess } from "@/types/user";
import { getAuthorEstimatedEarnings } from "@/lib/monetization/earnings-service";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";

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

    const monthYear =
      request.nextUrl.searchParams.get("monthYear") ?? getCurrentMonthYear();

    const dashboard = await getAuthorEstimatedEarnings(decoded.uid, monthYear);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("[author/earnings]", error);
    return NextResponse.json({ error: "Error al calcular ganancias" }, { status: 500 });
  }
}
