"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Heart, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type FeedbackKind =
  | "donation"
  | "purchase"
  | "subscription"
  | "canceled"
  | "error"
  | null;

interface FeedbackCopy {
  kind: Exclude<FeedbackKind, null>;
  title: string;
  body: string;
  tone: "success" | "neutral" | "error";
  icon: "heart" | "check" | "sparkles";
}

function resolveFeedback(searchParams: URLSearchParams): FeedbackCopy | null {
  if (searchParams.get("donated") === "true") {
    return {
      kind: "donation",
      title: "¡Gracias por tu apoyo!",
      body: "Tu gesto llega directo al autor. El Imperio de la Tinta te lo agradece de corazón.",
      tone: "success",
      icon: "heart",
    };
  }

  if (
    searchParams.get("purchased") === "true" ||
    searchParams.get("purchase") === "success"
  ) {
    return {
      kind: "purchase",
      title: "¡Compra lista!",
      body: "Ya puedes leer tu historia en el Imperio. Gracias por apoyar a quienes escriben.",
      tone: "success",
      icon: "check",
    };
  }

  if (searchParams.get("subscription") === "success") {
    return {
      kind: "subscription",
      title: "¡Bienvenida, Socia del Imperio!",
      body: "Tu membresía está activa. Gracias por apoyar a los autores independientes.",
      tone: "success",
      icon: "sparkles",
    };
  }

  if (
    searchParams.get("subscription") === "canceled" ||
    searchParams.get("purchase") === "canceled" ||
    searchParams.get("donate") === "canceled"
  ) {
    return {
      kind: "canceled",
      title: "Pago cancelado",
      body: "No se realizó ningún cobro. Puedes intentarlo de nuevo cuando quieras.",
      tone: "neutral",
      icon: "check",
    };
  }

  if (searchParams.get("payment") === "error") {
    return {
      kind: "error",
      title: "Hubo un problema con el pago",
      body: "Si te cobraron, el acceso puede tardar un momento. Si no, inténtalo de nuevo.",
      tone: "error",
      icon: "check",
    };
  }

  return null;
}

const CLEAR_KEYS = [
  "donated",
  "purchased",
  "purchase",
  "subscription",
  "donate",
  "payment",
] as const;

function PaymentSuccessModalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, refreshUserProfile } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const feedback = useMemo(() => resolveFeedback(searchParams), [searchParams]);

  const clearQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    for (const key of CLEAR_KEYS) {
      if (params.has(key)) {
        params.delete(key);
        changed = true;
      }
    }
    if (!changed) return;
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    setDismissed(false);
  }, [feedback?.kind, searchParams.toString()]);

  useEffect(() => {
    if (!feedback || feedback.kind !== "subscription" || !user) return;
    void refreshUserProfile();
  }, [feedback, user, refreshUserProfile]);

  const handleClose = () => {
    setDismissed(true);
    clearQuery();
  };

  if (!feedback || dismissed) return null;

  const Icon =
    feedback.icon === "heart" ? Heart : feedback.icon === "sparkles" ? Sparkles : CheckCircle2;

  const iconWrap =
    feedback.tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : feedback.tone === "error"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-feedback-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sidebar bg-paper p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted transition-colors hover:bg-sidebar/60 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${iconWrap}`}>
          <Icon className="h-6 w-6" />
        </div>

        <h2
          id="payment-feedback-title"
          className="font-serif text-2xl font-bold text-ink pr-8"
        >
          {feedback.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{feedback.body}</p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-6 w-full rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export function PaymentSuccessModal() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessModalInner />
    </Suspense>
  );
}
