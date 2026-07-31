import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserDirectPurchases } from "@/lib/monetization/reading-access-admin";
import { getBooks } from "@/lib/db";
import { getChapterForApi } from "@/lib/firestore-admin";

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

    const { books, chapters } = await getUserDirectPurchases(decoded.uid);
    const allBooks = await getBooks();
    const bookMap = new Map(allBooks.map((b) => [b.id, b]));

    const purchasedBooks = books.map((purchase) => {
      const book = bookMap.get(purchase.bookId);
      return {
        type: "book" as const,
        bookId: purchase.bookId,
        title: book?.title ?? purchase.bookId,
        author: book?.author ?? "",
        coverGradient: book?.coverGradient ?? "from-stone-400 to-stone-600",
        coverAccent: book?.coverAccent ?? "#78716C",
        coverUrl: book?.coverUrl,
        purchasedAt: purchase.purchasedAt,
        readHref: `/libro/${purchase.bookId}`,
      };
    });

    const purchasedChapters = await Promise.all(
      chapters.map(async (purchase) => {
        const book = bookMap.get(purchase.bookId);
        const chapter = await getChapterForApi(purchase.chapterId);
        return {
          type: "chapter" as const,
          bookId: purchase.bookId,
          chapterId: purchase.chapterId,
          bookTitle: book?.title ?? purchase.bookId,
          chapterTitle: chapter?.title ?? `Capítulo ${purchase.chapterId}`,
          chapterNumber: chapter?.number,
          author: book?.author ?? "",
          coverGradient: book?.coverGradient ?? "from-stone-400 to-stone-600",
          coverAccent: book?.coverAccent ?? "#78716C",
          coverUrl: book?.coverUrl,
          purchasedAt: purchase.purchasedAt,
          readHref: `/leer/${purchase.chapterId}`,
        };
      }),
    );

    const ownedBookIds = new Set(purchasedBooks.map((b) => b.bookId));
    const filteredChapters = purchasedChapters.filter((c) => !ownedBookIds.has(c.bookId));

    return NextResponse.json({
      books: purchasedBooks,
      chapters: filteredChapters,
      bookIds: [...ownedBookIds],
      chapterIds: filteredChapters.map((c) => c.chapterId),
    });
  } catch (error) {
    console.error("[library/purchases]", error);
    return NextResponse.json({ error: "Error al cargar tus compras" }, { status: 500 });
  }
}
