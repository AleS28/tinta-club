import { Book } from "@/data/mock";

interface BookCoverPlaceholderProps {
  book: Book;
  className?: string;
}

export function BookCoverPlaceholder({ book, className = "" }: BookCoverPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-[#8B3A2B] via-terracotta to-[#F4EFE6] p-[3px] shadow-editorial ${className}`}
    >
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[5px] bg-gradient-to-br from-imperial-dark via-[#5C2E24] to-[#8B3A2B] p-4">
        <div
          className="pointer-events-none absolute inset-2 rounded border border-gold/40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-3 rounded border border-gold/20"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(245,230,200,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(201,169,97,0.2) 0%, transparent 40%)",
          }}
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-3 text-center">
          <div className="mb-3 h-px w-10 bg-gold/60" />
          <p className="font-serif text-base font-bold leading-tight text-gold-cream sm:text-lg">
            {book.title}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold-light/80 sm:text-xs">
            {book.author}
          </p>
          <div className="mt-3 h-px w-10 bg-gold/40" />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
