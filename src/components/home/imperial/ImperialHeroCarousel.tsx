"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PenLine, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { LAUNCH_READING_LABEL } from "@/lib/launch";

const SLIDES = [
  {
    id: "authors",
    title: "EL IMPERIO IMPULSA",
    subtitle: "Tu libro, nuestro legado. Llévalo a miles.",
    href: "/autor/acuerdo",
    cta: "Publicar con nosotros",
    icon: PenLine,
    bgImage: "/authors/jose-luis-grimaldo/odisea-robot-guerra-cover.png",
    gradient: "from-[#0a0806]/95 via-[#1a1208]/80 to-[#2a1810]/70",
  },
  {
    id: "launch",
    title: "Tu próximo mundo literario",
    subtitle: `${LAUNCH_READING_LABEL} en ${BRAND_NAME}. Romance, terror, fantasía y ciencia ficción.`,
    href: "/buscar",
    cta: "Empezar a leer gratis",
    icon: Sparkles,
    bgImage: "/authors/pedro-garcia-martinez/amor-aroma-cafe-cover.png",
    gradient: "from-[#0a0806]/95 via-[#1a1008]/75 to-[#2a1810]/65",
  },
  {
    id: "featured",
    title: "La Odisea del Robot de Guerra",
    subtitle: "Ciencia ficción, drama y robótica — una saga que redefine el futuro.",
    href: "/libro/jose-odisea-robot-guerra",
    cta: "Descubrir la saga",
    icon: Sparkles,
    bgImage: "/authors/jose-luis-grimaldo/odisea-robot-guerra-cover.png",
    gradient: "from-[#0a0806]/90 via-[#0d1520]/80 to-[#1a1008]/70",
  },
] as const;

export function ImperialHeroCarousel() {
  const [index, setIndex] = useState(0);

  const go = useCallback((delta: number) => {
    setIndex((current) => (current + delta + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => go(1), 7000);
    return () => window.clearInterval(timer);
  }, [go]);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <section className="px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-imperial-gold/25 shadow-[0_8px_40px_-8px_rgba(212,175,55,0.15)]">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.bgImage}
              alt=""
              className="h-full w-full object-cover object-center scale-110 blur-[2px] opacity-40"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "url('/textures/literary-pattern.png')",
                backgroundSize: "320px auto",
              }}
              aria-hidden
            />
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-imperial-gold/30 bg-black/40 text-gold-cream backdrop-blur-sm transition-colors hover:border-imperial-gold/60 hover:bg-black/60 sm:left-4 sm:h-10 sm:w-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-imperial-gold/30 bg-black/40 text-gold-cream backdrop-blur-sm transition-colors hover:border-imperial-gold/60 hover:bg-black/60 sm:right-4 sm:h-10 sm:w-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="relative flex min-h-[220px] flex-col items-center justify-center px-12 py-10 text-center sm:min-h-[260px] sm:px-16 sm:py-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-imperial-gold/35 bg-imperial-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-imperial-gold">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {BRAND_NAME}
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-2xl font-bold leading-tight text-imperial-gold sm:text-3xl lg:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gold-cream/85 sm:text-base">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-imperial-gold via-gold-light to-imperial-gold px-8 py-3 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-lg shadow-imperial-gold/20 transition-all hover:scale-105 hover:shadow-imperial-gold/30"
            >
              {slide.cta}
            </Link>
          </div>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-imperial-gold"
                    : "w-1.5 bg-gold-cream/30 hover:bg-gold-cream/50"
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
