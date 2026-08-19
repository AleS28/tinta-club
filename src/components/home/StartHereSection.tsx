import Link from "next/link";
import { Compass, Star } from "lucide-react";
import { BookCover } from "@/components/ui/BookCover";
import { pedroAmorCafeBook, getFirstChapter } from "@/data/mock";

export function StartHereSection() {
  const firstChapter = getFirstChapter(pedroAmorCafeBook.id);
  const readHref = firstChapter ? `/leer/${firstChapter.id}` : `/libro/${pedroAmorCafeBook.id}`;

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-2">
          <Compass className="h-5 w-5 text-terracotta" />
          <h2 className="font-serif text-xl font-bold text-ink">Si eres nuevo, empieza por aquí</h2>
        </div>

        <article className="flex flex-col gap-6 rounded-2xl border border-amber-900/10 bg-white p-5 shadow-editorial sm:flex-row sm:items-center sm:p-6">
          <BookCover
            book={pedroAmorCafeBook}
            className="mx-auto aspect-[2/3] w-36 shrink-0 shadow-lg sm:mx-0 sm:w-40"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-terracotta">
              Recomendado para nuevos lectores
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-ink">
              {pedroAmorCafeBook.title}
            </h3>
            <p className="mt-1 text-sm text-muted">por {pedroAmorCafeBook.author}</p>
            <div className="mt-2 flex items-center justify-center gap-1 sm:justify-start">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-ink">
                {pedroAmorCafeBook.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
              {pedroAmorCafeBook.synopsis}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={readHref}
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700"
              >
                Leer ahora — gratis
              </Link>
              <Link
                href={`/libro/${pedroAmorCafeBook.id}`}
                className="inline-flex items-center justify-center rounded-full border border-sidebar px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-terracotta/40 hover:text-terracotta"
              >
                Ver ficha del libro
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
