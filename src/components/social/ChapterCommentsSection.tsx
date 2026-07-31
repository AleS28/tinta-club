"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import type { ChapterComment } from "@/types/social";
import { useAuth } from "@/context/AuthContext";

interface ChapterCommentsSectionProps {
  chapterId: string;
}

export function ChapterCommentsSection({ chapterId }: ChapterCommentsSectionProps) {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterId}/comments`);
      const payload = (await response.json()) as { comments?: ChapterComment[] };
      if (response.ok) setComments(payload.comments ?? []);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      openAuthModal(`/leer/${chapterId}`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/chapters/${chapterId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, parentId: replyTo ?? undefined }),
      });
      const payload = (await response.json()) as { comment?: ChapterComment; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo publicar el comentario.");
        return;
      }
      setText("");
      setReplyTo(null);
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) await loadComments();
  };

  const rootComments = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, ChapterComment[]>>((acc, comment) => {
    if (!comment.parentId) return acc;
    acc[comment.parentId] = [...(acc[comment.parentId] ?? []), comment];
    return acc;
  }, {});

  return (
    <section className="mt-12 border-t border-sidebar pt-8">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-terracotta" />
        <h2 className="font-serif text-xl font-bold text-ink">Comentarios de la comunidad</h2>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mb-6 space-y-3">
        {replyTo && (
          <p className="text-xs text-muted">
            Respondiendo a un comentario ·{" "}
            <button type="button" className="text-terracotta underline" onClick={() => setReplyTo(null)}>
              Cancelar
            </button>
          </p>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={user ? "Comparte tu impresión sobre este capítulo…" : "Inicia sesión para comentar"}
          className="w-full rounded-2xl border border-sidebar bg-white/80 px-4 py-3 text-sm text-ink focus:border-terracotta focus:outline-none"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting || text.trim().length < 2}
          className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "Publicando…" : "Publicar comentario"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
        </div>
      ) : rootComments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sidebar bg-white/50 px-5 py-8 text-center text-sm text-muted">
          Sé la primera persona en comentar este capítulo.
        </p>
      ) : (
        <ul className="space-y-4">
          {rootComments.map((comment) => (
            <li key={comment.id} className="rounded-2xl border border-sidebar bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{comment.userDisplayName}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/90">{comment.text}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{new Date(comment.createdAt).toLocaleString("es")}</span>
                    {user && (
                      <button
                        type="button"
                        onClick={() => setReplyTo(comment.id)}
                        className="font-semibold text-terracotta hover:underline"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                </div>
                {user?.uid === comment.userId && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(comment.id)}
                    className="text-muted hover:text-red-600"
                    aria-label="Eliminar comentario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {(repliesByParent[comment.id] ?? []).length > 0 && (
                <ul className="mt-4 space-y-3 border-l-2 border-sidebar pl-4">
                  {(repliesByParent[comment.id] ?? []).map((reply) => (
                    <li key={reply.id}>
                      <p className="text-sm font-semibold text-ink">{reply.userDisplayName}</p>
                      <p className="mt-1 text-sm text-ink/90">{reply.text}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                        <span>{new Date(reply.createdAt).toLocaleString("es")}</span>
                        {user?.uid === reply.userId && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(reply.id)}
                            className="text-muted hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
