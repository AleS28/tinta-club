import Image from "next/image";
import { StartReadingButton } from "@/components/auth/StartReadingButton";
import type { AuthorFeaturedWork } from "@/types/author-profile";

interface AuthorFeaturedBookProps {
  work: AuthorFeaturedWork;
}

export function AuthorFeaturedBook({ work }: AuthorFeaturedBookProps) {
  const accent = work.coverAccent ?? "#D27C5A";

  return (
    <section className="mt-12 overflow-hidden rounded-3xl bg-[#3B2519] shadow-editorial-lg">
      <div className="grid gap-0 lg:grid-cols-[minmax(280px,2fr)_minmax(0,3fr)]">
        <div className="relative flex min-h-[420px] items-center justify-center bg-[#2a1a12] p-4 lg:min-h-full">
          {work.coverUrl ? (
            <Image
              src={work.coverUrl}
              alt={`Portada de ${work.title}`}
              width={400}
              height={600}
              className="h-auto max-h-[520px] w-auto max-w-full object-contain object-center shadow-2xl"
              sizes="(max-width: 1024px) 90vw, 400px"
              priority
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${work.coverGradient ?? "from-stone-700 via-amber-900 to-stone-950"}`}
            >
              <div className="flex h-full flex-col justify-end p-8">
                <p className="font-serif text-3xl font-bold text-white/95">{work.title}</p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3B2519]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#3B2519]/30" />
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D27C5A]/80">
            Obra Destacada
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl" style={{ color: accent }}>
            {work.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {work.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-[#FCF9F5]/15 bg-[#FCF9F5]/5 px-3 py-1 text-xs font-medium text-[#FCF9F5]/90"
              >
                {genre}
              </span>
            ))}
          </div>

          {work.isbn && <p className="mt-3 text-sm text-[#FCF9F5]/60">ISBN {work.isbn}</p>}

          <p className="mt-6 text-base leading-relaxed text-[#FCF9F5]/90">{work.synopsis}</p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <StartReadingButton
              href={`/leer/${work.firstChapterId}`}
              label="Leer Capítulo 1 Gratis"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D27C5A] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-[#FCF9F5] transition-all duration-300 hover:scale-105 hover:bg-[#c06a48] hover:shadow-lg hover:shadow-[#D27C5A]/25"
            />
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-[#F5E6C8]">
            Capítulos 1 a {work.freeChaptersCount} Gratuitos · Membresía $
            {work.membershipPriceUsd} USD/mes para continuar
          </p>
        </div>
      </div>
    </section>
  );
}
