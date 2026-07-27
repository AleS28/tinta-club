import { Book } from "@/data/mock";
import { BookCoverPlaceholder } from "@/components/ui/BookCoverPlaceholder";

interface BookCoverProps {
  book: Book;
  className?: string;
  showOverlay?: boolean;
  imageClassName?: string;
}

export function BookCover({
  book,
  className = "",
  showOverlay = false,
  imageClassName = "",
}: BookCoverProps) {
  if (!book.coverUrl) {
    return <BookCoverPlaceholder book={book} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.coverUrl}
        alt={book.title}
        className={`h-full w-full object-cover transition-transform duration-300 ${imageClassName}`}
      />
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="font-serif text-sm font-bold leading-tight text-white drop-shadow-md">
            {book.title}
          </p>
          <p className="mt-1 text-xs text-white/80">{book.author}</p>
        </div>
      )}
    </div>
  );
}
