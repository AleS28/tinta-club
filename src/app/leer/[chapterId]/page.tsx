import { notFound } from "next/navigation";
import { getAdjacentChapters, getBookById, getChapterById, getChaptersByBookId } from "@/lib/db";
import { stripPremiumChapterContent } from "@/lib/chapter-access";
import { ReaderView } from "@/components/leer/ReaderView";
import { BRAND_NAME } from "@/lib/brand";
import { buildChapterMetadata } from "@/lib/metadata-og";

export const dynamic = "force-dynamic";

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export async function generateMetadata({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  const chapter = await getChapterById(chapterId);
  const book = chapter ? await getBookById(chapter.bookId) : undefined;

  if (!chapter || !book) return { title: "Capítulo no encontrado" };

  return buildChapterMetadata(chapter.title, book, chapterId);
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  const chapter = await getChapterById(chapterId);

  if (!chapter) notFound();

  const book = await getBookById(chapter.bookId);
  if (!book) notFound();

  const chapters = await getChaptersByBookId(chapter.bookId);
  const { prev, next } = await getAdjacentChapters(chapterId);
  const safeChapter = stripPremiumChapterContent(chapter);

  return (
    <ReaderView
      chapter={safeChapter}
      book={book}
      chapters={chapters}
      prevChapter={prev}
      nextChapter={next}
    />
  );
}
