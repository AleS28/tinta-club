"use client";

import { AuthReaderLink } from "@/components/auth/AuthReaderLink";

const FIRST_FREE_CHAPTER = "/leer/pedro-amor-cafe-cap-1";

export function AnnouncementBar() {
  return (
    <div className="bg-[#3D2518] py-2.5 text-center text-xs font-medium text-[#FCF9F5]/90 sm:text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 sm:gap-x-3">
        <AuthReaderLink
          href={FIRST_FREE_CHAPTER}
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="rounded-full bg-home-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-cream sm:text-xs">
            Cap. 1-3 Gratis
          </span>
          <span>
            Amor con aroma a café — Pedro García Martínez
          </span>
        </AuthReaderLink>
        <span className="hidden text-[#FCF9F5]/40 sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden sm:inline">
          Suscripción desde <span className="font-semibold text-gold-cream">$4.99/mes</span>
        </span>
      </div>
    </div>
  );
}
