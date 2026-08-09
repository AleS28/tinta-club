import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getBookById, getChaptersByBookId } from "@/lib/db";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BookCover } from "@/components/ui/BookCover";
import { ChapterList } from "@/components/libro/ChapterList";
import { StartReadingButton } from "@/components/auth/StartReadingButton";
import { FavoriteButton } from "@/components/libro/FavoriteButton";
import { BookSynopsis } from "@/components/libro/BookSynopsis";
import { BookLikeButton } from "@/components/social/BookLikeButton";
import { SupportAuthorButton } from "@/components/social/SupportAuthorButton";
import { FollowAuthorButton } from "@/components/perfil/FollowAuthorButton";
import { getBookGenreDisplay } from "@/data/mock";

export const dynamic = "force-dynamic";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: "Libro no encontrado" };

  return {
    title: `${book.title} — ${BRAND_NAME}`,
    description: book.synopsis,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  const chapters = await getChaptersByBookId(id);
  const firstChapter = chapters[0];

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <BookCover
            book={book}
            showOverlay={!book.coverUrl}
            className="mx-auto aspect-[2/3] w-48 shrink-0 shadow-xl sm:mx-0 sm:w-56"
          />

          <div className="flex-1 text-center sm:text-left">
            <span className="inline-block rounded-full bg-sidebar px-3 py-1 text-xs font-medium text-muted">
              {getBookGenreDisplay(book)}
            </span>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {book.title}
            </h1>

            <p className="mt-2 text-muted">
              por{" "}
              <Link
                href={`/perfil/${book.authorId}`}
                className="font-medium text-terracotta underline-offset-2 hover:underline"
              >
                {book.author}
              </Link>
            </p>

            <div className="mt-3 flex items-center justify-center gap-1 sm:justify-start">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-semibold text-ink">{book.rating.toFixed(1)}</span>
              <span className="text-sm text-muted">/ 5.0</span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              {firstChapter && (
                <StartReadingButton
                  href={`/leer/${firstChapter.id}`}
                  className="inline-flex rounded-full bg-terracotta px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700"
                />
              )}
              <FavoriteButton bookId={book.id} />
              <BookLikeButton bookId={book.id} />
              <FollowAuthorButton authorId={book.authorId} redirectPath={`/libro/${book.id}`} />
              <SupportAuthorButton
                authorId={book.authorId}
                authorName={book.author}
                redirectTo={`/libro/${book.id}`}
                variant="primary"
              />
            </div>
          </div>
        </header>

        <BookSynopsis synopsis={book.synopsis} />

        {chapters.length > 0 ? (
          <div className="mt-10">
            <ChapterList chapters={chapters} />
          </div>
        ) : (
          <p className="mt-10 rounded-2xl bg-sidebar px-5 py-4 text-sm text-muted">
            Los capítulos de esta obra estarán disponibles pronto.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
