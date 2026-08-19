"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { LAUNCH_READING_LABEL } from "@/lib/launch";

interface LaunchRegisterBannerProps {
  onRegister: () => void;
}

export function LaunchRegisterBanner({ onRegister }: LaunchRegisterBannerProps) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-sidebar via-paper to-amber-50/50 p-6 shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10" />

      <div className="relative flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/15 sm:mb-0 sm:mr-5">
          <Sparkles className="h-6 w-6 text-amber-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-center gap-1.5 sm:justify-start">
            <BookOpen className="h-4 w-4 text-terracotta" />
            <span className="text-xs font-bold uppercase tracking-wide text-terracotta">
              {LAUNCH_READING_LABEL}
            </span>
          </div>
          <p className="mt-2 font-serif text-lg font-bold leading-snug text-ink">
            Regístrate gratis para seguir leyendo
          </p>
          <p className="mt-1 text-sm text-muted">
            En {BRAND_NAME} no pagas suscripción durante el lanzamiento. Solo necesitas una cuenta
            para acceder a todos los capítulos.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegister}
          className="mt-5 shrink-0 rounded-full bg-terracotta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 sm:mt-0 sm:ml-5"
        >
          Crear cuenta gratis
        </button>
      </div>
    </div>
  );
}
