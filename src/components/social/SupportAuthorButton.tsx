"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";
import { SupportAuthorModal } from "@/components/social/SupportAuthorModal";

interface SupportAuthorButtonProps {
  authorId: string;
  authorName: string;
  redirectTo?: string;
  className?: string;
  variant?: "primary" | "soft";
}

export function SupportAuthorButton({
  authorId,
  authorName,
  redirectTo,
  className = "",
  variant = "soft",
}: SupportAuthorButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? `inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 ${className}`
            : `inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 ${className}`
        }
      >
        <Coffee className="h-4 w-4" />
        Apoyar Autor ☕
      </button>

      {open && (
        <SupportAuthorModal
          authorId={authorId}
          authorName={authorName}
          redirectTo={redirectTo}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
