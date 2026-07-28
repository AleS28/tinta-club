"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getDefaultTermsAppId,
  recordReaderTermsAcceptance,
  READER_TERMS_VERSION,
  TermsServiceError,
} from "@/lib/termsService";

const TERMS_SUMMARY = [
  "Los capítulos 1 al 3 son gratuitos como vista previa de cada obra.",
  "A partir del capítulo 4 se requiere suscripción premium para continuar leyendo.",
  "La membresía se renueva mensualmente hasta que canceles desde tu perfil.",
  "Puedes cancelar en cualquier momento, sin penalización ni permanencia mínima.",
  "Queda prohibida la copia, descarga no autorizada o redistribución masiva del contenido.",
  "Al suscribirte apoyas directamente a los autores independientes del Imperio.",
];

type ToastState = { type: "success" | "error"; message: string } | null;

export interface TermsAcceptanceModalProps {
  bookTitle: string;
  bookId: string;
  chapterNumber?: number;
  priceUsd?: number;
  authorName?: string;
  redirectTo?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function TermsAcceptanceModal({
  bookTitle,
  bookId,
  chapterNumber = 4,
  priceUsd = 5,
  authorName,
  redirectTo,
  onSuccess,
  onClose,
}: TermsAcceptanceModalProps) {
  const router = useRouter();
  const { user, subscribe } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const priceLabel = `$${priceUsd} USD`;

  const handleConfirm = async () => {
    if (!accepted || loading) return;

    if (!user) {
      setError("Debes iniciar sesión para completar la suscripción.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const appId = getDefaultTermsAppId();

      await recordReaderTermsAcceptance(appId, user.uid, {
        termsVersion: READER_TERMS_VERSION,
        bookId,
        subscriptionIntent: `premium-monthly-${priceUsd}-usd`,
        legalName: user.displayName ?? undefined,
      });

      await subscribe();

      setToast({
        type: "success",
        message: "¡Suscripción confirmada! Desbloqueando contenido premium…",
      });

      window.setTimeout(() => {
        onSuccess();
        onClose();
        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        }
      }, 1200);
    } catch (err) {
      const message =
        err instanceof TermsServiceError
          ? err.message
          : "No pudimos procesar tu suscripción. Intenta de nuevo.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[90] flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl backdrop-blur-sm ${
            toast.type === "success"
              ? "border-emerald-400/40 bg-[#2A1810]/95 text-emerald-100"
              : "border-red-400/40 bg-[#2A1810]/95 text-red-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <X className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#D27C5A]/30 bg-[#2A1810] shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-[#FCF9F5]/70 transition-colors hover:bg-white/10 hover:text-[#FCF9F5] disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="border-b border-[#D27C5A]/20 px-6 pb-5 pt-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D27C5A]/40 bg-[#D27C5A]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#F5E6C8]">
                <Lock className="h-3.5 w-3.5" />
                Capítulo {chapterNumber} — Contenido Premium
              </span>
              <span className="rounded-full border border-[#D4A359]/40 bg-[#D4A359]/15 px-3 py-1 text-xs font-bold text-[#F5E6C8]">
                {priceLabel} / mes
              </span>
            </div>

            <h2
              id="terms-modal-title"
              className="mt-4 font-serif text-2xl font-bold leading-tight text-[#D27C5A] sm:text-3xl"
            >
              {bookTitle}
            </h2>

            {authorName && (
              <p className="mt-2 text-sm text-[#FCF9F5]/65">
                Por <span className="font-medium text-[#FCF9F5]/90">{authorName}</span>
              </p>
            )}
          </div>

          <div className="px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FCF9F5]/50">
              Resumen de términos
            </p>

            <div className="mt-3 max-h-32 overflow-y-auto rounded-xl border border-[#D27C5A]/15 bg-[#1f140e] px-4 py-3 text-sm leading-relaxed text-[#FCF9F5]/85 scrollbar-thin">
              <ul className="list-disc space-y-2 pl-4">
                {TERMS_SUMMARY.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[#FCF9F5]/55">
                Documento completo:{" "}
                <Link
                  href="/terminos-lectores"
                  target="_blank"
                  className="font-medium text-[#D27C5A] underline-offset-2 hover:underline"
                >
                  Términos para Lectores
                </Link>
              </p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#D27C5A]/20 bg-[#1f140e]/80 p-4 transition-colors hover:border-[#D27C5A]/35">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                disabled={loading}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D27C5A]/50 bg-transparent text-[#D27C5A] focus:ring-[#D27C5A]/40"
              />
              <span className="text-sm leading-relaxed text-[#FCF9F5]/90">
                He leído y acepto los{" "}
                <Link
                  href="/terminos-lectores"
                  target="_blank"
                  className="font-medium text-[#D27C5A] underline-offset-2 hover:underline"
                >
                  Términos de Servicio para Lectores
                </Link>{" "}
                y autorizo la renovación mensual de {priceLabel}.
              </span>
            </label>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!accepted || loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#D27C5A] py-3.5 text-sm font-bold uppercase tracking-wide text-[#FCF9F5] transition-all duration-300 hover:bg-[#c06a48] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                `Confirmar y Suscribirme (${priceLabel})`
              )}
            </button>

            <p className="mt-3 text-center text-xs text-[#FCF9F5]/45">
              Simulación de pago · Cancela cuando quieras desde tu perfil
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
