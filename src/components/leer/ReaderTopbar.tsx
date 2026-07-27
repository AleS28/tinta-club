"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";

interface ReaderTopbarProps {
  bookId: string;
  chapterTitle: string;
  chapterNumber: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function ReaderTopbar({
  bookId,
  chapterTitle,
  chapterNumber,
  fontSize,
  onFontSizeChange,
}: ReaderTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-sidebar/80 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={`/libro/${bookId}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-terracotta"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al Libro</span>
          <span className="sm:hidden">Volver</span>
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs uppercase tracking-wide text-muted">
            Capítulo {chapterNumber}
          </p>
          <p className="truncate font-serif text-sm font-bold text-ink">{chapterTitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full border border-sidebar bg-white/70 p-1">
          <button
            onClick={() => onFontSizeChange(fontSize - 1)}
            disabled={fontSize <= 14}
            aria-label="Reducir tamaño de fuente"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-medium text-ink">{fontSize}</span>
          <button
            onClick={() => onFontSizeChange(fontSize + 1)}
            disabled={fontSize >= 24}
            aria-label="Aumentar tamaño de fuente"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
