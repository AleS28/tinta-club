"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OwnProfileActionsProps {
  profileId: string;
}

export function OwnProfileActions({ profileId }: OwnProfileActionsProps) {
  const { user, isSubscriber, role, logout } = useAuth();

  if (!user || user.uid !== profileId) return null;

  return (
    <section className="mt-6 rounded-2xl border border-sidebar bg-white/70 p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Tu cuenta</h2>

      {isSubscriber && role !== "admin" && (
        <p className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#D4A359]/50 bg-[#D4A359]/15 px-3 py-1 text-xs font-semibold text-[#B8860B]">
          Socio del Imperio ✦
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {role === "admin" && (
          <Link
            href="/administracion/finanzas"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#D4A359]/40 bg-[#D4A359]/10 px-4 py-3 text-sm font-semibold text-[#8B6914] transition-colors hover:border-[#D4A359] hover:bg-[#D4A359]/20 sm:justify-start"
          >
            <Shield className="h-4 w-4" />
            Administración
          </Link>
        )}
        {role === "author" && (
          <Link
            href="/autor"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#D4A359]/40 bg-[#D4A359]/10 px-4 py-3 text-sm font-semibold text-[#8B6914] transition-colors hover:border-[#D4A359] hover:bg-[#D4A359]/20 sm:justify-start"
          >
            <LayoutDashboard className="h-4 w-4" />
            Panel del Autor
          </Link>
        )}
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 rounded-xl border border-sidebar px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-terracotta hover:bg-terracotta/5 hover:text-terracotta sm:justify-start"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </section>
  );
}
