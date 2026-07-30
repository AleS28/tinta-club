import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getChapterForApi } from "@/lib/firestore-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { recordDirectChapterSale } from "@/lib/monetization/direct-sales-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

interface PurchaseBody {
  amountPaid: number;
}

async function resolveAuthorId(bookId: string): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("books").doc(bookId).get();
  if (!snap.exists) return null;

  const authorId = snap.data()?.authorId;
  return typeof authorId === "string" ? authorId : null;
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
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const chapter = await getChapterForApi(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    if (!chapter.isPremium) {
      return NextResponse.json({ error: "Este capítulo no es premium" }, { status: 400 });
    }

    const body = (await request.json()) as PurchaseBody;
    const amountPaid = Number(body.amountPaid);

    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      return NextResponse.json({ error: "amountPaid inválido" }, { status: 400 });
    }

    const authorId = await resolveAuthorId(chapter.bookId);
    if (!authorId) {
      return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    }

    const sale = await recordDirectChapterSale({
      userId: decoded.uid,
      bookId: chapter.bookId,
      chapterId,
      authorId,
      amountPaid,
    });

    return NextResponse.json({
      ok: true,
      saleId: sale.id,
      authorShare: sale.authorShare,
      platformShare: sale.platformShare,
    });
  } catch (error) {
    console.error("[chapters/purchase]", error);
    return NextResponse.json({ error: "Error al registrar la compra" }, { status: 500 });
  }
}
