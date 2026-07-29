"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, PenLine, User } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Explorar", href: "/" },
  { label: "Mis Lecturas", href: "/biblioteca" },
  { label: "Mi Cuenta", href: "/biblioteca" },
  { label: "Conócenos", href: "/conocenos" },
];

export function Navbar() {
  const router = useRouter();
  const { user, userProfile, loading, restoringSession, isSubscriber, openAuthModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleStartReading = () => {
    if (loading) return;

    if (!user) {
      openAuthModal("/libro/pedro-amor-cafe");
      return;
    }

    router.push("/libro/pedro-amor-cafe");
  };

  const displayName = userProfile?.displayName ?? user?.displayName ?? "Lector";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showLogin = !user && !loading && !restoringSession;
  const showProfile = !!user;
  const showSessionPlaceholder = (loading || restoringSession) && !user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#D27C5A] bg-[#2A1810] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group">
          <BrandLogo variant="navbar" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stone-300 transition-colors duration-300 hover:text-[#D27C5A]"
            >
              {link.label}
            </Link>
          ))}
          {showProfile && (
            <Link
              href="/autor"
              className="text-sm font-semibold text-[#D4A359] transition-colors duration-300 hover:text-[#D27C5A]"
            >
              Panel del Autor
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isSubscriber && showProfile && (
            <span className="hidden items-center gap-1 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/20 px-3 py-1 text-xs font-semibold text-[#D4A359] sm:inline-flex">
              Socio del Imperio ✦
            </span>
          )}
          {showSessionPlaceholder ? (
            <div
              className="h-9 w-9 animate-pulse rounded-full bg-[#3D2518]"
              aria-label="Restaurando sesión"
            />
          ) : showLogin ? (
            <>
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="hidden text-sm font-medium text-stone-300 transition-colors duration-300 hover:text-[#D27C5A] sm:block"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={handleStartReading}
                className="rounded-full bg-gradient-to-r from-[#D27C5A] to-[#D4A359] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg sm:px-5 sm:text-sm"
              >
                Comenzar Lectura
              </button>
            </>
          ) : showProfile ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((open) => !open);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[#D27C5A]/30 bg-[#3D2518] py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#D27C5A]/60"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-8 w-8 rounded-full border border-[#2A1810] object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A1810] bg-[#D27C5A] text-xs font-bold text-[#FCF9F5]">
                    {initials}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-[#FCF9F5] sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-stone-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-[60] mt-2 w-52 overflow-hidden rounded-xl border border-[#D27C5A]/20 bg-[#FCF9F5] py-1 shadow-xl"
                >
                  {isSubscriber && (
                    <div className="border-b border-[#D27C5A]/15 px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#D4A359]">Socio del Imperio ✦</span>
                      <p className="text-xs text-stone-500">Acceso ilimitado activo</p>
                    </div>
                  )}
                  <Link
                    href="/autor"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2A1810] transition-colors hover:bg-[#D27C5A]/10"
                  >
                    <PenLine className="h-4 w-4 text-[#D27C5A]" />
                    Panel del Autor
                  </Link>
                  <Link
                    href="/biblioteca"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2A1810] transition-colors hover:bg-[#D27C5A]/10"
                  >
                    <User className="h-4 w-4 text-stone-500" />
                    Mi Biblioteca
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#2A1810] transition-colors hover:bg-[#D27C5A]/10"
                  >
                    <LogOut className="h-4 w-4 text-stone-500" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
