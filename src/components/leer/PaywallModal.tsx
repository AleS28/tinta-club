"use client";

import { Sparkles, X } from "lucide-react";

interface PaywallModalProps {
  authorName: string;
  onClose?: () => void;
}

export function PaywallModal({ authorName, onClose }: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full p-1 text-muted transition-colors hover:bg-sidebar hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="bg-gradient-to-br from-terracotta to-orange-700 px-6 py-8 text-white">
          <Sparkles className="h-7 w-7 text-amber-200" />
          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight">
            Contenido exclusivo
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-ink">
            Este capítulo es exclusivo para suscriptores. Únete a Tinta Club por{" "}
            <span className="font-semibold text-terracotta">$4.99/mes</span> para continuar
            leyendo y apoyar directamente a{" "}
            <span className="font-semibold">{authorName}</span>.
          </p>

          <button className="mt-6 w-full rounded-full bg-terracotta py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700">
            Suscribirme Ahora
          </button>

          <p className="mt-3 text-center text-xs text-muted">
            Cancela cuando quieras · Acceso ilimitado a toda la biblioteca
          </p>
        </div>
      </div>
    </div>
  );
}
