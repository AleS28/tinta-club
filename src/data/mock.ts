import { joseOdiseaRobotChapters } from "./jose-odisea-robot-chapters";
import { pedroAmorCafeChapters } from "./pedro-amor-cafe-chapters";
import { pedroElTitereChapters } from "./pedro-el-titere-chapters";
import { willChicaCafeChapters } from "./will-chica-cafe-chapters";
import { willWhiskyChapters } from "./will-whisky-chapters";

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
  /** Precio USD compra directa del libro completo */
  directBookPriceUsd?: number;
  /** Precio USD por capítulo premium (fallback libro) */
  directChapterPriceUsd?: number;
  /** Modo de venta en tienda: libro completo o capítulo a capítulo */
  saleMode?: "book" | "chapter";
  /** Etiquetas de género detalladas para mostrar en ficha y catálogo */
  genres?: string[];
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
  membershipPrice: 6.49,
  saleMode: "book",
  directBookPriceUsd: 12.99,
};

export const pedroElTitereBook: Book = {
  id: "pedro-el-titere",
  title: "El Títere: La llamada de Nyarl'kthar",
  author: "Pedro García Martínez",
  authorId: "author-pedro-garcia",
  genre: "Terror",
  genres: ["Terror psicológico", "Horror cósmico"],
  rating: 4.7,
  coverGradient: "from-slate-950 via-blue-950 to-stone-900",
  coverAccent: "#1E3A5F",
  coverUrl: "/authors/pedro-garcia-martinez/el-titere-cover.png",
  synopsis:
    "Elena acepta una invitación inocente a pasar el fin de semana en una cabaña de montaña con Carlos y un grupo de amigos. Lo que empieza como risas junto al lago y confesiones nocturnas se convierte en pesadilla cuando un títere de madera despierta una sombra antigua. Entre la medianoche, el lago y la llamada de Nyarl'kthar, el terror deja de ser leyenda y se vuelve carne.",
  membershipPrice: 6.49,
  saleMode: "book",
  directBookPriceUsd: 12.99,
};

export const willChicaCafeBook: Book = {
  id: "will-chica-cafe",
  title: "La chica del café",
  author: "Will Flechas",
  authorId: "author-will-flechas",
  genre: "Romance",
  rating: 4.7,
  coverGradient: "from-stone-700 via-amber-900 to-stone-950",
  coverAccent: "#A16207",
  coverUrl: "/authors/will-flechas/la-chica-del-cafe-cover.png",
  synopsis:
    "Un hombre solitario vive hipnotizado por la sonrisa de la barista que le sirve café los sábados. Entre el aroma del espresso, la timidez compartida y las ilusiones que lo mantienen respirando, descubre que a veces el amor —o la idea de amor— puede ser tan intenso como una taza recién servida.",
  membershipPrice: 6.49,
  saleMode: "chapter",
  directChapterPriceUsd: 1.49,
};

export const joseOdiseaRobotBook: Book = {
  id: "jose-odisea-robot-guerra",
  title: "Una odisea a través del tiempo: Un robot para la guerra",
  author: "José Luis Grimaldo",
  authorId: "author-jose-luis-grimaldo",
  genre: "Ciencia Ficción",
  genres: ["Ciencia ficción", "Drama", "Robótica"],
  rating: 4.6,
  coverGradient: "from-slate-900 via-cyan-950 to-stone-950",
  coverAccent: "#22D3EE",
  coverUrl: "/authors/jose-luis-grimaldo/odisea-robot-guerra-cover.png",
  synopsis:
    "Satoshi es un niño brillante que crece entre mudanzas, la ausencia de su padre soldado y una amistad con Robert que parece no tener fin. Años después, su genio lo lleva a diseñar Artur, un robot humanoide capaz de rescatar vidas con una precisión casi humana. Pero cuando el gobierno quiere convertir su invento en herramienta de guerra, Satoshi deberá elegir entre el éxito, la seguridad de quienes ama y la convicción de que sus creaciones no deben servir para destruir.",
  membershipPrice: 6.49,
  saleMode: "chapter",
  directChapterPriceUsd: 1.49,
};

export const willWhiskyBook: Book = {
  id: "will-whisky-por-favor",
  title: "Un whisky, por favor",
  author: "Will Flechas",
  authorId: "author-will-flechas",
  genre: "Romance",
  rating: 4.6,
  coverGradient: "from-slate-800 via-amber-950 to-stone-900",
  coverAccent: "#92400E",
  coverUrl: "/authors/will-flechas/un-whisky-por-favor-cover.png",
  synopsis:
    "Un muchacho escapa de las preguntas de su madre rumbo a un bar, arrastrando el recuerdo de su padre, una cerveza rota a los siete años y el retrato silencioso que lo escucha sin juzgar. Entre el tráfico, el whisky pedido con valentía y una mesera que no lo mira, descubrirá que la infancia tiene formas extrañas de volver cuando menos lo esperas.",
  membershipPrice: 6.49,
  saleMode: "book",
  directBookPriceUsd: 9.99,
};

/** Obra en primera plana del home */
export const featuredBook = pedroAmorCafeBook;

export const sideBooks: Book[] = [
  pedroElTitereBook,
  willChicaCafeBook,
  willWhiskyBook,
  joseOdiseaRobotBook,
];

export const genres: { id: Genre; icon: string; color: string }[] = [
  { id: "Romance", icon: "heart", color: "bg-rose-100 text-rose-600 hover:bg-rose-200" },
  { id: "Fantasía", icon: "sparkles", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" },
  { id: "Terror", icon: "ghost", color: "bg-slate-200 text-slate-700 hover:bg-slate-300" },
  { id: "Ciencia Ficción", icon: "rocket", color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" },
];

export const books: Book[] = [
  pedroElTitereBook,
  willChicaCafeBook,
  willWhiskyBook,
  joseOdiseaRobotBook,
];

export const topAuthors: Author[] = [
  {
    id: "author-pedro-garcia",
    name: "Pedro García Martínez",
    initials: "PG",
    avatarColor: "bg-amber-700",
    bookCount: 2,
    slug: "pedro-garcia-martinez",
  },
  {
    id: "author-will-flechas",
    name: "Will Flechas",
    initials: "WF",
    avatarColor: "bg-stone-700",
    bookCount: 2,
    slug: "will-flechas",
  },
  {
    id: "author-jose-luis-grimaldo",
    name: "José Luis Grimaldo",
    initials: "JG",
    avatarColor: "bg-cyan-900",
    bookCount: 1,
    slug: "jose-luis-grimaldo",
  },
];

export const chapters: Chapter[] = [
  ...pedroAmorCafeChapters,
  ...pedroElTitereChapters,
  ...willChicaCafeChapters,
  ...willWhiskyChapters,
  ...joseOdiseaRobotChapters,
];

export const allBooks: Book[] = [
  pedroAmorCafeBook,
  pedroElTitereBook,
  willChicaCafeBook,
  willWhiskyBook,
  joseOdiseaRobotBook,
];

export function getBookGenreDisplay(book: Book): string {
  if (book.genres?.length) return book.genres.join(" · ");
  return book.genre;
}

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
