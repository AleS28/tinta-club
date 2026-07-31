"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Coins, Feather, Loader2, PenLine, PlusCircle } from "lucide-react";
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

const authorTabs: Array<{
  id: Tab;
  label: string;
  icon: typeof Coins;
}> = [
  { id: "dashboard", label: "Regalías", icon: Coins },
  { id: "books", label: "Mis Libros", icon: BookOpen },
  { id: "publish", label: "Publicar", icon: PlusCircle },
];

export function AuthorPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuth();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "libros" ? "books" : tabParam === "publicar" ? "publish" : "dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [loadingData, setLoadingData] = useState(true);

  const isAdmin = isAdminUser(userProfile);

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/administracion/finanzas");
    }
  }, [loading, isAdmin, router]);

  const loadAuthorData = useCallback(async () => {
    if (!user || isAdmin) return;

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
  }, [user, userProfile?.legacyAuthorId, isAdmin]);

  useEffect(() => {
    loadAuthorData();
  }, [loadAuthorData]);

  if (isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <AuthGuard redirectTo="/" authModalRedirect="/autor">
      {!hasAuthorPanelAccess(userProfile) ? (
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold text-ink">Panel solo para autores</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Esta sección es para autores del Imperio. Si acabas de registrarte como autora,
            cierra sesión e inicia de nuevo.
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
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-terracotta/10 p-3">
              <PenLine className="h-6 w-6 text-terracotta" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                Panel del Autor
              </h1>
              <p className="text-sm text-muted">
                Bienvenida, {userProfile?.displayName ?? "Autor"} ·{" "}
                <Feather className="inline h-3.5 w-3.5 text-terracotta" /> Autor del Imperio ·{" "}
                {BRAND_NAME}
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
        </header>

        <AuthorDiscordBanner />
        <AuthorAgreementBanner />

        <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border-2 border-[#D27C5A]/25 bg-gradient-to-r from-[#2A1810] via-[#3D2518] to-[#2A1810] p-2 shadow-lg sm:gap-3 sm:p-2.5">
          {authorTabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all duration-200 sm:gap-2 sm:px-3 sm:py-3.5 ${
                  active
                    ? "bg-[#D27C5A] text-white shadow-md shadow-[#D27C5A]/30 ring-2 ring-[#FCF9F5]/20"
                    : "bg-[#FCF9F5]/8 text-[#FCF9F5]/75 hover:bg-[#FCF9F5]/12 hover:text-[#FCF9F5]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem] ${active ? "text-white" : "text-[#D4A359]"}`}
                  strokeWidth={active ? 2.25 : 2}
                />
                <span className={`text-[11px] leading-tight sm:text-sm ${active ? "font-bold" : "font-semibold"}`}>
                  {label}
                </span>
              </button>
            );
          })}
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
