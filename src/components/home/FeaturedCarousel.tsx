import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Book, featuredBook, sideBooks } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";

function FeaturedCard({ book, size = "large" }: { book: Book; size?: "large" | "small" }) {
  const isLarge = size === "large";

  return (
    <Link
      href={`/libro/${book.id}`}
      className={`relative block transition-transform hover:scale-[1.02] ${isLarge ? "flex-1" : "w-24 shrink-0 opacity-70 lg:w-28"}`}
    >
      <BookCover
        book={book}
        showOverlay={isLarge}
        className={`w-full shadow-lg ${isLarge ? "aspect-[3/4] min-h-[280px] lg:min-h-[340px]" : "aspect-[2/3]"}`}
      />
      {isLarge && (
        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
          <span className="rounded-full bg-terracotta/90 px-2.5 py-0.5 text-xs font-medium text-white">
            Novedad
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold text-white lg:text-2xl">
            {book.title}
          </h3>
          <p className="text-sm text-white/80">por {book.author}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
              {book.genre}
            </span>
            <span className="flex items-center gap-1 text-sm text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-300" />
              {book.rating.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

export function FeaturedCarousel() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-ink">Novedades</h2>
        <div className="flex gap-2">
          <button
            aria-label="Anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-muted/30 text-muted transition-colors hover:border-terracotta hover:text-terracotta"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-muted/30 text-muted transition-colors hover:border-terracotta hover:text-terracotta"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end gap-3 lg:gap-4">
        <FeaturedCard book={sideBooks[0]} size="small" />
        <FeaturedCard book={featuredBook} size="large" />
        <FeaturedCard book={sideBooks[1]} size="small" />
      </div>
    </section>
  );
}
