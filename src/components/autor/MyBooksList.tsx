"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Book } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";

interface MyBooksListProps {
  books: Book[];
  chapterCounts: Record<string, number>;
}

export function MyBooksList({ books, chapterCounts }: MyBooksListProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sidebar bg-white/50 px-6 py-12 text-center">
        <p className="font-serif text-lg font-bold text-ink">Aún no has publicado libros</p>
        <p className="mt-2 text-sm text-muted">
          Ve a la pestaña &quot;Publicar&quot; para crear tu primera obra.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {books.map((book) => (
        <li
          key={book.id}
          className="flex gap-4 rounded-2xl border border-sidebar bg-white/70 p-4 shadow-sm"
        >
          <BookCover book={book} className="h-24 w-16 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sidebar px-2.5 py-0.5 text-xs text-muted">
                {book.genre}
              </span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-ink">{book.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{book.synopsis}</p>
            <p className="mt-2 text-xs text-muted">
              {chapterCounts[book.id] ?? 0} capítulo{(chapterCounts[book.id] ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/libro/${book.id}`}
            className="flex shrink-0 items-center gap-1 self-start rounded-full border border-sidebar px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-terracotta hover:text-terracotta"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Link>
        </li>
      ))}
    </ul>
  );
}
