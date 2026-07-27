"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToFavorite, toggleFavorite } from "@/lib/library";

interface FavoriteButtonProps {
  bookId: string;
}

export function FavoriteButton({ bookId }: FavoriteButtonProps) {
  const { user, openAuthModal } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      setReady(true);
      return;
    }

    setReady(false);
    const unsubscribe = subscribeToFavorite(user.uid, bookId, (value) => {
      setIsFavorite(value);
      setReady(true);
    });

    return unsubscribe;
  }, [user, bookId]);

  const handleClick = async () => {
    if (!user) {
      openAuthModal(`/libro/${bookId}`);
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(user.uid, bookId, isFavorite);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || (!!user && !ready)}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
        isFavorite
          ? "border-terracotta bg-terracotta/10 text-terracotta"
          : "border-sidebar bg-white/70 text-ink hover:border-terracotta hover:text-terracotta"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFavorite ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {isFavorite ? "En mi biblioteca" : "Añadir a mi biblioteca 🔖"}
    </button>
  );
}
