"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";

export function AnnouncementBar() {
  const { user, loading, restoringSession, isSubscriber, openAuthModal, subscribe } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSubscribe = async () => {
    if (loading || restoringSession || checkoutLoading || isSubscriber) return;

    if (!user) {
      openAuthModal("/", { intent: "subscribe" });
      return;
    }

    setCheckoutLoading(true);
    try {
      await subscribe({ redirectTo: "/", priceUsd: DEFAULT_SUBSCRIPTION_PRICE });
    } catch {
      setCheckoutLoading(false);
    }
  };

  const sessionLoading = loading || restoringSession;

  return (
    <div className="bg-[#3D2518] py-2.5 text-center text-xs font-medium text-[#FCF9F5]/90 sm:text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 sm:gap-x-3">
        <span className="rounded-full bg-home-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-cream sm:text-xs">
          Cap. 1-3 Gratis
        </span>

        {isSubscriber ? (
          <>
            <span className="hidden text-[#FCF9F5]/40 sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-gold-cream">
              <Sparkles className="h-3.5 w-3.5 text-[#D4A359]" aria-hidden />
              Gracias por el apoyo — Socio del Imperio ✦
            </span>
          </>
        ) : (
          <>
            <span className="hidden text-[#FCF9F5]/40 sm:inline" aria-hidden>
              ·
            </span>
            <span>
              <span className="font-semibold text-gold-cream">
                ${DEFAULT_SUBSCRIPTION_PRICE.toFixed(2)}/mes
              </span>
              {" "}— Sé parte de nuestro imperio
            </span>
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={sessionLoading || checkoutLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A359]/60 bg-gradient-to-r from-[#D4A359] via-[#F5E6C8] to-[#C9A961] px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2A1D17] shadow-md shadow-[#D4A359]/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D4A359]/30 disabled:opacity-60 sm:px-5 sm:text-xs"
            >
              {checkoutLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Suscríbete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
