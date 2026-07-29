"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Crown, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { openStripeBillingPortal } from "@/lib/stripe-checkout";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";

export function SubscriptionSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, isSubscriber, refreshUserProfile } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("subscription");
    if (!status || !user) return;

    if (status === "success") {
      setMessage("¡Pago recibido! Activando tu membresía…");
      void refreshUserProfile().then(() => {
        setMessage("¡Bienvenida, Socia del Imperio! Tu acceso premium ya está activo.");
      });
    } else if (status === "canceled") {
      setMessage("El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.");
    }

    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);
  }, [searchParams, user, refreshUserProfile, router]);

  const handleManage = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      await openStripeBillingPortal(user);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo abrir el portal de Stripe",
      );
      setPortalLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <Crown className="h-5 w-5 text-[#D4A359]" />
        <h2 className="font-serif text-xl font-bold text-ink">Mi Suscripción</h2>
      </div>

      {message && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="rounded-2xl border border-sidebar bg-white/70 p-6">
        {isSubscriber ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#D4A359]/15 px-3 py-1 text-xs font-semibold text-[#8B6914]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Socia del Imperio ✦ — Activa
              </p>
              <p className="mt-3 text-sm text-muted">
                Tienes acceso ilimitado a todos los capítulos premium del Imperio.
              </p>
              {userProfile?.subscribedAt && (
                <p className="mt-1 text-xs text-muted">
                  Miembro desde{" "}
                  {new Date(userProfile.subscribedAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleManage}
              disabled={portalLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-terracotta/30 bg-white px-5 py-2.5 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/5 disabled:opacity-60"
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Gestionar / Cancelar
            </button>
          </div>
        ) : (
          <div>
            <p className="font-medium text-ink">Aún no eres Socia del Imperio</p>
            <p className="mt-2 text-sm text-muted">
              Suscríbete por ${DEFAULT_SUBSCRIPTION_PRICE.toFixed(2)} USD/mes para desbloquear todos
              los capítulos premium y apoyar a los autores.
            </p>
            <p className="mt-3 text-xs text-muted">
              Puedes suscribirte desde cualquier capítulo premium o desde la página de un libro.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
