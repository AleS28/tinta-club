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
];

export function Navbar() {
  const router = useRouter();
  const { user, userProfile, loading, isSubscriber, openAuthModal, logout } = useAuth();
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
      openAuthModal("/libro/featured-1");
      return;
    }

    router.push("/libro/featured-1");
  };

  const displayName = userProfile?.displayName ?? user?.displayName ?? "Lector";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showLogin = !user && !loading;
  const showProfile = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-sidebar bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group transition-all duration-300 hover:scale-105">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted transition-all duration-300 hover:scale-105 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {showProfile && (
            <Link
              href="/autor"
              className="text-sm font-medium text-terracotta transition-all duration-300 hover:scale-105 hover:text-orange-700"
            >
              Panel del Autor
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isSubscriber && showProfile && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 sm:inline-flex">
              Socio del Imperio ✦
            </span>
          )}
          {loading && !user ? (
            <div
              className="h-9 w-9 animate-pulse rounded-full bg-sidebar"
              aria-label="Cargando sesión"
            />
          ) : showLogin ? (
            <>
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="hidden text-sm font-medium text-muted transition-all duration-300 hover:scale-105 hover:text-terracotta sm:block"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={handleStartReading}
                className="rounded-full bg-terracotta px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700 sm:px-5 sm:text-sm"
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
                className="flex cursor-pointer items-center gap-2 rounded-full border border-sidebar bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-terracotta/40"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-ink sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-[60] mt-2 w-52 overflow-hidden rounded-xl border border-sidebar bg-white py-1 shadow-xl"
                >
                  {isSubscriber && (
                    <div className="border-b border-sidebar px-4 py-2.5">
                      <span className="text-xs font-semibold text-amber-700">Socio del Imperio ✦</span>
                      <p className="text-xs text-muted">Acceso ilimitado activo</p>
                    </div>
                  )}
                  <Link
                    href="/autor"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-sidebar"
                  >
                    <PenLine className="h-4 w-4 text-terracotta" />
                    Panel del Autor
                  </Link>
                  <Link
                    href="/biblioteca"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-sidebar"
                  >
                    <User className="h-4 w-4 text-muted" />
                    Mi Biblioteca
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-sidebar"
                  >
                    <LogOut className="h-4 w-4 text-muted" />
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
