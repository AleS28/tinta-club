import type { Book, Chapter } from "@/data/mock";

/** Obras publicadas actualmente en la plataforma. */
export const CATALOG_BOOK_IDS = [
  "pedro-amor-cafe",
  "will-chica-cafe",
  "will-whisky-por-favor",
] as const;

export type CatalogBookId = (typeof CATALOG_BOOK_IDS)[number];

const catalogBookIdSet = new Set<string>(CATALOG_BOOK_IDS);

export function isCatalogBookId(id: string): id is CatalogBookId {
  return catalogBookIdSet.has(id);
}

export function filterCatalogBooks(books: Book[]): Book[] {
  return books.filter((book) => isCatalogBookId(book.id));
}

export function filterCatalogChapters(chapters: Chapter[]): Chapter[] {
  return chapters.filter((chapter) => isCatalogBookId(chapter.bookId));
}
