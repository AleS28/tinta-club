import type { AdminStorePricingItem, UpdateStorePricingInput } from "@/types/admin-store-pricing";
import type { StoreSaleMode } from "@/types/monetization";
import {
  DEFAULT_DIRECT_BOOK_PRICE_USD,
  DEFAULT_DIRECT_CHAPTER_PRICE_USD,
  getDefaultStorePriceForMode,
} from "@/lib/monetization/constants";
import { buildStoreListing, getStoreCatalog } from "@/lib/monetization/store-catalog-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { getBooks, getChaptersByBookId } from "@/lib/db";
import { CATALOG_BOOK_IDS } from "@/data/catalog";

const MIN_PRICE_USD = 0.5;
const MAX_PRICE_USD = 999;

interface BookPricingDoc {
  directBookPriceUsd?: number;
  directChapterPriceUsd?: number;
  saleMode?: StoreSaleMode;
  pricingUpdatedAt?: string;
  pricingUpdatedBy?: string;
}

function parsePrice(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

function validatePrice(price: number, label: string): void {
  if (price < MIN_PRICE_USD || price > MAX_PRICE_USD) {
    throw new Error(`${label} debe estar entre $${MIN_PRICE_USD} y $${MAX_PRICE_USD} USD.`);
  }
}

async function fetchBookPricingDoc(bookId: string): Promise<BookPricingDoc> {
  const adminDb = await getAdminDb();
  if (!adminDb) return {};

  const snap = await adminDb.collection("books").doc(bookId).get();
  if (!snap.exists) return {};

  const data = snap.data() ?? {};
  return {
    directBookPriceUsd: parsePrice(data.directBookPriceUsd) ?? undefined,
    directChapterPriceUsd: parsePrice(data.directChapterPriceUsd) ?? undefined,
    saleMode: data.saleMode === "book" || data.saleMode === "chapter" ? data.saleMode : undefined,
    pricingUpdatedAt: typeof data.pricingUpdatedAt === "string" ? data.pricingUpdatedAt : undefined,
    pricingUpdatedBy: typeof data.pricingUpdatedBy === "string" ? data.pricingUpdatedBy : undefined,
  };
}

function resolvePricingSource(
  firestore: BookPricingDoc,
  catalogBookPrice?: number,
  catalogChapterPrice?: number,
  saleMode?: StoreSaleMode | null,
): AdminStorePricingItem["pricingSource"] {
  if (
    firestore.saleMode ||
    firestore.directBookPriceUsd ||
    firestore.directChapterPriceUsd
  ) {
    return "firestore";
  }
  if (saleMode && (catalogBookPrice || catalogChapterPrice)) return "catalog";
  return "default";
}

export async function getAdminStorePricingList(): Promise<AdminStorePricingItem[]> {
  const books = await getBooks();
  const catalog = await getStoreCatalog();
  const catalogById = new Map(catalog.map((item) => [item.bookId, item]));

  const items: AdminStorePricingItem[] = [];

  for (const bookId of CATALOG_BOOK_IDS) {
    const book = books.find((b) => b.id === bookId);
    if (!book) continue;

    const chapters = await getChaptersByBookId(bookId);
    const premiumChapterCount = chapters.filter((c) => c.isPremium).length;
    const firestore = await fetchBookPricingDoc(bookId);
    const listing = catalogById.get(bookId) ?? (await buildStoreListing(bookId, chapters));

    const saleMode =
      firestore.saleMode ?? book.saleMode ?? listing?.saleMode ?? null;
    const directBookPriceUsd =
      firestore.directBookPriceUsd ?? parsePrice(book.directBookPriceUsd);
    const directChapterPriceUsd =
      firestore.directChapterPriceUsd ?? parsePrice(book.directChapterPriceUsd);

    items.push({
      bookId,
      title: book.title,
      author: book.author,
      saleMode,
      directBookPriceUsd,
      directChapterPriceUsd,
      effectivePriceUsd: listing?.priceUsd ?? DEFAULT_DIRECT_BOOK_PRICE_USD,
      premiumChapterCount,
      inStore: Boolean(listing),
      pricingSource: resolvePricingSource(
        firestore,
        book.directBookPriceUsd,
        book.directChapterPriceUsd,
        saleMode,
      ),
    });
  }

  return items;
}

export async function updateAdminStorePricing(
  bookId: string,
  input: UpdateStorePricingInput,
  adminUid: string,
): Promise<AdminStorePricingItem> {
  if (!CATALOG_BOOK_IDS.includes(bookId as (typeof CATALOG_BOOK_IDS)[number])) {
    throw new Error("Solo puedes editar precios de obras del catálogo publicado.");
  }

  if (input.saleMode !== "book" && input.saleMode !== "chapter") {
    throw new Error("Modo de venta inválido.");
  }

  const bookPrice = parsePrice(input.directBookPriceUsd);
  const chapterPrice = parsePrice(input.directChapterPriceUsd);

  if (input.saleMode === "book") {
    if (!bookPrice) throw new Error("Indica el precio del libro completo.");
    validatePrice(bookPrice, "Precio del libro");
  } else {
    if (!chapterPrice) throw new Error("Indica el precio por capítulo.");
    validatePrice(chapterPrice, "Precio por capítulo");
  }

  const adminDb = await getAdminDb();
  if (!adminDb) {
    throw new Error("Firebase Admin no está configurado.");
  }

  const payload: BookPricingDoc = {
    saleMode: input.saleMode,
    pricingUpdatedAt: new Date().toISOString(),
    pricingUpdatedBy: adminUid,
  };

  if (input.saleMode === "book") {
    payload.directBookPriceUsd = bookPrice!;
    payload.directChapterPriceUsd = chapterPrice ?? undefined;
  } else {
    payload.directChapterPriceUsd = chapterPrice!;
    payload.directBookPriceUsd = bookPrice ?? undefined;
  }

  await adminDb.collection("books").doc(bookId).set(payload, { merge: true });

  const list = await getAdminStorePricingList();
  const updated = list.find((item) => item.bookId === bookId);
  if (!updated) {
    throw new Error("No se pudo cargar el precio actualizado.");
  }

  return updated;
}
