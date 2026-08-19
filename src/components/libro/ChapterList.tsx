"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Sparkles } from "lucide-react";
import { Chapter } from "@/data/mock";
import { isLaunchMode } from "@/lib/launch";

interface ChapterListProps {
  chapters: Chapter[];
}

export function ChapterList({ chapters }: ChapterListProps) {
  const router = useRouter();
  const launchMode = isLaunchMode();

  const handleRead = (chapter: Chapter) => {
    router.push(`/leer/${chapter.id}`);
  };

  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">Capítulos</h2>
      {launchMode && (
        <p className="mt-2 text-sm text-muted">
          Lectura abierta durante el lanzamiento — regístrate gratis para acceder a todos los
          capítulos.
        </p>
      )}
      <ul className="mt-4 divide-y divide-sidebar rounded-2xl border border-sidebar bg-white/60">
        {chapters.map((chapter) => (
          <li
            key={chapter.id}
            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">
                  Cap. {chapter.number}
                </span>
                {launchMode ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <Sparkles className="h-3 w-3" />
                    Gratis en lanzamiento
                  </span>
                ) : chapter.isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Premium
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Gratis
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium text-ink">{chapter.title}</p>
            </div>

            <button
              type="button"
              onClick={() => handleRead(chapter)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Leer
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
