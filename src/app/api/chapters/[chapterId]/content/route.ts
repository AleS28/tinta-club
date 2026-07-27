import { NextRequest, NextResponse } from "next/server";
import { getChapterById as getMockChapterById, type Chapter } from "@/data/mock";
import { canAccessFullChapter } from "@/lib/chapter-access";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { isPremiumUser, normalizeUserProfile, type UserProfile } from "@/types/user";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

async function getChapterForApi(chapterId: string): Promise<Chapter | undefined> {
  const adminDb = getAdminDb();

  if (adminDb) {
    try {
      const snap = await adminDb.collection("chapters").doc(chapterId).get();
      if (snap.exists) {
        return { id: snap.id, ...snap.data() } as Chapter;
      }
    } catch (error) {
      console.error("[chapter-content] Firestore read:", error);
    }
  }

  return getMockChapterById(chapterId);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { chapterId } = await context.params;
    const chapter = await getChapterForApi(chapterId);

    if (!chapter) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    if (!Array.isArray(chapter.content) || chapter.content.length === 0) {
      return NextResponse.json({ error: "Contenido del capítulo no disponible" }, { status: 404 });
    }

    if (!chapter.isPremium) {
      return NextResponse.json({ content: chapter.content, access: "public" });
    }

    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Verificación de suscripción no disponible en el servidor" },
        { status: 503 },
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: "Servicio de autenticación no disponible" },
        { status: 503 },
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    const profile = userSnap.exists
      ? normalizeUserProfile({
          uid: decoded.uid,
          email: userSnap.data()?.email ?? decoded.email ?? "",
          displayName: userSnap.data()?.displayName ?? "Lector",
          role: userSnap.data()?.role ?? "reader",
          ...userSnap.data(),
        } as UserProfile)
      : null;

    if (!canAccessFullChapter(chapter, profile) || !isPremiumUser(profile)) {
      return NextResponse.json({ error: "Suscripción premium requerida" }, { status: 403 });
    }

    return NextResponse.json({
      content: chapter.content,
      access: "premium",
      uid: decoded.uid,
    });
  } catch (error) {
    console.error("[chapter-content] API error:", error);
    return NextResponse.json({ error: "Error interno al cargar el capítulo" }, { status: 500 });
  }
}
