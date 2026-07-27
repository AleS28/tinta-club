import { Book } from "@/data/mock";

interface BookCoverProps {
  book: Book;
  className?: string;
  showOverlay?: boolean;
}

export function BookCover({ book, className = "", showOverlay = false }: BookCoverProps) {
  if (book.coverUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover"
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

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${book.coverGradient} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, white 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-white">
        <div
          className="mb-auto mt-6 h-1 w-8 rounded-full opacity-60"
          style={{ backgroundColor: book.coverAccent }}
        />
        {showOverlay && (
          <>
            <p className="font-serif text-sm font-bold leading-tight drop-shadow-md">
              {book.title}
            </p>
            <p className="mt-1 text-xs opacity-80">{book.author}</p>
          </>
        )}
      </div>
    </div>
  );
}
