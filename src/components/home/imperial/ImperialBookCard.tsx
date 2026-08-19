import Link from "next/link";
import { BookOpen, Clock, Star } from "lucide-react";
import { Book, getBookGenreDisplay } from "@/data/mock";
import { BookCoverPlaceholder } from "@/components/ui/BookCoverPlaceholder";
import type { BookMeta } from "@/lib/book-meta";

interface ImperialBookCardProps {
  book: Book;
  meta: BookMeta;
}

export function ImperialBookCard({ book, meta }: ImperialBookCardProps) {
  return (
    <Link
      href={`/libro/${book.id}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-xl border border-imperial-gold/20 bg-imperial-surface shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-imperial-gold/45 hover:shadow-[0_12px_32px_-8px_rgba(212,175,55,0.2)]"
    >
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverUrl}
          alt={book.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <BookCoverPlaceholder book={book} className="absolute inset-0 h-full w-full rounded-none" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-imperial-gold backdrop-blur-sm">
        <Star className="h-3 w-3 fill-imperial-gold text-imperial-gold" />
        {book.rating.toFixed(1)}
      </div>

      <div className="relative mt-auto p-3 sm:p-4">
        <h3 className="font-display text-base font-bold leading-tight text-gold-cream sm:text-lg">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-gold-cream/75">{book.author}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gold-cream/70">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-imperial-gold" />
            {meta.readingTimeMinutes} min
          </span>
          {meta.chapterCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-imperial-gold" />
              {meta.chapterCount} caps
            </span>
          )}
        </div>

        <span className="mt-2.5 inline-block rounded-full border border-imperial-gold/35 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-cream/90 backdrop-blur-sm">
          {getBookGenreDisplay(book)}
        </span>
      </div>
    </Link>
  );
}
