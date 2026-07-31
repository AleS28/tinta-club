"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdminUser } from "@/types/user";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && !isAdminUser(userProfile)) {
      router.push("/");
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm text-muted">Inicia sesión como administradora para continuar.</p>
      </div>
    );
  }

  if (!isAdminUser(userProfile)) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-terracotta" />
        <h2 className="mt-4 font-serif text-2xl font-bold text-ink">Acceso restringido</h2>
        <p className="mt-2 text-sm text-muted">Esta sección es exclusiva para administradoras del Imperio.</p>
      </main>
    );
  }

  return <>{children}</>;
}
