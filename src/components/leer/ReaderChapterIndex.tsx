"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Chapter } from "@/data/mock";
import { isLaunchMode } from "@/lib/launch";

interface ReaderChapterIndexProps {
  bookId: string;
  chapters: Chapter[];
  currentChapterId: string;
  onClose: () => void;
}

export function ReaderChapterIndex({
  bookId,
  chapters,
  currentChapterId,
  onClose,
}: ReaderChapterIndexProps) {
  const launchMode = isLaunchMode();

  return (
    <div className="fixed inset-0 z-[90] flex">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar índice"
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-r border-sidebar bg-paper shadow-2xl"
        aria-label="Índice de capítulos"
      >
        <div className="flex items-center justify-between border-b border-sidebar px-4 py-4">
          <h2 className="font-serif text-lg font-bold text-ink">Índice</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-sidebar"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-3">
          {chapters.map((item) => {
            const active = item.id === currentChapterId;
            return (
              <li key={item.id}>
                <Link
                  href={`/leer/${item.id}`}
                  onClick={onClose}
                  className={`flex flex-col rounded-xl px-3 py-2.5 transition-colors ${
                    active
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-ink hover:bg-sidebar/80"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    Capítulo {item.number}
                    {launchMode && item.isPremium ? " · Gratis" : item.isPremium ? " · Premium" : ""}
                  </span>
                  <span className="text-sm font-medium leading-snug">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-sidebar p-3">
          <Link
            href={`/libro/${bookId}`}
            onClick={onClose}
            className="block rounded-xl border border-sidebar px-3 py-2.5 text-center text-sm font-medium text-muted hover:border-terracotta/40 hover:text-terracotta"
          >
            Volver a la ficha del libro
          </Link>
        </div>
      </aside>
    </div>
  );
}
