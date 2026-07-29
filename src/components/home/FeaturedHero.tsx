import Link from "next/link";
import { BookOpen, Clock, Star } from "lucide-react";
import { Book, getFirstChapter } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";
import type { BookMeta } from "@/lib/book-meta";

interface FeaturedHeroProps {
  book: Book;
  meta: BookMeta;
}

export function FeaturedHero({ book, meta }: FeaturedHeroProps) {
  const firstChapter = getFirstChapter(book.id);
  const readHref = firstChapter ? `/leer/${firstChapter.id}` : `/libro/${book.id}`;
  return (
    <section className="relative overflow-hidden rounded-2xl bg-imperial-dark shadow-editorial-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(139,58,43,0.5) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(201,169,97,0.15) 0%, transparent 40%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-imperial-dark via-imperial-dark/95 to-[#3D2218]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[220px_1fr] lg:items-center lg:gap-10 lg:p-10">
        <div className="mx-auto w-44 shrink-0 sm:w-52 lg:mx-0 lg:w-full">
          <BookCover
            book={book}
            className="aspect-[2/3] w-full shadow-editorial-lg ring-2 ring-gold/30 transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-light">
            Obra Destacada ✦
          </span>

          <h1 className="mt-4 font-serif text-2xl font-bold leading-tight text-gold-cream sm:text-3xl lg:text-4xl">
            {book.title}
          </h1>

          <p className="mt-2 text-sm text-gold-light/80">
            por{" "}
            <Link
              href={book.authorId === "author-pedro-garcia" ? "/autor/pedro-garcia-martinez" : `/perfil/${book.authorId}`}
              className="font-medium text-gold-cream underline-offset-2 hover:underline"
            >
              {book.author}
            </Link>
            <span className="mx-2 text-gold/40">·</span>
            <span className="rounded-full border border-gold/25 px-2 py-0.5 text-xs text-gold-light">
              {book.genre}
            </span>
          </p>

          <p className="mt-4 font-serif text-sm leading-relaxed text-white/75 sm:text-base lg:max-w-xl">
            {book.synopsis}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gold-light/70 lg:justify-start">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold" />
              {meta.readingTimeMinutes} min de lectura
            </span>
            {meta.chapterCount > 0 && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-gold" />
                {meta.chapterCount} capítulos
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {book.rating.toFixed(1)}
            </span>
          </div>

          <Link
            href={readHref}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-cream px-8 py-3 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-md transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-lg active:scale-[0.98]"
          >
            Comenzar a Leer
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
