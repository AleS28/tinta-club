import { NextRequest, NextResponse } from "next/server";
import { getChapterById } from "@/lib/db";
import { canAccessFullChapter } from "@/lib/chapter-access";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { isPremiumUser, normalizeUserProfile, type UserProfile } from "@/types/user";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { chapterId } = await context.params;
  const chapter = await getChapterById(chapterId);

  if (!chapter) {
    return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
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
    return NextResponse.json({ error: "Servicio de autenticación no disponible" }, { status: 503 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userSnap = await adminDb.collection("users").doc(decoded.uid).get();

    const profile = userSnap.exists
      ? normalizeUserProfile(userSnap.data() as UserProfile)
      : null;

    if (!canAccessFullChapter(chapter, profile)) {
      return NextResponse.json({ error: "Suscripción premium requerida" }, { status: 403 });
    }

    if (!isPremiumUser(profile)) {
      return NextResponse.json({ error: "Suscripción premium requerida" }, { status: 403 });
    }

    return NextResponse.json({
      content: chapter.content,
      access: "premium",
      uid: decoded.uid,
    });
  } catch {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
  }
}
