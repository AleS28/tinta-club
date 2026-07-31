"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resolveAccountAvatar } from "@/lib/account-avatar";

const tabs = [
  { id: "home", label: "Inicio", href: "/", icon: Home, match: (path: string) => path === "/" },
  {
    id: "store",
    label: "Tienda",
    href: "/tienda",
    icon: ShoppingBag,
    match: (path: string) => path.startsWith("/tienda"),
  },
  {
    id: "library",
    label: "Biblioteca",
    href: "/biblioteca",
    icon: BookOpen,
    match: (path: string) =>
      path.startsWith("/biblioteca") || path.startsWith("/mi-biblioteca"),
  },
  {
    id: "search",
    label: "Buscar",
    href: "/buscar",
    icon: Search,
    match: (path: string) => path.startsWith("/buscar"),
  },
  {
    id: "about",
    label: "Conócenos",
    href: "/conocenos",
    icon: Heart,
    match: (path: string) => path.startsWith("/conocenos"),
  },
] as const;

function isProfileActive(path: string, uid?: string): boolean {
  if (!uid) return false;
  return path === `/perfil/${uid}`;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, userProfile, openAuthModal } = useAuth();

  if (pathname.startsWith("/leer/")) return null;

  const profileHref = user ? `/perfil/${user.uid}` : null;
  const profileActive = isProfileActive(pathname, user?.uid);
  const avatarUrl = resolveAccountAvatar(user, userProfile);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D27C5A]/25 bg-[#2A1810]/95 backdrop-blur-md print:hidden"
      aria-label="Navegación principal"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-7xl items-end justify-around px-2 pt-2 pb-2 sm:px-4 md:justify-center md:gap-2 lg:gap-6">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex min-w-[3.25rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors sm:min-w-[4rem] sm:px-3 md:min-w-[5rem] md:px-4 md:py-2 ${
                active ? "text-[#D27C5A]" : "text-stone-400 hover:text-stone-200"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors md:h-10 md:w-10 ${
                  active ? "bg-[#D27C5A]/15" : ""
                }`}
              >
                <Icon className="h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]" strokeWidth={active ? 2.25 : 2} />
              </span>
              <span className={`text-[10px] font-medium md:text-xs ${active ? "font-semibold" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {user && profileHref ? (
          <Link
            href={profileHref}
            className={`flex min-w-[3.25rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors sm:min-w-[4rem] sm:px-3 md:min-w-[5rem] md:px-4 md:py-2 ${
              profileActive ? "text-[#D27C5A]" : "text-stone-400 hover:text-stone-200"
            }`}
            aria-current={profileActive ? "page" : undefined}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-colors md:h-10 md:w-10 ${
                profileActive
                  ? "border-[#D27C5A] bg-[#D27C5A]/15"
                  : "border-[#D27C5A]/30 bg-[#3D2518]"
              }`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </span>
            <span className={`text-[10px] font-medium md:text-xs ${profileActive ? "font-semibold" : ""}`}>
              Perfil
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal("/biblioteca")}
            className="flex min-w-[3.25rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-stone-400 transition-colors hover:text-stone-200 sm:min-w-[4rem] sm:px-3 md:min-w-[5rem] md:px-4 md:py-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D27C5A]/30 bg-[#3D2518] md:h-10 md:w-10">
              <User className="h-4 w-4 md:h-[1.1rem] md:w-[1.1rem]" />
            </span>
            <span className="text-[10px] font-medium md:text-xs">Perfil</span>
          </button>
        )}
      </div>
    </nav>
  );
}
