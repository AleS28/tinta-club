"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bookmark, Users } from "lucide-react";
import { Book } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookCard } from "@/components/home/BookCard";
import { SubscriptionSection } from "@/components/biblioteca/SubscriptionSection";
import { PurchasedLibrarySection } from "@/components/mi-biblioteca/PurchasedLibraryPanel";
import { getFavoriteBooks, getFollowedAuthors } from "@/lib/library";
import type { PublicAuthorProfile } from "@/types/author";

export function LibraryPanel() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [following, setFollowing] = useState<PublicAuthorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLibrary = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [favoriteBooks, followedAuthors] = await Promise.all([
        getFavoriteBooks(user.uid),
        getFollowedAuthors(user.uid),
      ]);
      setFavorites(favoriteBooks);
      setFollowing(followedAuthors);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    const shouldScroll =
      searchParams.get("purchased") === "true" ||
      searchParams.get("section") === "compras" ||
      window.location.hash === "#compras";
    if (!shouldScroll) return;

    const timer = window.setTimeout(() => {
      document.getElementById("compras")?.scrollIntoView({ behavior: "smooth" });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <AuthGuard redirectTo="/">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink">Mi Biblioteca</h1>
          <p className="mt-2 text-muted">
            Suscripción, compras, favoritos y autores que sigues
          </p>
        </header>

        <div className="space-y-10">
          <Suspense fallback={null}>
            <SubscriptionSection />
          </Suspense>

          <PurchasedLibrarySection />

          {loading ? (
            <p className="text-center text-sm text-muted">Cargando favoritos y autores…</p>
          ) : (
            <>
              <section>
              <div className="mb-5 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-terracotta" />
                <h2 className="font-serif text-xl font-bold text-ink">Guardados / Favoritos</h2>
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {favorites.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sidebar bg-white/50 px-6 py-10 text-center">
                  <p className="font-medium text-ink">Aún no tienes libros guardados</p>
                  <p className="mt-1 text-sm text-muted">
                    Usa el botón 🔖 en cualquier libro para añadirlo aquí.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 inline-block text-sm font-medium text-terracotta hover:underline"
                  >
                    Explorar historias
                  </Link>
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center gap-2">
                <Users className="h-5 w-5 text-terracotta" />
                <h2 className="font-serif text-xl font-bold text-ink">Autores Siguiendo</h2>
              </div>

              {following.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {following.map((author) => (
                    <li key={author.id}>
                      <Link
                        href={`/perfil/${author.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-sidebar bg-white/70 p-4 transition-colors hover:border-terracotta/40"
                      >
                        {author.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={author.photoURL}
                            alt={author.displayName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-white">
                            {author.displayName
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-ink">{author.displayName}</p>
                          <p className="text-xs text-muted">Ver perfil del autor</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-sidebar bg-white/50 px-6 py-10 text-center">
                  <p className="font-medium text-ink">Aún no sigues a ningún autor</p>
                  <p className="mt-1 text-sm text-muted">
                    Visita perfiles de autores y pulsa &quot;Seguir Autor&quot;.
                  </p>
                </div>
              )}
            </section>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
