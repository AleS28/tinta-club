"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface StartReadingButtonProps {
  href: string;
  label?: string;
  className?: string;
  requireAuth?: boolean;
}

export function StartReadingButton({
  href,
  label = "Empezar a Leer",
  className = "mt-6 inline-flex rounded-full bg-terracotta px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700",
  requireAuth = false,
}: StartReadingButtonProps) {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();

  const handleClick = () => {
    if (loading) return;

    if (requireAuth && !user) {
      openAuthModal(href);
      return;
    }

    router.push(href);
  };

  if (!requireAuth || user) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
