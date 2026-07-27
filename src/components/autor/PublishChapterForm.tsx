"use client";

import { FormEvent, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Book } from "@/data/mock";
import { createChapter } from "@/lib/db";

interface PublishChapterFormProps {
  books: Book[];
  onSuccess: () => void;
}

export function PublishChapterForm({ books, onSuccess }: PublishChapterFormProps) {
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const [number, setNumber] = useState("1");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!bookId) {
      setError("Primero publica un libro para agregar capítulos.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const paragraphs = content
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      if (paragraphs.length === 0) {
        setError("Escribe al menos un párrafo de contenido.");
        setLoading(false);
        return;
      }

      await createChapter({
        bookId,
        number: parseInt(number, 10) || 1,
        title: title.trim(),
        content: paragraphs,
        isPremium,
      });

      setSuccess("¡Capítulo publicado exitosamente!");
      setTitle("");
      setContent("");
      setNumber(String(parseInt(number, 10) + 1));
      onSuccess();
    } catch {
      setError("No pudimos publicar el capítulo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sidebar bg-white/50 px-6 py-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 font-serif text-lg font-bold text-ink">Publica un libro primero</p>
        <p className="mt-1 text-sm text-muted">
          Necesitas al menos un libro para agregar capítulos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-sidebar bg-white/70 p-6 shadow-sm">
      <div>
        <h3 className="font-serif text-lg font-bold text-ink">Agregar capítulo</h3>
        <p className="mt-1 text-sm text-muted">
          Separa párrafos con líneas en blanco. Marca como Premium para contenido exclusivo.
        </p>
      </div>

      <div>
        <label htmlFor="chapter-book" className="mb-1.5 block text-xs font-medium text-muted">
          Libro
        </label>
        <select
          id="chapter-book"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="chapter-number" className="mb-1.5 block text-xs font-medium text-muted">
            Número de capítulo
          </label>
          <input
            id="chapter-number"
            type="number"
            min="1"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
          />
        </div>

        <div>
          <label htmlFor="chapter-title" className="mb-1.5 block text-xs font-medium text-muted">
            Título del capítulo
          </label>
          <input
            id="chapter-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. El comienzo del viaje"
            className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
          />
        </div>
      </div>

      <div>
        <label htmlFor="chapter-content" className="mb-1.5 block text-xs font-medium text-muted">
          Contenido
        </label>
        <textarea
          id="chapter-content"
          required
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido del capítulo aquí. Cada párrafo separado por una línea en blanco."
          className="w-full resize-y rounded-xl border border-sidebar bg-paper px-4 py-2.5 font-serif text-sm leading-relaxed text-ink outline-none focus:border-terracotta"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-sidebar bg-paper px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {isPremium ? "Capítulo Premium 🔒" : "Capítulo Gratis"}
          </p>
          <p className="text-xs text-muted">
            {isPremium
              ? "Solo accesible para suscriptores"
              : "Accesible para todos los lectores"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPremium}
          onClick={() => setIsPremium((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            isPremium ? "bg-terracotta" : "bg-sidebar"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              isPremium ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Publicar capítulo
      </button>
    </form>
  );
}
