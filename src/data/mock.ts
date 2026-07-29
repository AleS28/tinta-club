import { pedroAmorCafeChapters } from "./pedro-amor-cafe-chapters";
import { willChicaCafeChapters } from "./will-chica-cafe-chapters";

export type Genre = "Romance" | "Fantasía" | "Terror" | "Ciencia Ficción";

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId: string;
  genre: Genre;
  rating: number;
  coverGradient: string;
  coverAccent: string;
  synopsis: string;
  coverUrl?: string;
  membershipPrice?: number;
}

export interface Author {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  bookCount: number;
  slug?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  isPremium: boolean;
  content: string[];
}

export const pedroAmorCafeBook: Book = {
  id: "pedro-amor-cafe",
  title: "Amor con aroma a café",
  author: "Pedro García Martínez",
  authorId: "author-pedro-garcia",
  genre: "Romance",
  rating: 4.8,
  coverGradient: "from-amber-700 via-orange-500 to-amber-900",
  coverAccent: "#D27C5A",
  coverUrl: "/authors/pedro-garcia-martinez/amor-aroma-cafe-cover.png",
  synopsis:
    "Pedro y Kaori intentan sostener una relación construida sobre pequeños gestos y la ternura de lo cotidiano. Sin embargo, su refugio doméstico se ve amenazado por la realidad: mientras él lidia con la precariedad laboral, ella enfrenta en secreto el acoso de un jefe depredador. Entre silencios y «cenas tregua», la pareja lucha por mantener a flote su amor antes de que el agotamiento y las verdades no dichas terminen por romper su equilibrio.",
  membershipPrice: 5,
};

export const willChicaCafeBook: Book = {
  id: "will-chica-cafe",
  title: "La chica del café",
  author: "WillFlechas",
  authorId: "author-will-flechas",
  genre: "Romance",
  rating: 4.7,
  coverGradient: "from-stone-700 via-amber-900 to-stone-950",
  coverAccent: "#A16207",
  synopsis:
    "Un hombre solitario vive hipnotizado por la sonrisa de la barista que le sirve café los sábados. Entre el aroma del espresso, la timidez compartida y las ilusiones que lo mantienen respirando, descubre que a veces el amor —o la idea de amor— puede ser tan intenso como una taza recién servida.",
  membershipPrice: 5,
};

/** Obra en primera plana del home */
export const featuredBook = pedroAmorCafeBook;

export const sideBooks: Book[] = [willChicaCafeBook];

export const genres: { id: Genre; icon: string; color: string }[] = [
  { id: "Romance", icon: "heart", color: "bg-rose-100 text-rose-600 hover:bg-rose-200" },
  { id: "Fantasía", icon: "sparkles", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" },
  { id: "Terror", icon: "ghost", color: "bg-slate-200 text-slate-700 hover:bg-slate-300" },
  { id: "Ciencia Ficción", icon: "rocket", color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" },
];

export const books: Book[] = [willChicaCafeBook];

export const topAuthors: Author[] = [
  {
    id: "author-pedro-garcia",
    name: "Pedro García Martínez",
    initials: "PG",
    avatarColor: "bg-amber-700",
    bookCount: 1,
    slug: "pedro-garcia-martinez",
  },
  {
    id: "author-will-flechas",
    name: "WillFlechas",
    initials: "WF",
    avatarColor: "bg-stone-700",
    bookCount: 1,
    slug: "will-flechas",
  },
];

export const chapters: Chapter[] = [...pedroAmorCafeChapters, ...willChicaCafeChapters];

export const allBooks: Book[] = [pedroAmorCafeBook, willChicaCafeBook];

export function getBookById(id: string): Book | undefined {
  return allBooks.find((book) => book.id === id);
}

export function getAuthorById(id: string): Author | undefined {
  return topAuthors.find((author) => author.id === id);
}

export function getChaptersByBookId(bookId: string): Chapter[] {
  return chapters
    .filter((chapter) => chapter.bookId === bookId)
    .sort((a, b) => a.number - b.number);
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

export function getAdjacentChapters(chapterId: string): {
  prev: Chapter | null;
  next: Chapter | null;
} {
  const current = getChapterById(chapterId);
  if (!current) return { prev: null, next: null };

  const bookChapters = getChaptersByBookId(current.bookId);
  const index = bookChapters.findIndex((c) => c.id === chapterId);

  return {
    prev: index > 0 ? bookChapters[index - 1] : null,
    next: index < bookChapters.length - 1 ? bookChapters[index + 1] : null,
  };
}

export function getFirstChapter(bookId: string): Chapter | undefined {
  return getChaptersByBookId(bookId)[0];
}

export function getAuthorProfileHref(authorId: string): string {
  const author = getAuthorById(authorId);
  return author?.slug ? `/autor/${author.slug}` : `/perfil/${authorId}`;
}
