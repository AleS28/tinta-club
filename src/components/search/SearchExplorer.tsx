"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Book } from "@/data/mock";
import { BookCard } from "@/components/home/BookCard";
import {
  getHomeCategoryBySlug,
  matchesHomeCategory,
} from "@/data/home-categories";

interface SearchExplorerProps {
  books: Book[];
}

export function SearchExplorer({ books }: SearchExplorerProps) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("categoria")?.trim().toLowerCase() ?? "";
  const activeCategory = categorySlug ? getHomeCategoryBySlug(categorySlug) : undefined;
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    let filtered = books;

    if (activeCategory) {
      filtered = filtered.filter((book) => matchesHomeCategory(book, activeCategory.slug));
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) return filtered;

    return filtered.filter(
      (book) =>
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.genre.toLowerCase().includes(normalized) ||
        (book.genres ?? []).some((genre) => genre.toLowerCase().includes(normalized)),
    );
  }, [activeCategory, books, query]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">
          {activeCategory ? activeCategory.label : "Buscar historias"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {activeCategory
            ? "Obras disponibles en esta categoría"
            : "Encuentra obras, autores y géneros"}
        </p>
        {activeCategory && (
          <Link
            href="/buscar"
            className="mt-3 inline-block text-sm font-medium text-terracotta hover:underline"
          >
            Ver todas las categorías
          </Link>
        )}
      </header>

      <label className="relative mb-8 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título, autor o género…"
          className="w-full rounded-2xl border border-sidebar bg-white py-3.5 pl-12 pr-4 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted focus:border-terracotta"
          autoFocus
        />
      </label>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-sidebar bg-white/70 px-6 py-10 text-center text-sm text-muted">
          {query.trim()
            ? `No encontramos resultados para "${query}"${activeCategory ? ` en ${activeCategory.label}` : ""}.`
            : activeCategory
              ? `Aún no hay obras publicadas en ${activeCategory.label}.`
              : "No hay obras disponibles."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {!query.trim() && !activeCategory && (
        <p className="mt-8 text-center text-xs text-muted">
          También puedes explorar por categoría desde{" "}
          <Link href="/" className="font-medium text-terracotta hover:underline">
            Inicio
          </Link>
          .
        </p>
      )}
    </main>
  );
}
