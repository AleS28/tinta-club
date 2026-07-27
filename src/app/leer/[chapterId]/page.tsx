import { notFound } from "next/navigation";
import { getAdjacentChapters, getBookById, getChapterById } from "@/lib/db";
import { ReaderView } from "@/components/leer/ReaderView";
import { BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export async function generateMetadata({ params }: ReaderPageProps) {  const { chapterId } = await params;
  const chapter = await getChapterById(chapterId);
  const book = chapter ? await getBookById(chapter.bookId) : undefined;

  if (!chapter || !book) return { title: "Capítulo no encontrado" };

  return {
    title: `${chapter.title} — ${book.title} | ${BRAND_NAME}`,
  };
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { chapterId } = await params;
  const chapter = await getChapterById(chapterId);

  if (!chapter) notFound();

  const book = await getBookById(chapter.bookId);
  if (!book) notFound();

  const { prev, next } = await getAdjacentChapters(chapterId);

  return (
    <ReaderView chapter={chapter} book={book} prevChapter={prev} nextChapter={next} />
  );
}
