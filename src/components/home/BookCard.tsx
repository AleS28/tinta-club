import Link from "next/link";
import { BookOpen, Clock, Star } from "lucide-react";
import { Book, getBookGenreDisplay } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";
import { getBookMeta, type BookMeta } from "@/lib/book-meta";

interface BookCardProps {
  book: Book;
  meta?: BookMeta;
  variant?: "default" | "compact";
}

export function BookCard({ book, meta, variant = "default" }: BookCardProps) {
  const bookMeta = meta ?? getBookMeta(book.id, book.synopsis);

  if (variant === "compact") {
    return (
      <Link
        href={`/libro/${book.id}`}
        className="group flex w-[280px] shrink-0 gap-3 rounded-xl border border-amber-900/10 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-editorial-lg lg:w-full"
      >
        <div className="shrink-0 overflow-hidden rounded-lg">
          <BookCover book={book} className="h-[100px] w-[68px]" imageClassName="group-hover:scale-105" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="font-display text-sm font-bold leading-snug text-ink line-clamp-2 transition-colors group-hover:text-imperial-deep">
            {book.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted">{book.author}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-xs font-medium text-amber-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {book.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Clock className="h-3 w-3 text-terracotta/70" />
              {bookMeta.readingTimeMinutes} min
            </span>
          </div>

          <span className="mt-2 inline-flex w-fit rounded-full border border-amber-900/10 bg-sidebar px-2 py-0.5 text-[10px] font-medium text-imperial-deep">
            {getBookGenreDisplay(book)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/libro/${book.id}`}
      className="group block rounded-xl border border-amber-900/10 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial-lg"
    >
      <div className="overflow-hidden rounded-lg">
        <BookCover
          book={book}
          className="aspect-[2/3] w-full"
          imageClassName="group-hover:scale-105"
        />
      </div>

      <div className="mt-3">
        <h3 className="font-serif text-sm font-bold leading-snug text-ink line-clamp-2 transition-colors group-hover:text-imperial-deep">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted">{book.author}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-terracotta/70" />
            {bookMeta.readingTimeMinutes} min
          </span>
          {bookMeta.chapterCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-terracotta/70" />
              {bookMeta.chapterCount} caps
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="rounded-full border border-amber-900/10 bg-sidebar px-2.5 py-0.5 text-[11px] font-medium text-imperial-deep">
            {getBookGenreDisplay(book)}
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-700">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {book.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
