"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { genres, type Genre } from "@/data/mock";
import { createBook, promoteUserToAuthor } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

interface PublishBookFormProps {
  onSuccess: () => void;
}

export function PublishBookForm({ onSuccess }: PublishBookFormProps) {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genre, setGenre] = useState<Genre>("Fantasía");
  const [coverUrl, setCoverUrl] = useState("");
  const [membershipPrice, setMembershipPrice] = useState("4.99");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createBook({
        title: title.trim(),
        synopsis: synopsis.trim(),
        genre,
        coverUrl: coverUrl.trim() || undefined,
        membershipPrice: parseFloat(membershipPrice) || 4.99,
        authorId: user.uid,
        authorName: userProfile?.displayName ?? user.displayName ?? "Autor",
      });

      if (userProfile?.role === "reader") {
        await promoteUserToAuthor(user.uid);
      }

      setSuccess("¡Libro publicado exitosamente!");
      setTitle("");
      setSynopsis("");
      setCoverUrl("");
      setMembershipPrice("4.99");
      onSuccess();
    } catch {
      setError("No pudimos publicar el libro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-sidebar bg-white/70 p-6 shadow-sm">
      <div>
        <h3 className="font-serif text-lg font-bold text-ink">Publicar nuevo libro</h3>
        <p className="mt-1 text-sm text-muted">Tu obra aparecerá en El Imperio de la Tinta para todos los lectores.</p>
      </div>

      <div>
        <label htmlFor="book-title" className="mb-1.5 block text-xs font-medium text-muted">
          Título
        </label>
        <input
          id="book-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="El título de tu obra"
          className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
        />
      </div>

      <div>
        <label htmlFor="book-synopsis" className="mb-1.5 block text-xs font-medium text-muted">
          Sinopsis
        </label>
        <textarea
          id="book-synopsis"
          required
          rows={4}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="Describe tu historia..."
          className="w-full resize-none rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="book-genre" className="mb-1.5 block text-xs font-medium text-muted">
            Género
          </label>
          <select
            id="book-genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre)}
            className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="book-price" className="mb-1.5 block text-xs font-medium text-muted">
            Precio membresía (USD/mes)
          </label>
          <input
            id="book-price"
            type="number"
            min="0"
            step="0.01"
            value={membershipPrice}
            onChange={(e) => setMembershipPrice(e.target.value)}
            className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
          />
        </div>
      </div>

      <div>
        <label htmlFor="book-cover" className="mb-1.5 block text-xs font-medium text-muted">
          URL de portada (opcional)
        </label>
        <input
          id="book-cover"
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://ejemplo.com/portada.jpg"
          className="w-full rounded-xl border border-sidebar bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta"
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Publicar libro
      </button>
    </form>
  );
}
