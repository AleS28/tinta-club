"use client";

import { Lock, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

interface PaywallBannerProps {
  price: number;
  chapterPrice?: number;
  bookPrice?: number;
  onSubscribe: () => void;
  onChapterPurchase?: () => void;
  onBookPurchase?: () => void;
  purchaseLoading?: boolean;
}

export function PaywallBanner({
  price,
  chapterPrice,
  bookPrice,
  onSubscribe,
  onChapterPurchase,
  onBookPurchase,
  purchaseLoading = false,
}: PaywallBannerProps) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-terracotta/20 bg-gradient-to-br from-sidebar via-paper to-amber-50/50 p-6 shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-terracotta/5" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-terracotta/5" />

      <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-terracotta/10 sm:mb-0 sm:mr-5">
          <Lock className="h-6 w-6 text-terracotta" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-center gap-1.5 sm:justify-start">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-terracotta">
              Contenido exclusivo
            </span>
          </div>
          <p className="mt-2 font-serif text-lg font-bold leading-snug text-ink">
            Este capítulo forma parte del contenido exclusivo
          </p>
          <p className="mt-1 text-sm text-muted">
            Suscríbete a {BRAND_NAME}, compra el libro completo o solo este capítulo. Solo lectura
            en el visor — sin descarga.
          </p>
        </div>

        <div className="mt-5 flex shrink-0 flex-col gap-2 sm:mt-0 sm:ml-5">
          {onBookPurchase && typeof bookPrice === "number" && (
            <button
              type="button"
              onClick={onBookPurchase}
              disabled={purchaseLoading}
              className="rounded-full bg-terracotta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {purchaseLoading
                ? "Redirigiendo…"
                : `Comprar libro · $${bookPrice.toFixed(2)} USD`}
            </button>
          )}
          {onChapterPurchase && typeof chapterPrice === "number" && (
            <button
              type="button"
              onClick={onChapterPurchase}
              disabled={purchaseLoading}
              className="rounded-full border border-terracotta/40 bg-white/80 px-6 py-3 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {purchaseLoading
                ? "Redirigiendo…"
                : `Comprar capítulo · $${chapterPrice.toFixed(2)} USD`}
            </button>
          )}
          <button
            type="button"
            onClick={onSubscribe}
            className="rounded-full border border-amber-300/60 bg-amber-50/80 px-6 py-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
          >
            Suscribirme por ${price.toFixed(2)}/mes
          </button>
        </div>
      </div>
    </div>
  );
}
