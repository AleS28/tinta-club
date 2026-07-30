import { Book } from "@/data/mock";
import type { BookMeta } from "@/lib/book-meta";
import { BookCard } from "@/components/home/BookCard";

interface LatestNewsSectionProps {
  books: Book[];
  metaByBookId: Record<string, BookMeta>;
}

export function LatestNewsSection({ books, metaByBookId }: LatestNewsSectionProps) {
  const latestBooks = [...books]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  if (latestBooks.length === 0) return null;

  return (
    <section className="px-4 pb-12 sm:px-6 sm:pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="ornamental-divider w-full max-w-md" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-[#2A1D17] sm:text-3xl">
            Últimas Novedades
          </h2>
          <div className="ornamental-divider w-full max-w-md" aria-hidden />
        </div>

        <div className="home-scroll-snap-x flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible xl:grid-cols-3">
          {latestBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="compact"
              meta={
                metaByBookId[book.id] ?? {
                  chapterCount: 0,
                  readingTimeMinutes: 10,
                }
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
