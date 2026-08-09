"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cancelPayPalSubscription } from "@/lib/paypal-checkout";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { hasComplimentaryPremiumAccess } from "@/types/user";

export function SubscriptionSection() {
  const searchParams = useSearchParams();
  const { user, userProfile, isSubscriber, refreshUserProfile } = useAuth();
  const complimentaryPremium = hasComplimentaryPremiumAccess(userProfile);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // El mensaje visual lo muestra PaymentSuccessModal; aquí solo refrescamos el perfil.
    if (searchParams.get("subscription") === "success" && user) {
      void refreshUserProfile();
    }
  }, [searchParams, user, refreshUserProfile]);

  const handleCancel = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "¿Segura de que quieres cancelar tu suscripción? Perderás el acceso premium al final del ciclo actual.",
    );
    if (!confirmed) return;

    setPortalLoading(true);
    try {
      await cancelPayPalSubscription(user);
      await refreshUserProfile();
      setMessage("Tu suscripción fue cancelada.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo cancelar la suscripción",
      );
    } finally {
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
                {complimentaryPremium
                  ? "Acceso premium de autor — Activo"
                  : "Socia del Imperio ✦ — Activa"}
              </p>
              <p className="mt-3 text-sm text-muted">
                {complimentaryPremium
                  ? "Como autora del Imperio tienes acceso ilimitado a todos los capítulos premium."
                  : "Tienes acceso ilimitado a todos los capítulos premium del Imperio."}
              </p>
              {!complimentaryPremium && userProfile?.subscribedAt && (
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
            {!complimentaryPremium && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={portalLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-terracotta/30 bg-white px-5 py-2.5 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/5 disabled:opacity-60"
              >
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Cancelar suscripción
              </button>
            )}
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
