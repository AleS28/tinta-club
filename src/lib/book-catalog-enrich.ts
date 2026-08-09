import { getBookById as getMockBookById, type Book } from "@/data/mock";
import { isCatalogBookId } from "@/data/catalog";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";

/** Completa portadas y metadatos locales cuando Firestore no los trae. */
export function enrichBookFromCatalog(book: Book): Book {
  if (!isCatalogBookId(book.id)) return book;

  const mock = getMockBookById(book.id);
  if (!mock) return book;

  return {
    ...mock,
    ...book,
    coverUrl: book.coverUrl || mock.coverUrl,
    coverGradient: book.coverGradient || mock.coverGradient,
    coverAccent: book.coverAccent || mock.coverAccent,
    synopsis: book.synopsis?.trim() ? book.synopsis : mock.synopsis,
    author: book.author || mock.author,
    authorId: book.authorId || mock.authorId,
    genre: book.genre || mock.genre,
    genres: book.genres?.length ? book.genres : mock.genres,
    rating: typeof book.rating === "number" ? book.rating : mock.rating,
    membershipPrice: DEFAULT_SUBSCRIPTION_PRICE,
  };
}
