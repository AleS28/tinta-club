"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquareHeart, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  FeedbackUserType,
  submitFeedback,
} from "@/lib/feedback";
import { isFirebaseConfigured } from "@/lib/firebase";

const userTypes: FeedbackUserType[] = ["Lector", "Autor", "Amante de las historias"];

const genreOptions = [
  "Fantasía",
  "Ciencia Ficción",
  "Dark Romance",
  "Realismo Mágico",
  "Suspenso",
  "Poesía",
  "Romance",
  "Terror",
  "Histórica",
  "Distopía",
];

type ToastState = { type: "success" | "error"; message: string } | null;

export function FeedbackForm() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<FeedbackUserType>("Lector");
  const [genres, setGenres] = useState<string[]>([]);
  const [featureRequest, setFeatureRequest] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!isFirebaseConfigured) {
        throw new Error("Firebase no está configurado");
      }

      await submitFeedback({
        userType,
        genres,
        featureRequest,
        comments,
        userId: user?.uid,
        userEmail: user?.email ?? undefined,
      });

      setSubmitted(true);
      setToast({
        type: "success",
        message: "¡Gracias! Tu voz ha sido registrada en el Imperio.",
      });
    } catch {
      setToast({
        type: "error",
        message: "No pudimos enviar tu feedback. Intenta de nuevo en un momento.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="mt-12 rounded-2xl border border-amber-900/10 bg-white p-10 text-center shadow-editorial">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10">
            <Sparkles className="h-8 w-8 text-terracotta" />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-bold text-ink">Gracias por construir con nosotros</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Tu opinión es parte del futuro de El Imperio de la Tinta. Revisaremos cada sugerencia
            con el cuidado que merecen las mejores historias.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setUserType("Lector");
              setGenres([]);
              setFeatureRequest("");
              setComments("");
            }}
            className="mt-6 rounded-full border border-terracotta/30 px-6 py-2.5 text-sm font-medium text-terracotta transition-all duration-300 hover:scale-105 hover:bg-terracotta hover:text-white"
          >
            Enviar otra sugerencia
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[80] flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3.5 shadow-editorial-lg backdrop-blur-sm ${
            toast.type === "success"
              ? "border-emerald-200/80 bg-white/95 text-emerald-800"
              : "border-red-200/80 bg-white/95 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <X className="h-5 w-5 shrink-0 text-red-500" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <section className="mt-12 rounded-2xl border border-amber-900/10 bg-white p-6 shadow-editorial sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-cream/60">
            <MessageSquareHeart className="h-5 w-5 text-imperial-deep" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Tu voz importa</h2>
            <p className="mt-1 text-sm text-muted">
              Cuéntanos qué te gustaría leer y cómo podemos mejorar la plataforma.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">¿Quién eres?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {userTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    userType === type
                      ? "border-imperial-deep bg-imperial-deep text-gold-cream shadow-md"
                      : "border-amber-900/15 bg-sidebar text-ink hover:border-gold/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Géneros o categorías que te gustaría ver
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {genreOptions.map((genre) => {
                const selected = genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 ${
                      selected
                        ? "border-terracotta bg-terracotta/10 text-imperial-deep"
                        : "border-amber-900/10 bg-paper text-muted hover:border-terracotta/40"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="featureRequest" className="text-sm font-semibold text-ink">
              ¿Qué nueva función o mejora te gustaría ver?
            </label>
            <input
              id="featureRequest"
              type="text"
              value={featureRequest}
              onChange={(e) => setFeatureRequest(e.target.value)}
              placeholder="Ej: modo nocturno, clubes de lectura, audiolibros..."
              className="mt-2 w-full rounded-xl border border-amber-900/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-all duration-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            />
          </div>

          <div>
            <label htmlFor="comments" className="text-sm font-semibold text-ink">
              Comentarios adicionales
            </label>
            <textarea
              id="comments"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Comparte cualquier idea, crítica o sueño para la plataforma..."
              className="mt-2 w-full resize-none rounded-xl border border-amber-900/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-all duration-300 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-orange-700 hover:shadow-lg disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar sugerencias
          </button>
        </form>
      </section>
    </>
  );
}
