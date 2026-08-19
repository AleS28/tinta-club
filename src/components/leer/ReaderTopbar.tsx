"use client";

import {
  Expand,
  LampDesk,
  List,
  Minimize,
  Moon,
  Settings2,
  Sun,
  SunMoon,
} from "lucide-react";
import Link from "next/link";
import type { ReaderFontPreset, ReaderTheme } from "@/lib/reader-preferences";
import { getReaderSurfaceClass } from "@/lib/reader-preferences";

interface ReaderSettingsPanelProps {
  fontPreset: ReaderFontPreset;
  theme: ReaderTheme;
  resolvedTheme: "light" | "dark" | "night";
  onFontPresetChange: (preset: ReaderFontPreset) => void;
  onThemeChange: (theme: ReaderTheme) => void;
  onClose: () => void;
}

const FONT_OPTIONS: { id: ReaderFontPreset; label: string }[] = [
  { id: "small", label: "Pequeño" },
  { id: "medium", label: "Mediano" },
  { id: "large", label: "Grande" },
];

const THEME_OPTIONS: {
  id: ReaderTheme;
  label: string;
  icon: typeof Sun;
}[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "auto", label: "Auto", icon: SunMoon },
  { id: "night", label: "Luz nocturna", icon: LampDesk },
];

export function ReaderSettingsPanel({
  fontPreset,
  theme,
  resolvedTheme,
  onFontPresetChange,
  onThemeChange,
  onClose,
}: ReaderSettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-end p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="Cerrar ajustes"
      />
      <div
        className={`relative w-full max-w-xs rounded-2xl border border-sidebar p-5 shadow-2xl ${getReaderSurfaceClass(
          resolvedTheme,
        )}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold reader-text">Ajustes</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 reader-muted hover:bg-black/5"
            aria-label="Cerrar"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide reader-muted">Fuente</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onFontPresetChange(option.id)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                  fontPreset === option.id
                    ? "border-terracotta bg-terracotta/10 text-terracotta"
                    : "border-sidebar reader-text hover:border-terracotta/40"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide reader-muted">Tema de pantalla</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onThemeChange(option.id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                    theme === option.id
                      ? "border-terracotta bg-terracotta/10 text-terracotta"
                      : "border-sidebar reader-text hover:border-terracotta/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReaderTopbarProps {
  bookId: string;
  bookTitle: string;
  authorName: string;
  chapterTitle: string;
  chapterNumber: number;
  isFullscreen: boolean;
  surfaceClass: string;
  onOpenIndex: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export function ReaderTopbar({
  bookId,
  bookTitle,
  authorName,
  chapterTitle,
  chapterNumber,
  isFullscreen,
  surfaceClass,
  onOpenIndex,
  onOpenSettings,
  onToggleFullscreen,
}: ReaderTopbarProps) {
  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-sm ${surfaceClass} border-sidebar/60`}
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenIndex}
            className="inline-flex items-center gap-1 rounded-full border border-sidebar px-3 py-1.5 text-xs font-semibold reader-text transition-colors hover:border-terracotta/40 hover:text-terracotta"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Índice</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-sidebar px-3 py-1.5 text-xs font-semibold reader-text transition-colors hover:border-terracotta/40 hover:text-terracotta"
          >
            <span className="hidden sm:inline">Volver al sitio</span>
            <span className="sm:hidden">Inicio</span>
          </Link>
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-semibold reader-text">{bookTitle}</p>
          <p className="truncate text-[10px] reader-muted">{authorName}</p>
          <p className="truncate text-xs font-medium reader-muted">
            Cap. {chapterNumber} · {chapterTitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-sidebar reader-text transition-colors hover:border-terracotta/40 hover:text-terracotta"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 rounded-full border border-sidebar px-3 py-1.5 text-xs font-semibold reader-text transition-colors hover:border-terracotta/40 hover:text-terracotta"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
