import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { getChapterForApi } from "@/lib/firestore-admin";
import {
  createChapterComment,
  listChapterComments,
} from "@/lib/social/comments-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

async function resolveBookAuthorId(bookId: string): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;
  const snap = await adminDb.collection("books").doc(bookId).get();
  const authorId = snap.data()?.authorId;
  return typeof authorId === "string" ? authorId : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { chapterId } = await context.params;
    const comments = await listChapterComments(chapterId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[chapters/comments GET]", error);
    return NextResponse.json({ error: "Error al cargar comentarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { chapterId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = (await request.json()) as { text?: string; parentId?: string };
    const chapter = await getChapterForApi(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    const bookAuthorId = (await resolveBookAuthorId(chapter.bookId)) ?? "";
    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);

    const comment = await createChapterComment({
      chapterId,
      bookId: chapter.bookId,
      bookAuthorId,
      userId: decoded.uid,
      userDisplayName: profile?.displayName ?? decoded.email ?? "Lector",
      text: body.text ?? "",
      parentId: body.parentId,
    });

    return NextResponse.json({ comment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al publicar comentario";
    console.error("[chapters/comments POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
