import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { LAUNCH_READING_LABEL } from "@/lib/launch";

export function HomeWelcomeHero() {
  return (
    <section className="bg-home-dark px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-home-gold/25 bg-gradient-to-br from-imperial-deep via-[#3D2518] to-imperial-dark p-6 shadow-editorial-lg sm:p-10">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-cream/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-cream">
              <Sparkles className="h-3.5 w-3.5" />
              Lanzamiento abierto
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-gold-cream sm:text-4xl lg:text-5xl">
              Tu próximo mundo literario empieza aquí
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
              {LAUNCH_READING_LABEL} en {BRAND_NAME}. Romance, terror, fantasía y ciencia ficción en
              español — historias independientes con comunidad real.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/buscar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-cream px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-md transition-all hover:scale-105 hover:bg-white"
              >
                <BookOpen className="h-4 w-4" />
                Empezar a leer gratis
              </Link>
              <Link
                href="/conocenos"
                className="inline-flex items-center justify-center rounded-full border border-gold/35 bg-gold-cream/10 px-8 py-3.5 text-sm font-semibold text-gold-cream transition-colors hover:bg-gold-cream/20"
              >
                Conoce el Imperio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
