"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { isLaunchMode } from "@/lib/launch";
import { SupportPlatformModal } from "@/components/social/SupportPlatformModal";

export function PlatformCoffeeCTA() {
  const [open, setOpen] = useState(false);
  const launchMode = isLaunchMode();

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-amber-900/15 bg-gradient-to-br from-[#2A1810] via-[#3D2518] to-[#2A1810] p-6 text-white shadow-editorial-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/10" />

        <div className="relative">
          <Coffee className="h-6 w-6 text-gold-light" />
          <h2 className="mt-3 font-serif text-xl font-bold leading-tight text-gold-cream">
            Invita un café al Imperio
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {launchMode
              ? `La lectura es gratis durante el lanzamiento. Si ${BRAND_NAME} te está gustando, puedes invitarnos un café —sin suscripción obligatoria— y ayudarnos a mantener la plataforma y seguir apostando por autores independientes.`
              : `Si quieres apoyar a ${BRAND_NAME} directamente —sin suscripción— puedes invitarnos un café. Ese aporte nos ayuda a mantener la plataforma y seguir apostando por autores independientes.`}
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold-cream/10 py-2.5 text-sm font-bold text-gold-cream transition-all duration-300 hover:bg-gold-cream/20"
          >
            <Coffee className="h-4 w-4" />
            Invita un café al Imperio
          </button>
        </div>
      </section>

      {open && <SupportPlatformModal onClose={() => setOpen(false)} />}
    </>
  );
}
