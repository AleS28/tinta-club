"use client";

import { Lock, Sparkles } from "lucide-react";

interface PaywallBannerProps {
  price: number;
  onSubscribe: () => void;
}

export function PaywallBanner({ price, onSubscribe }: PaywallBannerProps) {
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
            Suscríbete a Tinta Club para continuar leyendo y apoyar a autores independientes.
          </p>
        </div>

        <button
          type="button"
          onClick={onSubscribe}
          className="mt-5 shrink-0 rounded-full bg-terracotta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 sm:mt-0 sm:ml-5"
        >
          Suscribirme por ${price.toFixed(2)}/mes
        </button>
      </div>
    </div>
  );
}
