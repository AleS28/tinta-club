import Link from "next/link";
import { Star } from "lucide-react";
import { Book } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/libro/${book.id}`} className="group block">
      <BookCover
        book={book}
        className="aspect-[2/3] w-full shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
      />
      <div className="mt-3">
        <h3 className="font-serif text-sm font-bold leading-snug text-ink line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted">{book.author}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="rounded-full bg-sidebar px-2 py-0.5 text-xs text-muted">
            {book.genre}
          </span>
          <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {book.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
