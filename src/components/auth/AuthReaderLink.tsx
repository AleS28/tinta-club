"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthReaderLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Enlace a un capítulo que exige iniciar sesión antes de abrir el lector. */
export function AuthReaderLink({ href, className, children }: AuthReaderLinkProps) {
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      openAuthModal(href);
      return;
    }

    event.preventDefault();
    router.push(href);
  };

  if (!loading && user) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
