"use client";

import Link from "next/link";
import { Menu, PenLine, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const publicNavLinks = [{ label: "Conócenos", href: "/conocenos" }];

export function Navbar() {
  const { user, loading, restoringSession, isSubscriber, role, openAuthModal } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  const showLogin = !user && !loading && !restoringSession;
  const showProfile = !!user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#D27C5A] bg-[#2A1810] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group">
          <BrandLogo variant="navbar" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {publicNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stone-300 transition-colors duration-300 hover:text-[#D27C5A]"
            >
              {link.label}
            </Link>
          ))}
          {showProfile && role === "admin" && (
            <Link
              href="/administracion/finanzas"
              className="text-sm font-semibold text-[#D4A359] transition-colors duration-300 hover:text-[#D27C5A]"
            >
              Administración
            </Link>
          )}
          {showProfile && role === "author" && (
            <Link
              href="/autor"
              className="text-sm font-semibold text-[#D4A359] transition-colors duration-300 hover:text-[#D27C5A]"
            >
              Panel del Autor
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileNavOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D27C5A]/30 text-[#FCF9F5] transition-colors hover:border-[#D27C5A]/60 hover:bg-[#3D2518] md:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {isSubscriber && showProfile && role !== "admin" && (
            <span className="hidden items-center gap-1 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/20 px-3 py-1 text-xs font-semibold text-[#D4A359] sm:inline-flex">
              Socio del Imperio ✦
            </span>
          )}
          {showLogin && (
            <button
              type="button"
              onClick={() => openAuthModal("/autor/acuerdo", { intent: "author" })}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#D4A359] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/20 sm:px-5 sm:text-sm"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              Soy Escritor
            </button>
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <nav
          className="border-t border-[#D27C5A]/20 bg-[#2A1810] px-4 py-4 md:hidden"
          aria-label="Navegación móvil"
        >
          <div className="flex flex-col gap-1">
            <Link
              href="/conocenos"
              onClick={closeMobileNav}
              className="rounded-lg px-3 py-3 text-sm font-medium text-stone-200 transition-colors hover:bg-[#3D2518] hover:text-[#D27C5A]"
            >
              Conócenos
            </Link>
            {showProfile && role === "admin" && (
              <Link
                href="/administracion/finanzas"
                onClick={closeMobileNav}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-[#D4A359] transition-colors hover:bg-[#3D2518]"
              >
                Administración
              </Link>
            )}
            {showProfile && role === "author" && (
              <Link
                href="/autor"
                onClick={closeMobileNav}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-[#D4A359] transition-colors hover:bg-[#3D2518]"
              >
                Panel del Autor
              </Link>
            )}
            {showLogin && (
              <button
                type="button"
                onClick={() => {
                  closeMobileNav();
                  openAuthModal("/autor/acuerdo", { intent: "author" });
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#D4A359]"
              >
                <PenLine className="h-4 w-4" aria-hidden />
                Soy Escritor
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
