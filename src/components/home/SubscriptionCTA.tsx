"use client";

import { useState } from "react";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BRAND_NAME } from "@/lib/brand";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";

export function SubscriptionCTA() {
  const { user, loading, isSubscriber, openAuthModal, subscribe } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSubscribe = async () => {
    if (loading) return;

    if (!user) {
      openAuthModal("/biblioteca");
      return;
    }

    if (isSubscriber) return;

    setCheckoutLoading(true);
    try {
      await subscribe({ redirectTo: "/biblioteca", priceUsd: DEFAULT_SUBSCRIPTION_PRICE });
    } catch {
      setCheckoutLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-900/15 bg-gradient-to-br from-imperial-deep via-[#7A3328] to-imperial-dark p-6 text-white shadow-editorial-lg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute inset-0 shadow-inset" />

      <div className="relative">
        <Sparkles className="h-6 w-6 text-gold-light transition-transform duration-300 hover:scale-110" />
        <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-gold-cream">
          Únete a {BRAND_NAME}
        </h2>
        <p className="mt-2 text-sm text-white/85">
          Acceso ilimitado a toda la biblioteca, invita un café al Imperio y descubre nuevos
          capítulos cada semana.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-white/90">
          <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
            <BookOpen className="h-4 w-4 shrink-0 text-gold-light" />
            Acceso a toda la biblioteca
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
            <BookOpen className="h-4 w-4 shrink-0 text-gold-light" />
            Nuevos capítulos semanales
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-gold/10 bg-white/5 px-3 py-2">
            <BookOpen className="h-4 w-4 shrink-0 text-gold-light" />
            Invita un café al Imperio
          </li>
        </ul>

        {isSubscriber ? (
          <p className="mt-5 rounded-full bg-gold-cream/20 py-2.5 text-center text-sm font-semibold text-gold-cream">
            Ya eres Socia del Imperio ✦
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={checkoutLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold-cream py-2.5 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-md transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Invita un café al Imperio — ${DEFAULT_SUBSCRIPTION_PRICE.toFixed(2)}/mes
          </button>
        )}
      </div>
    </section>
  );
}
