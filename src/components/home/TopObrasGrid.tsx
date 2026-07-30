import { Trophy } from "lucide-react";
import { Book } from "@/data/mock";
import type { BookMeta } from "@/lib/book-meta";
import { FeaturedTopBookCard } from "@/components/home/FeaturedTopBookCard";

interface TopObrasGridProps {
  books: Book[];
  metaByBookId: Record<string, BookMeta>;
}

export function TopObrasGrid({ books, metaByBookId }: TopObrasGridProps) {
  const topBooks = [...books]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  if (topBooks.length === 0) return null;

  return (
    <section className="bg-home-dark px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-home-gold/25 bg-[#1F1510]/60 p-5 shadow-editorial-lg sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-home-gold" aria-hidden />
            <h2 className="font-display text-lg font-bold uppercase tracking-[0.12em] text-gold-cream sm:text-xl">
              Top de Obras Destacadas
            </h2>
          </div>

          <div className="home-scroll-snap-x -mx-1 flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-home-gold/30 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible">
            {topBooks.map((book, index) => (
              <FeaturedTopBookCard
                key={book.id}
                book={book}
                rank={index + 1}
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
      </div>
    </section>
  );
}
