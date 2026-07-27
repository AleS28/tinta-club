import { getChaptersByBookId, type Book } from "@/data/mock";

export interface BookMeta {
  chapterCount: number;
  readingTimeMinutes: number;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getBookMeta(bookId: string, fallbackSynopsis = ""): BookMeta {
  const chapters = getChaptersByBookId(bookId);

  if (chapters.length === 0) {
    const synopsisWords = countWords(fallbackSynopsis.replace(/<[^>]+>/g, " "));
    const readingTimeMinutes = Math.max(8, Math.round(synopsisWords / 180) + 5);
    return { chapterCount: 0, readingTimeMinutes };
  }

  const totalWords = chapters.reduce(
    (sum, chapter) =>
      sum + chapter.content.reduce((chapterSum, paragraph) => chapterSum + countWords(paragraph), 0),
    0,
  );

  return {
    chapterCount: chapters.length,
    readingTimeMinutes: Math.max(5, Math.round(totalWords / 200)),
  };
}

export function buildBookMetaMap(books: Book[]): Record<string, BookMeta> {
  return Object.fromEntries(books.map((book) => [book.id, getBookMeta(book.id, book.synopsis)]));
}
