"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  authModalRedirect?: string;
}

export function AuthGuard({
  children,
  redirectTo = "/",
  authModalRedirect,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal(authModalRedirect ?? redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, openAuthModal, router, redirectTo, authModalRedirect]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
