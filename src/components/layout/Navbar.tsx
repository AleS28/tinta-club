"use client";

import Link from "next/link";
import { PenLine, Search } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, loading, restoringSession, isSubscriber, role, openAuthModal } = useAuth();

  const showLogin = !user && !loading && !restoringSession;
  const showProfile = !!user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#D27C5A] bg-[#2A1810] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group shrink-0">
          <BrandLogo variant="navbar" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/buscar"
            className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:text-gold-cream"
          >
            Explorar
          </Link>
          <Link
            href="/conocenos"
            className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:text-gold-cream"
          >
            Conócenos
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSubscriber && showProfile && role !== "admin" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/20 px-3 py-1 text-xs font-semibold text-[#D4A359]">
              Socio del Imperio ✦
            </span>
          )}

          <Link
            href="/buscar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4A359]/30 text-[#D4A359] transition-colors hover:bg-[#D4A359]/10 md:hidden"
            aria-label="Explorar"
          >
            <Search className="h-4 w-4" />
          </Link>

          {showLogin && (
            <>
              <button
                type="button"
                onClick={() => openAuthModal("/biblioteca")}
                className="hidden rounded-full border border-stone-500/40 px-4 py-2 text-xs font-semibold text-stone-200 transition-colors hover:border-gold-cream/50 hover:text-gold-cream sm:inline-flex sm:text-sm"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("/biblioteca", { intent: "reader" })}
                className="hidden rounded-full bg-gold-cream px-4 py-2 text-xs font-bold text-imperial-dark transition-colors hover:bg-white sm:inline-flex sm:text-sm"
              >
                Registrarse
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("/autor/acuerdo", { intent: "author" })}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#D4A359] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/20 sm:px-5 sm:text-sm"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Soy Escritor</span>
                <span className="sm:hidden">Autor</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
