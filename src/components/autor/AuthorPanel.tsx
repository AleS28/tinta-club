"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Feather, PenLine, Shield } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { Book } from "@/data/mock";
import { getBooksByAuthorId, getChaptersByAuthorBooks } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { hasAuthorPanelAccess, isAdminUser } from "@/types/user";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthorFinancialDashboard } from "@/components/autor/AuthorFinancialDashboard";
import { AuthorDiscordBanner } from "@/components/autor/AuthorDiscordBanner";
import { AuthorAgreementBanner } from "@/components/autor/AuthorAgreementBanner";
import { MyBooksList } from "@/components/autor/MyBooksList";
import { PublishBookForm } from "@/components/autor/PublishBookForm";
import { PublishChapterForm } from "@/components/autor/PublishChapterForm";

type Tab = "dashboard" | "books" | "publish";

export function AuthorPanel() {
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "libros" ? "books" : tabParam === "publicar" ? "publish" : "dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  const loadAuthorData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const authorBooks = await getBooksByAuthorId(user.uid, userProfile?.legacyAuthorId);
      setBooks(authorBooks);

      const chapters = await getChaptersByAuthorBooks(authorBooks.map((b) => b.id));

      const counts: Record<string, number> = {};
      for (const chapter of chapters) {
        counts[chapter.bookId] = (counts[chapter.bookId] ?? 0) + 1;
      }
      setChapterCounts(counts);
    } finally {
      setLoadingData(false);
    }
  }, [user, userProfile?.legacyAuthorId]);

  useEffect(() => {
    loadAuthorData();
  }, [loadAuthorData]);

  return (
    <AuthGuard redirectTo="/" authModalRedirect="/autor">
      {!hasAuthorPanelAccess(userProfile) ? (
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold text-ink">Panel solo para autores</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Esta sección es para autores y administradoras del Imperio. Si acabas de
            registrarte con un email autorizado, cierra sesión e inicia de nuevo.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-terracotta px-8 py-3 text-sm font-bold text-white hover:bg-orange-700"
          >
            Volver al inicio
          </Link>
        </main>
      ) : (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-terracotta/10 p-3">
                <PenLine className="h-6 w-6 text-terracotta" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {isAdminUser(userProfile) ? "Panel de Administración" : "Panel del Autor"}
                </h1>
                <p className="text-sm text-muted">
                  Bienvenida, {userProfile?.displayName ?? "Autor"} ·{" "}
                  <Feather className="inline h-3.5 w-3.5 text-terracotta" />{" "}
                  {isAdminUser(userProfile) ? "Administradora del Imperio" : "Autor del Imperio"} · {BRAND_NAME}
                  {userProfile?.authorSlug && (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        href={`/autor/${userProfile.authorSlug}`}
                        className="text-terracotta hover:underline"
                      >
                        Ver perfil público
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
            {isAdminUser(userProfile) && (
              <Link
                href="/administracion/finanzas"
                className="inline-flex items-center gap-2 rounded-full border border-imperial-deep/30 bg-imperial-dark/5 px-4 py-2 text-sm font-semibold text-imperial-deep hover:bg-imperial-dark/10"
              >
                <Shield className="h-4 w-4" />
                Reporte Financiero
              </Link>
            )}
          </div>
        </header>

        <AuthorDiscordBanner />
        <AuthorAgreementBanner />

        <div className="mt-8 flex rounded-full bg-sidebar p-1">
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === "dashboard" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Finanzas
          </button>
          <button
            type="button"
            onClick={() => setTab("books")}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === "books" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Mis Libros
          </button>
          <button
            type="button"
            onClick={() => setTab("publish")}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === "publish" ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Publicar
          </button>
        </div>

        <div className="mt-6">
          {tab === "dashboard" ? (
            <AuthorFinancialDashboard />
          ) : loadingData ? (
            <p className="text-center text-sm text-muted">Cargando tus obras...</p>
          ) : tab === "books" ? (
            <MyBooksList books={books} chapterCounts={chapterCounts} />
          ) : (
            <div className="space-y-8">
              <PublishBookForm onSuccess={loadAuthorData} />
              <PublishChapterForm books={books} onSuccess={loadAuthorData} />
            </div>
          )}
        </div>
      </main>
      )}
    </AuthGuard>
  );
}
