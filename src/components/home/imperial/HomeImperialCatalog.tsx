import { Book } from "@/data/mock";
import type { BookMeta } from "@/lib/book-meta";
import { ImperialBookCard } from "@/components/home/imperial/ImperialBookCard";

interface HomeImperialCatalogProps {
  books: Book[];
  metaByBookId: Record<string, BookMeta>;
}

export function HomeImperialCatalog({ books, metaByBookId }: HomeImperialCatalogProps) {
  const catalog = [...books].sort((a, b) => b.rating - a.rating);

  if (catalog.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-imperial-gold/30" aria-hidden />
        <h2 className="font-display text-lg font-bold uppercase tracking-[0.1em] text-imperial-gold sm:text-xl">
          Catálogo del Imperio
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-imperial-gold/30" aria-hidden />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-2">
        {catalog.map((book) => (
          <ImperialBookCard
            key={book.id}
            book={book}
            meta={
              metaByBookId[book.id] ?? {
                chapterCount: 0,
                readingTimeMinutes: 10,
              }
            }
          />
        ))}
      </div>
    </section>
  );
}
