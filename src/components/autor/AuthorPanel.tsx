"use client";

import { useCallback, useEffect, useState } from "react";
import { Feather, PenLine } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { Book } from "@/data/mock";
import { getBooksByAuthorId, getChaptersByAuthorBooks } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthorStats } from "@/components/autor/AuthorStats";
import { AuthorDiscordBanner } from "@/components/autor/AuthorDiscordBanner";
import { MyBooksList } from "@/components/autor/MyBooksList";
import { PublishBookForm } from "@/components/autor/PublishBookForm";
import { PublishChapterForm } from "@/components/autor/PublishChapterForm";

type Tab = "books" | "publish";

export function AuthorPanel() {
  const { user, userProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [totalChapters, setTotalChapters] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const loadAuthorData = useCallback(async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const authorBooks = await getBooksByAuthorId(user.uid);
      setBooks(authorBooks);

      const chapters = await getChaptersByAuthorBooks(authorBooks.map((b) => b.id));
      setTotalChapters(chapters.length);

      const counts: Record<string, number> = {};
      for (const chapter of chapters) {
        counts[chapter.bookId] = (counts[chapter.bookId] ?? 0) + 1;
      }
      setChapterCounts(counts);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadAuthorData();
  }, [loadAuthorData]);

  const simulatedEarnings = totalChapters * 12.5 + books.length * 45;

  return (
    <AuthGuard redirectTo="/">
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
                <Feather className="inline h-3.5 w-3.5 text-terracotta" /> Autor del Imperio · {BRAND_NAME}
              </p>
            </div>
          </div>
        </header>

        <AuthorDiscordBanner />

        <AuthorStats
          bookCount={books.length}
          chapterCount={totalChapters}
          totalEarnings={simulatedEarnings}
        />

        <div className="mt-8 flex rounded-full bg-sidebar p-1">
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
            Publicar Nuevo Libro / Capítulo
          </button>
        </div>

        <div className="mt-6">
          {loadingData ? (
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
    </AuthGuard>
  );
}
