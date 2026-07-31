"use client";

import Link from "next/link";
import { BookOpen, Crown, Infinity, Loader2, Star } from "lucide-react";
import type { StoreBookListing } from "@/types/monetization";
import { BookCover } from "@/components/ui/BookCover";
import type { Book } from "@/data/mock";

interface StoreBookCardProps {
  listing: StoreBookListing;
  owned?: boolean;
  onPurchase?: (bookId: string) => void;
  purchaseLoading?: boolean;
}

function toBook(listing: StoreBookListing): Book {
  return {
    id: listing.bookId,
    title: listing.title,
    author: listing.author,
    authorId: listing.authorId,
    genre: listing.genre as Book["genre"],
    rating: listing.rating,
    coverGradient: listing.coverGradient,
    coverAccent: listing.coverAccent,
    synopsis: listing.synopsis,
    coverUrl: listing.coverUrl,
  };
}

export function StoreBookCard({
  listing,
  owned = false,
  onPurchase,
  purchaseLoading = false,
}: StoreBookCardProps) {
  const book = toBook(listing);
  const isBookSale = listing.saleMode === "book";
  const readHref = listing.firstChapterId
    ? `/leer/${listing.firstChapterId}`
    : `/libro/${listing.bookId}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial-lg">
      <Link href={`/libro/${listing.bookId}`} className="block p-3 pb-0">
        <div className="overflow-hidden rounded-xl">
          <BookCover book={book} className="aspect-[2/3] w-full" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {isBookSale ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
              <Infinity className="h-3 w-3" />
              Compra única — lectura de por vida
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              <BookOpen className="h-3 w-3" />
              Por capítulo
            </span>
          )}
          {listing.includedInSubscription && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              <Crown className="h-3 w-3" />
              Incluido en suscripción
            </span>
          )}
        </div>

        <Link href={`/libro/${listing.bookId}`}>
          <h3 className="font-serif text-base font-bold leading-snug text-ink line-clamp-2 hover:text-terracotta">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted">{listing.author}</p>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-0.5 font-medium text-amber-700">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {listing.rating.toFixed(1)}
          </span>
          <span>
            {listing.premiumChapterCount} cap. premium · {listing.totalChapterCount} total
          </span>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
          {listing.synopsis}
        </p>

        <div className="mt-4 border-t border-sidebar pt-4">
          {owned ? (
            <Link
              href={readHref}
              className="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Leer ahora — En tu biblioteca
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onPurchase?.(listing.bookId)}
              disabled={purchaseLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {purchaseLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo…
                </>
              ) : (
                <>
                  Comprar por ${listing.priceUsd.toFixed(2)} USD
                  {!isBookSale && (
                    <span className="text-[11px] font-normal opacity-90">/ capítulo</span>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        <p className="mt-2 text-center text-[10px] text-muted">
          Solo lectura en el visor web — sin descarga PDF/EPUB
        </p>
      </div>
    </article>
  );
}
