"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BRAND_NAME } from "@/lib/brand";

interface SubscribeModalProps {
  price: number;
  authorName?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function SubscribeModal({ price, authorName, onSuccess, onClose }: SubscribeModalProps) {
  const { subscribe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      await subscribe();
      onSuccess();
      onClose();
    } catch {
      setError("No pudimos procesar tu suscripción. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-terracotta to-orange-700 px-6 py-8 text-white">
          <Sparkles className="h-7 w-7 text-amber-200" />
          <h2 className="mt-3 font-serif text-2xl font-bold">Únete a {BRAND_NAME}</h2>
          <p className="mt-1 text-sm text-white/85">Acceso ilimitado a toda la biblioteca</p>
        </div>

        <div className="px-6 py-6">
          <ul className="space-y-2 text-sm text-ink/85">
            <li>✦ Todos los capítulos premium desbloqueados</li>
            <li>✦ Apoya directamente a autores independientes</li>
            <li>✦ Nuevos capítulos cada semana</li>
          </ul>

          {authorName && (
            <p className="mt-4 text-sm text-muted">
              Tu suscripción apoya a <span className="font-medium text-ink">{authorName}</span>
            </p>
          )}

          <div className="mt-5 rounded-xl bg-sidebar px-4 py-3 text-center">
            <span className="font-serif text-3xl font-bold text-ink">${price.toFixed(2)}</span>
            <span className="text-sm text-muted"> / mes</span>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar suscripción
          </button>

          <p className="mt-3 text-center text-xs text-muted">
            Simulación de pago · Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}
