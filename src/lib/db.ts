import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  allBooks,
  chapters as mockChapters,
  getBookById as getMockBookById,
  getChapterById as getMockChapterById,
  getChaptersByBookId as getMockChaptersByBookId,
  type Book,
  type Chapter,
  type Genre,
} from "@/data/mock";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const GENRE_GRADIENTS: Record<Genre, { gradient: string; accent: string }> = {
  Romance: { gradient: "from-rose-300 via-rose-400 to-pink-500", accent: "#FB7185" },
  Fantasía: { gradient: "from-emerald-600 via-teal-600 to-cyan-700", accent: "#14B8A6" },
  Terror: { gradient: "from-gray-700 via-gray-800 to-black", accent: "#374151" },
  "Ciencia Ficción": { gradient: "from-blue-600 via-indigo-700 to-purple-800", accent: "#4F46E5" },
};

async function fetchBooksFromFirestore(): Promise<Book[]> {
  if (!db || !isFirebaseConfigured) return [];

  const snapshot = await getDocs(collection(db, "books"));
  if (snapshot.empty) return [];

  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Book));
}

async function fetchChaptersFromFirestore(bookId?: string): Promise<Chapter[]> {
  if (!db || !isFirebaseConfigured) return [];

  const chaptersRef = collection(db, "chapters");
  const snapshot = bookId
    ? await getDocs(query(chaptersRef, where("bookId", "==", bookId)))
    : await getDocs(chaptersRef);

  if (snapshot.empty) return [];

  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Chapter))
    .sort((a, b) => a.number - b.number);
}

function mergeBooks(firestoreBooks: Book[]): Book[] {
  if (firestoreBooks.length === 0) return allBooks;

  const firestoreIds = new Set(firestoreBooks.map((book) => book.id));
  const mockOnly = allBooks.filter((book) => !firestoreIds.has(book.id));
  return [...firestoreBooks, ...mockOnly];
}

export async function getBooks(): Promise<Book[]> {
  try {
    const firestoreBooks = await fetchBooksFromFirestore();
    return mergeBooks(firestoreBooks);
  } catch {
    return allBooks;
  }
}

export async function getBookById(id: string): Promise<Book | undefined> {
  try {
    if (db && isFirebaseConfigured) {
      const docSnap = await getDoc(doc(db, "books", id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Book;
      }
    }
  } catch {
    // fallback to mock
  }

  return getMockBookById(id);
}

export async function getChaptersByBookId(bookId: string): Promise<Chapter[]> {
  try {
    const firestoreChapters = await fetchChaptersFromFirestore(bookId);
    if (firestoreChapters.length > 0) return firestoreChapters;
  } catch {
    // fallback to mock
  }

  return getMockChaptersByBookId(bookId);
}

export async function getChapterById(chapterId: string): Promise<Chapter | undefined> {
  try {
    if (db && isFirebaseConfigured) {
      const docSnap = await getDoc(doc(db, "chapters", chapterId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Chapter;
      }
    }
  } catch {
    // fallback to mock
  }

  return getMockChapterById(chapterId);
}

export async function getAllChapters(): Promise<Chapter[]> {
  try {
    const firestoreChapters = await fetchChaptersFromFirestore();
    if (firestoreChapters.length > 0) {
      const firestoreIds = new Set(firestoreChapters.map((c) => c.id));
      const mockOnly = mockChapters.filter((c) => !firestoreIds.has(c.id));
      return [...firestoreChapters, ...mockOnly];
    }
  } catch {
    // fallback to mock
  }

  return mockChapters;
}

export async function getBooksByAuthorId(
  authorId: string,
  legacyAuthorId?: string,
): Promise<Book[]> {
  let firestoreBooks: Book[] = [];

  try {
    if (db && isFirebaseConfigured) {
      const snapshot = await getDocs(
        query(collection(db, "books"), where("authorId", "==", authorId)),
      );
      firestoreBooks = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Book))
        .sort((a, b) => a.title.localeCompare(b.title));
    }
  } catch {
    // ignore
  }

  const matchesAuthor = (book: Book) =>
    book.authorId === authorId ||
    (!!legacyAuthorId && book.authorId === legacyAuthorId);

  const mockBooks = allBooks.filter(matchesAuthor);
  if (firestoreBooks.length === 0) return mockBooks;

  const firestoreIds = new Set(firestoreBooks.map((book) => book.id));
  const mockOnly = mockBooks.filter((book) => !firestoreIds.has(book.id));
  return [...firestoreBooks, ...mockOnly];
}

export async function getChaptersByAuthorBooks(bookIds: string[]): Promise<Chapter[]> {
  if (bookIds.length === 0) return [];

  const all: Chapter[] = [];
  for (const bookId of bookIds) {
    const chapters = await getChaptersByBookId(bookId);
    all.push(...chapters);
  }
  return all;
}

export interface CreateBookInput {
  title: string;
  synopsis: string;
  genre: Genre;
  coverUrl?: string;
  membershipPrice?: number;
  authorId: string;
  authorName: string;
}

export interface CreateChapterInput {
  bookId: string;
  number: number;
  title: string;
  content: string[];
  isPremium: boolean;
}

export async function createBook(input: CreateBookInput, authorUid?: string): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  if (authorUid) {
    const userSnap = await getDoc(doc(db, "users", authorUid));
    const userData = userSnap.data();
    const isAdmin = userData?.role === "admin";
    if (!isAdmin && userData?.agreementSigned !== true) {
      throw new Error(
        "Debes firmar el acuerdo de autor en /autor/acuerdo antes de publicar cualquier obra.",
      );
    }
  }

  const bookRef = doc(collection(db, "books"));
  const style = GENRE_GRADIENTS[input.genre];

  const book: Book = {
    id: bookRef.id,
    title: input.title,
    synopsis: input.synopsis,
    genre: input.genre,
    author: input.authorName,
    authorId: input.authorId,
    rating: 5.0,
    coverGradient: style.gradient,
    coverAccent: style.accent,
    coverUrl: input.coverUrl || undefined,
    membershipPrice: input.membershipPrice ?? 4.99,
  };

  await setDoc(bookRef, book);
  return bookRef.id;
}

export async function createChapter(input: CreateChapterInput, authorUid?: string): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  if (authorUid) {
    const userSnap = await getDoc(doc(db, "users", authorUid));
    const userData = userSnap.data();
    const isAdmin = userData?.role === "admin";
    if (!isAdmin && userData?.agreementSigned !== true) {
      throw new Error(
        "Debes firmar el acuerdo de autor en /autor/acuerdo antes de publicar cualquier capítulo.",
      );
    }
  }

  const chapterId = `${input.bookId}-cap-${input.number}`;
  const chapterRef = doc(db, "chapters", chapterId);

  const chapter: Chapter = {
    id: chapterId,
    bookId: input.bookId,
    number: input.number,
    title: input.title,
    content: input.content,
    isPremium: input.isPremium,
  };

  await setDoc(chapterRef, chapter);
  return chapterId;
}

export async function promoteUserToAuthor(uid: string): Promise<void> {
  if (!db || !isFirebaseConfigured) return;
  await setDoc(doc(db, "users", uid), { role: "author" }, { merge: true });
}

export function getGenreStyle(genre: Genre) {
  return GENRE_GRADIENTS[genre];
}

export async function getAdjacentChapters(chapterId: string): Promise<{
  prev: Chapter | null;
  next: Chapter | null;
}> {
  const current = await getChapterById(chapterId);
  if (!current) return { prev: null, next: null };

  const bookChapters = await getChaptersByBookId(current.bookId);
  const index = bookChapters.findIndex((c) => c.id === chapterId);

  return {
    prev: index > 0 ? bookChapters[index - 1] : null,
    next: index < bookChapters.length - 1 ? bookChapters[index + 1] : null,
  };
}
