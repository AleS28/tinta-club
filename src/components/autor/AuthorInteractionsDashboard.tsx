"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle, Users } from "lucide-react";
import type { AuthorInteractionsFeed } from "@/types/social";
import { useAuth } from "@/context/AuthContext";

export function AuthorInteractionsDashboard() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<AuthorInteractionsFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/author/interactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as AuthorInteractionsFeed & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudieron cargar las interacciones.");
        return;
      }
      setFeed(payload);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  if (loading && !feed) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error && !feed) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
        {error}
      </div>
    );
  }

  if (!feed) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sidebar bg-white/80 p-5">
          <Users className="mb-2 h-5 w-5 text-terracotta" />
          <p className="text-2xl font-bold text-ink">{feed.followerCount}</p>
          <p className="text-sm text-muted">Seguidores</p>
        </div>
        <div className="rounded-2xl border border-sidebar bg-white/80 p-5 sm:col-span-2">
          <Heart className="mb-2 h-5 w-5 text-terracotta" />
          <p className="text-sm font-semibold text-ink">Me gusta por obra</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {feed.bookLikeCounts.length === 0 ? (
              <span className="text-sm text-muted">Aún no hay likes.</span>
            ) : (
              feed.bookLikeCounts.map((row) => (
                <span
                  key={row.bookId}
                  className="rounded-full bg-sidebar px-3 py-1 text-xs font-medium text-ink"
                >
                  {row.title}: {row.count}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <section>
        <h3 className="mb-4 font-serif text-lg font-bold text-ink">Últimos seguidores</h3>
        {feed.followers.length === 0 ? (
          <p className="text-sm text-muted">Todavía no tienes seguidores registrados.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {feed.followers.map((follower) => (
              <li
                key={follower.followerId}
                className="rounded-xl border border-sidebar bg-white/70 px-4 py-3 text-sm"
              >
                <p className="font-medium text-ink">{follower.followerDisplayName}</p>
                <p className="text-xs text-muted">
                  {new Date(follower.createdAt).toLocaleDateString("es")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-terracotta" />
          <h3 className="font-serif text-lg font-bold text-ink">Actividad reciente</h3>
        </div>
        {feed.items.length === 0 ? (
          <p className="text-sm text-muted">Sin comentarios ni likes recientes.</p>
        ) : (
          <ul className="space-y-3">
            {feed.items.map((item) => (
              <li key={`${item.type}-${"commentId" in item ? item.commentId : item.bookId}-${item.createdAt}`} className="rounded-xl border border-sidebar bg-white/70 px-4 py-3">
                {item.type === "like" ? (
                  <>
                    <p className="text-sm text-ink">
                      <Heart className="mr-1 inline h-4 w-4 fill-terracotta text-terracotta" />
                      <strong>{item.userDisplayName}</strong> le dio me gusta a{" "}
                      <strong>{item.bookTitle}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink">
                      <strong>{item.userDisplayName}</strong> comentó en{" "}
                      <strong>{item.bookTitle}</strong> · {item.chapterTitle}
                    </p>
                    <p className="mt-1 text-sm text-muted line-clamp-2">{item.text}</p>
                  </>
                )}
                <p className="mt-1 text-xs text-muted">
                  {new Date(item.createdAt).toLocaleString("es")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
