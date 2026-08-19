"use client";

import { useAuth } from "@/context/AuthContext";

export function HomeJoinBanner() {
  const { user, loading, restoringSession, openAuthModal } = useAuth();
  const showRegister = !user && !loading && !restoringSession;

  const handleRegister = () => openAuthModal("/biblioteca", { intent: "reader" });

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-imperial-gold/30 bg-gradient-to-br from-imperial-surface via-[#1a1410] to-imperial-dark px-6 py-10 text-center sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "url('/textures/literary-pattern.png')",
              backgroundSize: "400px auto",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imperial-gold/50 to-transparent" />
          <h2 className="relative font-display text-2xl font-bold uppercase tracking-[0.08em] text-imperial-gold sm:text-3xl">
            Únete al Imperio hoy
          </h2>
          <p className="relative mt-3 text-sm text-gold-cream/75 sm:text-base">
            Registro gratis · lectura en lanzamiento · comunidad de autores y lectores
          </p>
          <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {showRegister ? (
              <>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-gradient-to-r from-imperial-gold via-gold-light to-imperial-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-imperial-dark shadow-lg shadow-imperial-gold/20 transition-all hover:scale-105"
                >
                  Regístrate gratis
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-imperial-gold/50 bg-imperial-gold/10 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-imperial-gold transition-all hover:bg-imperial-gold/20"
                >
                  Explorar y leer
                </button>
              </>
            ) : (
              <p className="text-sm font-semibold text-gold-cream">
                Ya eres parte del Imperio ✦
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
