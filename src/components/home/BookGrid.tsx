import { Book } from "@/data/mock";
import { BookCard } from "@/components/home/BookCard";
import type { BookMeta } from "@/lib/book-meta";

interface BookGridProps {
  books: Book[];
  metaByBookId: Record<string, BookMeta>;
}

export function BookGrid({ books, metaByBookId }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-amber-900/15 bg-white/60 px-6 py-12 text-center">
        <p className="font-serif text-lg text-ink">No hay historias en esta categoría</p>
        <p className="mt-1 text-sm text-muted">Prueba con otro género o explora todas las obras.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink">Novedades</h2>
          <p className="mt-1 text-sm text-muted">
            {books.length} {books.length === 1 ? "historia" : "historias"} en el catálogo
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            meta={metaByBookId[book.id] ?? { chapterCount: 0, readingTimeMinutes: 10 }}
          />
        ))}
      </div>
    </section>
  );
}
