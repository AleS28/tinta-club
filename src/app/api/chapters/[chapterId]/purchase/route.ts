import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getChapterForApi } from "@/lib/firestore-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import { createPayPalOrder } from "@/lib/paypal-orders";
import { hasChapterPurchaseAccess } from "@/lib/monetization/chapter-access-admin";
import { hasBookPurchaseAccess } from "@/lib/monetization/book-access-admin";
import { resolveChapterPriceUsd } from "@/lib/monetization/store-catalog-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ chapterId: string }>;
}

async function resolveAuthorId(bookId: string): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("books").doc(bookId).get();
  if (!snap.exists) return null;

  const authorId = snap.data()?.authorId;
  return typeof authorId === "string" && authorId.length > 0 ? authorId : null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal no está configurado" }, { status: 503 });
    }

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

    const chapter = await getChapterForApi(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Capítulo no encontrado" }, { status: 404 });
    }

    if (!chapter.isPremium) {
      return NextResponse.json({ error: "Este capítulo no es premium" }, { status: 400 });
    }

    if (await hasBookPurchaseAccess(decoded.uid, chapter.bookId)) {
      return NextResponse.json({ error: "Ya tienes acceso a este libro" }, { status: 400 });
    }

    if (await hasChapterPurchaseAccess(decoded.uid, chapterId)) {
      return NextResponse.json({ error: "Ya compraste este capítulo" }, { status: 400 });
    }

    const authorId = await resolveAuthorId(chapter.bookId);
    if (!authorId) {
      return NextResponse.json({ error: "Autor no encontrado para esta obra" }, { status: 404 });
    }

    const priceUsd = await resolveChapterPriceUsd(chapterId, chapter.bookId);

    const { orderId, approveUrl } = await createPayPalOrder({
      type: "chapter_purchase",
      firebaseUid: decoded.uid,
      amountUsd: priceUsd,
      description: `${chapter.title} — Compra de capítulo`,
      successPath: `/leer/${chapterId}?purchased=true`,
      cancelPath: `/leer/${chapterId}?purchase=canceled`,
      bookId: chapter.bookId,
      chapterId,
      authorId,
    });

    return NextResponse.json({ url: approveUrl, sessionId: orderId, priceUsd });
  } catch (error) {
    console.error("[chapters/purchase]", error);
    return NextResponse.json({ error: "Error al iniciar la compra" }, { status: 500 });
  }
}
