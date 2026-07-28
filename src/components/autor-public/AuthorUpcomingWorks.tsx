import { Clock, Sparkles } from "lucide-react";
import type { AuthorUpcomingWork } from "@/types/author-profile";

interface AuthorUpcomingWorksProps {
  works: AuthorUpcomingWork[];
}

const statusLabels: Record<AuthorUpcomingWork["status"], string> = {
  "coming-soon": "Próximamente",
  "in-progress": "En preparación",
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
        {works.map((work) => (
          <article
            key={work.id}
            className="group overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-editorial transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial-lg"
          >
            <div
              className={`relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br ${work.coverGradient}`}
            >
              <Sparkles className="h-10 w-10 text-white/40" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FCF9F5] backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                {statusLabels[work.status]}
              </span>
            </div>

            <div className="p-5">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: work.coverAccent }}
              >
                {work.genre}
              </span>
              <h3 className="mt-2 font-serif text-xl font-bold text-ink">{work.title}</h3>
              {work.teaser && (
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                  {work.teaser}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
