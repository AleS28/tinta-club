import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { Book } from "@/data/mock";
import { BookCoverPlaceholder } from "@/components/ui/BookCoverPlaceholder";
import type { BookMeta } from "@/lib/book-meta";

interface FeaturedTopBookCardProps {
  book: Book;
  meta: BookMeta;
  rank: number;
}

export function FeaturedTopBookCard({ book, meta, rank }: FeaturedTopBookCardProps) {
  return (
    <Link
      href={`/libro/${book.id}`}
      className="group relative flex h-[320px] w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-home-gold/30 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:border-home-gold/60 sm:h-[360px] sm:w-[220px] lg:h-[380px] lg:w-full lg:max-w-none lg:shrink"
    >
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverUrl}
          alt={book.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <BookCoverPlaceholder book={book} className="absolute inset-0 h-full w-full rounded-none" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

      <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-gold-cream backdrop-blur-sm">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        {book.rating.toFixed(1)}
      </div>

      <div className="absolute right-2.5 top-2.5 rounded-md bg-home-terracotta px-2 py-0.5 text-xs font-bold text-white shadow-md">
        #{rank}
      </div>

      <div className="relative mt-auto p-3 sm:p-4">
        <h3 className="font-display text-base font-bold leading-tight text-[#FCF9F5] sm:text-lg">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-[#FCF9F5]/75">{book.author}</p>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#FCF9F5]/80">
          <Clock className="h-3 w-3 shrink-0 text-home-gold" />
          <span>
            {meta.readingTimeMinutes} min
            {meta.chapterCount > 0 && ` · ${meta.chapterCount} capítulos`}
          </span>
        </div>

        <span className="mt-2.5 inline-block rounded-full border border-home-gold/40 bg-black/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-cream backdrop-blur-sm">
          {book.genre}
        </span>
      </div>
    </Link>
  );
}
