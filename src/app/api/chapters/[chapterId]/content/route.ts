import { NextRequest, NextResponse } from "next/server";
import { canAccessFullChapter } from "@/lib/chapter-access";
import { getChapterForApi, getUserProfileFromFirestore } from "@/lib/firestore-admin";
import { isAdminConfigured, verifyFirebaseIdToken, getAdminAuth } from "@/lib/firebase-admin";
import { isPremiumUser } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
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

    if (!(await isAdminConfigured())) {
      return NextResponse.json(
        { error: "Verificación de suscripción no disponible en el servidor" },
        { status: 503 },
      );
    }

    const adminAuth = await getAdminAuth();
    let hasPremiumAccess = false;

    if (adminAuth) {
      try {
        const adminDecoded = await adminAuth.verifyIdToken(idToken);
        if (adminDecoded.premium === true || adminDecoded.subscriptionStatus === "premium") {
          hasPremiumAccess = true;
        }
      } catch {
        // fallback abajo
      }
    }

    if (!hasPremiumAccess) {
      const decoded = await verifyFirebaseIdToken(idToken);
      if (!decoded) {
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
      }

      let profile = null;
      try {
        profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);
      } catch {
        return NextResponse.json(
          { error: "No se pudo leer tu perfil. Intenta de nuevo en unos segundos." },
          { status: 503 },
        );
      }

      hasPremiumAccess =
        !!profile && canAccessFullChapter(chapter, profile) && isPremiumUser(profile);
    }

    if (!hasPremiumAccess) {
      return NextResponse.json({ error: "Suscripción premium requerida" }, { status: 403 });
    }

    return NextResponse.json({
      content: chapter.content,
      access: "premium",
    });
  } catch (error) {
    console.error("[chapter-content] API error:", error);
    return NextResponse.json({ error: "Error interno al cargar el capítulo" }, { status: 500 });
  }
}
