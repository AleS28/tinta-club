"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, loading, restoringSession, isSubscriber, role, openAuthModal } = useAuth();

  const showLogin = !user && !loading && !restoringSession;
  const showProfile = !!user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#D27C5A] bg-[#2A1810] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group">
          <BrandLogo variant="navbar" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSubscriber && showProfile && role !== "admin" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/20 px-3 py-1 text-xs font-semibold text-[#D4A359]">
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
    </header>
  );
}
