import type { Chapter } from "@/data/mock";
import type { StoreBookListing, StoreSaleMode } from "@/types/monetization";
import {
  DEFAULT_DIRECT_BOOK_PRICE_USD,
  DEFAULT_DIRECT_CHAPTER_PRICE_USD,
} from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";
import { getBooks, getChaptersByBookId } from "@/lib/db";

interface BookPricingFields {
  directBookPriceUsd?: number;
  directChapterPriceUsd?: number;
  saleMode?: StoreSaleMode;
}

async function fetchBookPricing(bookId: string): Promise<BookPricingFields> {
  const adminDb = await getAdminDb();
  if (!adminDb) return {};

  const snap = await adminDb.collection("books").doc(bookId).get();
  if (!snap.exists) return {};

  const data = snap.data() ?? {};
  return {
    directBookPriceUsd: Number.isFinite(Number(data.directBookPriceUsd))
      ? Number(data.directBookPriceUsd)
      : undefined,
    directChapterPriceUsd: Number.isFinite(Number(data.directChapterPriceUsd))
      ? Number(data.directChapterPriceUsd)
      : undefined,
    saleMode: data.saleMode === "book" || data.saleMode === "chapter" ? data.saleMode : undefined,
  };
}

function resolveSaleMode(
  premiumCount: number,
  pricing: BookPricingFields,
): StoreSaleMode | null {
  if (premiumCount <= 0) return null;
  if (pricing.saleMode) return pricing.saleMode;
  if (pricing.directBookPriceUsd && pricing.directBookPriceUsd > 0) return "book";
  return "chapter";
}

function resolveListingPrice(
  saleMode: StoreSaleMode,
  premiumCount: number,
  pricing: BookPricingFields,
): number {
  if (saleMode === "book") {
    if (pricing.directBookPriceUsd && pricing.directBookPriceUsd > 0) {
      return pricing.directBookPriceUsd;
    }
    return DEFAULT_DIRECT_BOOK_PRICE_USD;
  }

  const chapterPrice =
    pricing.directChapterPriceUsd && pricing.directChapterPriceUsd > 0
      ? pricing.directChapterPriceUsd
      : DEFAULT_DIRECT_CHAPTER_PRICE_USD;

  return chapterPrice;
}

export async function buildStoreListing(
  bookId: string,
  chapters: Chapter[],
): Promise<StoreBookListing | null> {
  const books = await getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return null;

  const pricing = await fetchBookPricing(bookId);
  const mergedPricing = {
    directBookPriceUsd: pricing.directBookPriceUsd ?? book.directBookPriceUsd,
    directChapterPriceUsd: pricing.directChapterPriceUsd ?? book.directChapterPriceUsd,
    saleMode: pricing.saleMode ?? book.saleMode,
  };
  const premiumChapterCount = chapters.filter((c) => c.isPremium).length;
  const saleMode = resolveSaleMode(premiumChapterCount, mergedPricing);

  if (!saleMode) return null;

  const firstChapter = chapters[0];

  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    authorId: book.authorId,
    genre: book.genre,
    rating: book.rating,
    synopsis: book.synopsis,
    coverGradient: book.coverGradient,
    coverAccent: book.coverAccent,
    coverUrl: book.coverUrl,
    premiumChapterCount,
    totalChapterCount: chapters.length,
    saleMode,
    priceUsd: resolveListingPrice(saleMode, premiumChapterCount, mergedPricing),
    includedInSubscription: premiumChapterCount > 0,
    firstChapterId: firstChapter?.id,
  };
}

export async function getStoreCatalog(): Promise<StoreBookListing[]> {
  const books = await getBooks();
  const listings: StoreBookListing[] = [];

  for (const book of books) {
    const chapters = await getChaptersByBookId(book.id);
    const listing = await buildStoreListing(book.id, chapters);
    if (listing) listings.push(listing);
  }

  return listings.sort((a, b) => a.title.localeCompare(b.title));
}

export async function resolveBookPriceUsd(bookId: string): Promise<number> {
  const chapters = await getChaptersByBookId(bookId);
  const listing = await buildStoreListing(bookId, chapters);
  return listing?.priceUsd ?? DEFAULT_DIRECT_BOOK_PRICE_USD;
}

export async function resolveChapterPriceUsd(
  chapterId: string,
  bookId: string,
): Promise<number> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const chapterSnap = await adminDb.collection("chapters").doc(chapterId).get();
    const chapterPrice = Number(chapterSnap.data()?.priceUsd);
    if (Number.isFinite(chapterPrice) && chapterPrice > 0) return chapterPrice;
  }

  const chapters = await getChaptersByBookId(bookId);
  const listing = await buildStoreListing(bookId, chapters);
  if (listing?.saleMode === "chapter") return listing.priceUsd;

  const pricing = await fetchBookPricing(bookId);
  if (pricing.directChapterPriceUsd && pricing.directChapterPriceUsd > 0) {
    return pricing.directChapterPriceUsd;
  }

  return DEFAULT_DIRECT_CHAPTER_PRICE_USD;
}
