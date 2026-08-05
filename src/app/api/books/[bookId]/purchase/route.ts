import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { isPayPalConfigured } from "@/lib/paypal";
import { createPayPalOrder } from "@/lib/paypal-orders";
import { hasBookPurchaseAccess } from "@/lib/monetization/book-access-admin";
import { getChaptersByBookId, getBookById } from "@/lib/db";
import { buildStoreListing, resolveBookPriceUsd } from "@/lib/monetization/store-catalog-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal no está configurado" }, { status: 503 });
    }

    const { bookId } = await context.params;

    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const book = await getBookById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
    }

    const chapters = await getChaptersByBookId(bookId);
    const listing = await buildStoreListing(bookId, chapters);

    if (!listing || listing.saleMode !== "book") {
      return NextResponse.json(
        { error: "Este libro no está disponible para compra completa" },
        { status: 400 },
      );
    }

    if (await hasBookPurchaseAccess(decoded.uid, bookId)) {
      return NextResponse.json({ error: "Ya compraste este libro" }, { status: 400 });
    }

    const priceUsd = await resolveBookPriceUsd(bookId);
    const firstChapterId = listing.firstChapterId ?? chapters[0]?.id;
    const successPath = firstChapterId
      ? `/leer/${firstChapterId}?purchased=true`
      : `/biblioteca?purchased=true&section=compras`;

    const { orderId, approveUrl } = await createPayPalOrder({
      type: "book_purchase",
      firebaseUid: decoded.uid,
      amountUsd: priceUsd,
      description: `${book.title} — Compra de libro`,
      successPath,
      cancelPath: `/tienda?purchase=canceled&bookId=${bookId}`,
      bookId,
      authorId: book.authorId,
    });

    return NextResponse.json({ url: approveUrl, sessionId: orderId, priceUsd });
  } catch (error) {
    console.error("[books/purchase]", error);
    return NextResponse.json({ error: "Error al iniciar la compra" }, { status: 500 });
  }
}
