import Link from "next/link";
import { BookOpen, Clock, Sparkles } from "lucide-react";
import type { AuthorUpcomingWork } from "@/types/author-profile";

interface AuthorUpcomingWorksProps {
  works: AuthorUpcomingWork[];
}

const statusLabels: Record<AuthorUpcomingWork["status"], string> = {
  "coming-soon": "Próximamente",
  "in-progress": "En preparación",
  published: "Disponible",
};

export function AuthorUpcomingWorks({ works }: AuthorUpcomingWorksProps) {
  if (works.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-bold text-[#3B2519] sm:text-3xl">
        Otras Obras y Próximos Lanzamientos
      </h2>
      <p className="mt-2 text-sm text-muted">
        Nuevas historias en camino desde el Imperio de la Tinta.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => {
          const isPublished = work.status === "published" && work.bookId;

          return (
            <article
              key={work.id}
              className="group overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-editorial transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial-lg"
            >
              {isPublished ? (
                <Link href={`/libro/${work.bookId}`} className="block">
                  <WorkCover work={work} />
                </Link>
              ) : (
                <WorkCover work={work} />
              )}

              <div className="p-5">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: work.coverAccent }}
                >
                  {work.genre}
                </span>
                <h3 className="mt-2 font-serif text-xl font-bold text-ink">{work.title}</h3>
                {work.teaser && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    {work.teaser}
                  </p>
                )}

                {isPublished && work.firstChapterId && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/leer/${work.firstChapterId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D27C5A] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[#FCF9F5] transition-colors hover:bg-[#c06a48]"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Leer gratis
                    </Link>
                    {work.freeChaptersCount && work.freeChaptersCount > 0 && (
                      <p className="text-center text-xs text-muted">
                        Capítulos 1 a {work.freeChaptersCount} gratuitos
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WorkCover({ work }: { work: AuthorUpcomingWork }) {
  return (
    <div
      className={`relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br ${work.coverGradient}`}
    >
      <Sparkles className="h-10 w-10 text-white/40" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FCF9F5] backdrop-blur-sm">
        {work.status === "published" ? (
          <BookOpen className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
        {statusLabels[work.status]}
      </span>
      <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl font-bold text-white/90">
        {work.title}
      </p>
    </div>
  );
}
