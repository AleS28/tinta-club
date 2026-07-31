"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BookLikeButtonProps {
  bookId: string;
  className?: string;
}

export function BookLikeButton({ bookId, className = "" }: BookLikeButtonProps) {
  const { user, openAuthModal } = useAuth();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      if (user) {
        headers.Authorization = `Bearer ${await user.getIdToken()}`;
      }
      const response = await fetch(`/api/books/${bookId}/likes`, { headers });
      const payload = (await response.json()) as { count?: number; likedByMe?: boolean };
      if (response.ok) {
        setCount(payload.count ?? 0);
        setLiked(Boolean(payload.likedByMe));
      }
    } finally {
      setLoading(false);
    }
  }, [bookId, user]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleToggle = async () => {
    if (!user) {
      openAuthModal(`/libro/${bookId}`);
      return;
    }

    setToggling(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/books/${bookId}/likes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as { count?: number; likedByMe?: boolean };
      if (response.ok) {
        setCount(payload.count ?? 0);
        setLiked(Boolean(payload.likedByMe));
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading || toggling}
      className={`inline-flex items-center gap-2 rounded-full border border-sidebar bg-white/80 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-terracotta/40 disabled:opacity-60 ${className}`}
      aria-pressed={liked}
    >
      {toggling ? (
        <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
      ) : (
        <Heart
          className={`h-4 w-4 ${liked ? "fill-terracotta text-terracotta" : "text-muted"}`}
        />
      )}
      <span className={liked ? "text-terracotta" : "text-ink"}>
        {loading ? "…" : count} Me gusta
      </span>
    </button>
  );
}
