"use client";

import { useRouter } from "next/navigation";
import { Lock, BookOpen } from "lucide-react";
import { Chapter } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";

interface ChapterListProps {
  chapters: Chapter[];
}

export function ChapterList({ chapters }: ChapterListProps) {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();

  const handleRead = (chapter: Chapter) => {
    if (loading) return;

    const href = `/leer/${chapter.id}`;

    if (chapter.isPremium && !user) {
      openAuthModal(href);
      return;
    }

    router.push(href);
  };

  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">Capítulos</h2>
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
                {chapter.isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Lock className="h-3 w-3" />
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
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                chapter.isPremium
                  ? "border border-muted/30 text-muted hover:border-terracotta hover:text-terracotta"
                  : "bg-terracotta text-white hover:bg-orange-700"
              }`}
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
