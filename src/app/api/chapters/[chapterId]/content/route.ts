import { NextRequest, NextResponse } from "next/server";
import { getChapterById as getMockChapterById } from "@/data/mock";
import { canAccessFullChapter } from "@/lib/chapter-access";
import {
  getChapterForApi,
  getUserProfileFromFirestore,
  sanitizeChapterContent,
} from "@/lib/firestore-admin";
import { isAdminConfigured, verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { isPremiumUser } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

function hasPremiumClaims(decoded: {
  premium?: boolean;
  subscriptionStatus?: string;
}): boolean {
  return decoded.premium === true || decoded.subscriptionStatus === "premium";
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { chapterId } = await context.params;
    const mockChapter = getMockChapterById(chapterId);
    const chapter = mockChapter ?? (await getChapterForApi(chapterId));

    if (!chapter) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    const content = sanitizeChapterContent(chapter.content);
    if (content.length === 0) {
      return NextResponse.json({ error: "Contenido del capítulo no disponible" }, { status: 404 });
    }

    if (!chapter.isPremium) {
      return NextResponse.json({ content, access: "public" });
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

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    const profile = await getUserProfileFromFirestore(decoded.uid, decoded.email);

    // Firestore manda: si hay perfil y no es premium, denegar aunque el token tenga claims viejos.
    let hasPremiumAccess =
      !!profile && canAccessFullChapter(chapter, profile) && isPremiumUser(profile);

    if (!profile) {
      hasPremiumAccess = hasPremiumClaims(decoded);
    }

    if (!hasPremiumAccess) {
      return NextResponse.json({ error: "Suscripción premium requerida" }, { status: 403 });
    }

    return NextResponse.json({
      content,
      access: "premium",
    });
  } catch (error) {
    console.error("[chapter-content] API error:", error);
    return NextResponse.json({ error: "Error interno al cargar el capítulo" }, { status: 500 });
  }
}
