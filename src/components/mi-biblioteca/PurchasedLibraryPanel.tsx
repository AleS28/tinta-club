"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Library } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookCover } from "@/components/ui/BookCover";
import type { Book } from "@/data/mock";

interface PurchasedBookItem {
  type: "book";
  bookId: string;
  title: string;
  author: string;
  coverGradient: string;
  coverAccent: string;
  coverUrl?: string;
  purchasedAt: string;
  readHref: string;
}

interface PurchasedChapterItem {
  type: "chapter";
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  chapterNumber?: number;
  author: string;
  coverGradient: string;
  coverAccent: string;
  coverUrl?: string;
  purchasedAt: string;
  readHref: string;
}

function toBook(item: PurchasedBookItem | PurchasedChapterItem, id: string): Book {
  return {
    id,
    title: item.type === "book" ? item.title : item.bookTitle,
    author: item.author,
    authorId: "",
    genre: "Romance",
    rating: 4.5,
    coverGradient: item.coverGradient,
    coverAccent: item.coverAccent,
    coverUrl: item.coverUrl,
    synopsis: "",
  };
}

export function PurchasedLibrarySection() {
  const { user } = useAuth();
  const [books, setBooks] = useState<PurchasedBookItem[]>([]);
  const [chapters, setChapters] = useState<PurchasedChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPurchases = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/library/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json()) as {
        books?: PurchasedBookItem[];
        chapters?: PurchasedChapterItem[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "No se pudieron cargar tus compras.");
        return;
      }

      setBooks(payload.books ?? []);
      setChapters(payload.chapters ?? []);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPurchases();
  }, [loadPurchases]);

  return (
    <section id="compras" className="scroll-mt-24">
      <div className="mb-5 flex items-center gap-2">
        <Library className="h-5 w-5 text-terracotta" />
        <h2 className="font-serif text-xl font-bold text-ink">Mis compras</h2>
      </div>
      <p className="mb-5 text-sm text-muted">
        Obras y capítulos que compraste. Acceso permanente en el visor web — sin descarga.
      </p>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Cargando tus compras…</p>
      ) : books.length === 0 && chapters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sidebar bg-white/60 px-6 py-10 text-center">
          <p className="font-medium text-ink">Aún no tienes compras individuales</p>
          <p className="mt-1 text-sm text-muted">
            Explora el catálogo y adquiere libros o capítulos premium.
          </p>
          <Link
            href="/tienda"
            className="mt-4 inline-block rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {books.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                Libros completos
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {books.map((item) => (
                  <article
                    key={item.bookId}
                    className="flex gap-4 rounded-2xl border border-sidebar bg-white p-4 shadow-sm"
                  >
                    <BookCover
                      book={toBook(item, item.bookId)}
                      className="h-[120px] w-[80px] shrink-0 rounded-lg"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h4 className="font-serif font-bold text-ink line-clamp-2">{item.title}</h4>
                      <p className="mt-1 text-xs text-muted">{item.author}</p>
                      <p className="mt-2 text-[11px] text-muted">
                        Comprado el{" "}
                        {new Date(item.purchasedAt).toLocaleDateString("es", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <Link
                        href={item.readHref}
                        className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Leer ahora
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {chapters.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                Capítulos sueltos
              </h3>
              <div className="space-y-3">
                {chapters.map((item) => (
                  <article
                    key={item.chapterId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-sidebar bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{item.bookTitle}</p>
                      <h4 className="truncate font-medium text-ink">
                        {item.chapterNumber != null
                          ? `Cap. ${item.chapterNumber}: ${item.chapterTitle}`
                          : item.chapterTitle}
                      </h4>
                    </div>
                    <Link
                      href={item.readHref}
                      className="shrink-0 rounded-full border border-terracotta/30 px-4 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta/5"
                    >
                      Leer
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function PurchasedLibraryPanel() {
  return (
    <AuthGuard redirectTo="/biblioteca">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <PurchasedLibrarySection />
      </main>
    </AuthGuard>
  );
}
