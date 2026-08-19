"use client";

import Link from "next/link";
import { BookOpen, Coffee, Users } from "lucide-react";
import { useState } from "react";
import { BRAND_NAME } from "@/lib/brand";
import { LAUNCH_READING_LABEL } from "@/lib/launch";
import { SupportPlatformModal } from "@/components/social/SupportPlatformModal";

export function LaunchReaderCTA() {
  const [coffeeOpen, setCoffeeOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-amber-900/15 bg-gradient-to-br from-imperial-deep via-[#7A3328] to-imperial-dark p-6 text-white shadow-editorial-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/10" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute inset-0 shadow-inset" />

        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-gold-cream/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-cream">
            Lanzamiento abierto
          </span>
          <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-gold-cream">
            Lee gratis en {BRAND_NAME}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {LAUNCH_READING_LABEL}. Romance, fantasía y narrativa independiente en español — sin
            suscripción por ahora.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
              <BookOpen className="h-4 w-4 shrink-0 text-gold-light" />
              Todos los capítulos disponibles al registrarte
            </li>
            <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
              <Users className="h-4 w-4 shrink-0 text-gold-light" />
              Comenta, sigue autores y únete a Discord o Telegram
            </li>
            <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
              <Coffee className="h-4 w-4 shrink-0 text-gold-light" />
              Si te gusta el Imperio, puedes invitar un café (opcional)
            </li>
          </ul>

          <Link
            href="/buscar"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold-cream py-2.5 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-md transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-lg active:scale-[0.98]"
          >
            <BookOpen className="h-4 w-4" />
            Explorar y leer gratis
          </Link>

          <button
            type="button"
            onClick={() => setCoffeeOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold-cream/10 py-2.5 text-sm font-semibold text-gold-cream transition-all duration-300 hover:bg-gold-cream/20"
          >
            <Coffee className="h-4 w-4" />
            Invita un café al Imperio
          </button>
        </div>
      </section>

      {coffeeOpen && <SupportPlatformModal onClose={() => setCoffeeOpen(false)} />}
    </>
  );
}
