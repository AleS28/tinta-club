import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getBookLikeState, toggleBookLike } from "@/lib/social/book-likes-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const decoded = idToken ? await verifyFirebaseIdToken(idToken) : null;

    const state = await getBookLikeState(bookId, decoded?.uid);
    return NextResponse.json(state);
  } catch (error) {
    console.error("[books/likes GET]", error);
    return NextResponse.json({ error: "Error al cargar likes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { bookId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const state = await toggleBookLike(bookId, decoded.uid);
    return NextResponse.json(state);
  } catch (error) {
    console.error("[books/likes POST]", error);
    return NextResponse.json({ error: "Error al actualizar like" }, { status: 500 });
  }
}
