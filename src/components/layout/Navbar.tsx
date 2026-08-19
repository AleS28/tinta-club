"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PenLine, Search } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const { user, loading, restoringSession, isSubscriber, role, openAuthModal } = useAuth();
  const [query, setQuery] = useState("");

  const showLogin = !user && !loading && !restoringSession;
  const showProfile = !!user;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/buscar?q=${encodeURIComponent(trimmed)}` : "/buscar");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-imperial-gold/30 bg-[#1a120c] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group shrink-0">
          <BrandLogo variant="navbar" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/buscar"
            className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:text-imperial-gold"
          >
            Explorar
          </Link>
          <Link
            href="/conocenos"
            className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:text-imperial-gold"
          >
            Conócenos
          </Link>
          {showProfile && (
            <Link
              href="/biblioteca"
              className="rounded-full border border-imperial-gold/35 px-4 py-2 text-sm font-medium text-imperial-gold transition-colors hover:border-imperial-gold/60 hover:bg-imperial-gold/10"
            >
              Mi Biblioteca
            </Link>
          )}
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden max-w-xs flex-1 items-center md:flex lg:max-w-sm"
        >
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-imperial-gold/70"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar obras..."
              className="w-full rounded-full border border-imperial-gold/30 bg-black/30 py-2 pl-9 pr-4 text-sm text-gold-cream placeholder:text-gold-cream/40 focus:border-imperial-gold/50 focus:outline-none focus:ring-1 focus:ring-imperial-gold/30"
              aria-label="Buscar obras"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSubscriber && showProfile && role !== "admin" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-imperial-gold/40 bg-imperial-gold/15 px-3 py-1 text-xs font-semibold text-imperial-gold">
              Socio del Imperio ✦
            </span>
          )}

          <Link
            href="/buscar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-imperial-gold/30 text-imperial-gold transition-colors hover:bg-imperial-gold/10 md:hidden"
            aria-label="Explorar"
          >
            <Search className="h-4 w-4" />
          </Link>

          {showLogin && (
            <>
              <button
                type="button"
                onClick={() => openAuthModal("/biblioteca")}
                className="hidden rounded-full border border-stone-500/40 px-4 py-2 text-xs font-semibold text-stone-200 transition-colors hover:border-imperial-gold/50 hover:text-imperial-gold sm:inline-flex sm:text-sm"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("/biblioteca", { intent: "reader" })}
                className="hidden rounded-full bg-gradient-to-r from-imperial-gold to-gold-light px-4 py-2 text-xs font-bold text-imperial-dark transition-opacity hover:opacity-90 sm:inline-flex sm:text-sm"
              >
                Registrarse
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("/autor/acuerdo", { intent: "author" })}
                className="inline-flex items-center gap-2 rounded-full border border-imperial-gold/50 bg-imperial-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-imperial-gold transition-all duration-300 hover:border-imperial-gold hover:bg-imperial-gold/20 sm:px-5 sm:text-sm"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Soy Escritor</span>
                <span className="sm:hidden">Autor</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent" />
    </header>
  );
}
