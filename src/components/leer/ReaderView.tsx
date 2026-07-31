"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Book, Chapter } from "@/data/mock";
import { getPremiumPreviewContent } from "@/lib/chapter-access";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { DEFAULT_DIRECT_CHAPTER_PRICE_USD } from "@/lib/monetization/constants";
import type { StoreBookListing } from "@/types/monetization";
import { useAuth } from "@/context/AuthContext";
import { isPremiumUser } from "@/types/user";
import { ReaderTopbar } from "@/components/leer/ReaderTopbar";
import { ReaderWatermark } from "@/components/leer/ReaderWatermark";
import { PaywallBanner } from "@/components/leer/PaywallBanner";
import { TermsAcceptanceModal } from "@/components/legal/TermsAcceptanceModal";
import { ProtectedContent } from "@/components/ui/ProtectedContent";
import { useReadingTimeTracker } from "@/hooks/useReadingTimeTracker";

interface ReaderViewProps {
  chapter: Chapter;
  book: Book;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}

type ContentAccess = "premium" | "purchase" | "book_purchase" | null;

export function ReaderView({ chapter, book, prevChapter, nextChapter }: ReaderViewProps) {
  const searchParams = useSearchParams();
  const { user, userProfile, isSubscriber, loading, openAuthModal, refreshUserProfile } =
    useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [premiumContent, setPremiumContent] = useState<string[] | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [accessType, setAccessType] = useState<ContentAccess>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [chapterPrice, setChapterPrice] = useState(DEFAULT_DIRECT_CHAPTER_PRICE_USD);
  const [storeListing, setStoreListing] = useState<StoreBookListing | null>(null);

  const subscriptionPrice = DEFAULT_SUBSCRIPTION_PRICE;
  const hasActiveSubscription = isSubscriber && isPremiumUser(userProfile);
  const hasDirectPurchase = accessType === "purchase" || accessType === "book_purchase";

  const watermarkLabel = useMemo(() => {
    if (!user) return "";
    return user.email ?? user.uid.slice(0, 12);
  }, [user]);

  useEffect(() => {
    if (!chapter.isPremium) return;

    fetch("/api/store/catalog")
      .then((res) => res.json())
      .then((payload: { catalog?: StoreBookListing[] }) => {
        const listing = payload.catalog?.find((item) => item.bookId === book.id) ?? null;
        setStoreListing(listing);
        if (listing?.saleMode === "chapter") {
          setChapterPrice(listing.priceUsd);
        }
      })
      .catch(() => {
        // fallback default price
      });
  }, [book.id, chapter.isPremium]);

  const loadPremiumContent = useCallback(async () => {
    if (!user || !chapter.isPremium) return;

    setContentLoading(true);
    setContentError("");

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`/api/chapters/${chapter.id}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        content?: string[];
        access?: ContentAccess;
      };

      if (!response.ok) {
        if (response.status === 403) {
          setContentError(
            "Aún no tienes acceso. Suscríbete, compra este capítulo o el libro completo, o espera unos segundos si acabas de pagar.",
          );
          setAccessType(null);
          return;
        }
        if (response.status === 503) {
          setContentError(
            "El servidor no pudo verificar tu acceso. Revisa que las variables FIREBASE_* estén configuradas.",
          );
          return;
        }
        if (response.status === 401) {
          setContentError("Tu sesión expiró. Cierra sesión e inicia de nuevo.");
          return;
        }
        setContentError(payload.error ?? "No se pudo cargar el capítulo premium.");
        return;
      }

      if (!Array.isArray(payload.content) || payload.content.length === 0) {
        setContentError("El capítulo premium no tiene contenido disponible.");
        return;
      }

      setPremiumContent(payload.content);
      setAccessType(payload.access ?? null);
      setContentError("");
    } catch {
      setContentError("No pudimos conectar con el servidor. Intenta recargar la página.");
      setPremiumContent(null);
    } finally {
      setContentLoading(false);
    }
  }, [chapter.id, chapter.isPremium, user]);

  useEffect(() => {
    if (loading || !user || !chapter.isPremium) return;
    void refreshUserProfile();
  }, [chapter.id, chapter.isPremium, user, loading, refreshUserProfile]);

  useEffect(() => {
    setPremiumContent(null);
    setContentError("");
    setAccessType(null);
    if (chapter.isPremium && user) {
      void loadPremiumContent();
    }
  }, [chapter.id, chapter.isPremium, user, loadPremiumContent]);

  useEffect(() => {
    const purchased =
      searchParams.get("purchased") === "true" || searchParams.get("purchase") === "success";
    if (!purchased || !user || !chapter.isPremium) return;

    const timer = window.setTimeout(() => {
      void loadPremiumContent();
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [searchParams, user, chapter.isPremium, loadPremiumContent]);

  const hasFullAccess =
    !chapter.isPremium || (premiumContent !== null && premiumContent.length > 0);

  const isPremiumLocked = chapter.isPremium && !hasFullAccess;

  useReadingTimeTracker({
    user,
    bookId: book.id,
    chapterId: chapter.id,
    isActive: !!user && hasFullAccess && !contentLoading,
    isSubscriptionRead: hasFullAccess && hasActiveSubscription && !hasDirectPurchase,
  });

  const paragraphs = useMemo(() => {
    if (!chapter.isPremium) return chapter.content;
    if (hasFullAccess && premiumContent) return premiumContent;
    return getPremiumPreviewContent(chapter.content);
  }, [chapter.content, chapter.isPremium, hasFullAccess, premiumContent]);

  const handleSubscribeClick = () => {
    if (!user) {
      openAuthModal(`/leer/${chapter.id}`, { intent: "subscribe" });
      return;
    }
    setShowSubscribeModal(true);
  };

  const handleChapterPurchaseClick = async () => {
    if (!user) {
      openAuthModal(`/leer/${chapter.id}`, { intent: "subscribe" });
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError("");

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`/api/chapters/${chapter.id}/purchase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setPurchaseError(payload.error ?? "No se pudo iniciar la compra.");
        return;
      }

      window.location.href = payload.url;
    } catch {
      setPurchaseError("No pudimos conectar con Stripe.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleBookPurchaseClick = async () => {
    if (!user) {
      openAuthModal(`/leer/${chapter.id}`, { intent: "subscribe" });
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError("");

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`/api/books/${book.id}/purchase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setPurchaseError(payload.error ?? "No se pudo iniciar la compra del libro.");
        return;
      }

      window.location.href = payload.url;
    } catch {
      setPurchaseError("No pudimos conectar con Stripe.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <ReaderTopbar
        bookId={book.id}
        chapterTitle={chapter.title}
        chapterNumber={chapter.number}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />

      <ProtectedContent
        blockKeyboard
        className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      >
        {user && watermarkLabel && <ReaderWatermark identifier={watermarkLabel} />}

        <div className="relative z-10">
          <h1
            className="font-serif font-bold leading-tight text-ink"
            style={{ fontSize: `${fontSize + 6}px` }}
          >
            {chapter.title}
          </h1>

          {chapter.isPremium && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Premium
            </span>
          )}

          {contentLoading && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
              Verificando acceso al capítulo…
            </div>
          )}

          {contentError && isPremiumLocked && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {contentError}
            </p>
          )}

          {purchaseError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {purchaseError}
            </p>
          )}

          {hasFullAccess && hasActiveSubscription && !hasDirectPurchase && (
            <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Socio del Imperio ✦ — Acceso premium verificado
            </p>
          )}

          {hasFullAccess && accessType === "book_purchase" && (
            <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              Libro comprado — Lectura de por vida en el visor
            </p>
          )}

          {hasFullAccess && accessType === "purchase" && (
            <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              Capítulo comprado — Lectura de por vida en el visor
            </p>
          )}

          {!contentLoading && (
            <div className="relative mt-8">
              <div className={`space-y-6 ${isPremiumLocked ? "max-h-[420px] overflow-hidden" : ""}`}>
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="leading-relaxed text-ink/90"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
              {isPremiumLocked && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-paper via-paper/90 to-transparent"
                  aria-hidden
                />
              )}
            </div>
          )}

          {isPremiumLocked && !contentLoading && (
            <PaywallBanner
              price={subscriptionPrice}
              chapterPrice={storeListing?.saleMode === "chapter" ? chapterPrice : undefined}
              bookPrice={storeListing?.saleMode === "book" ? storeListing.priceUsd : undefined}
              onSubscribe={handleSubscribeClick}
              onChapterPurchase={
                storeListing?.saleMode === "chapter" ? handleChapterPurchaseClick : undefined
              }
              onBookPurchase={
                storeListing?.saleMode === "book" ? handleBookPurchaseClick : undefined
              }
              purchaseLoading={purchaseLoading}
            />
          )}

          <nav className="mt-12 flex items-center justify-between gap-4 border-t border-sidebar pt-8">
            {prevChapter ? (
              <Link
                href={`/leer/${prevChapter.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-sidebar bg-white/70 px-4 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:scale-105 hover:border-terracotta hover:text-terracotta"
              >
                <ChevronLeft className="h-4 w-4" />
                Capítulo Anterior
              </Link>
            ) : (
              <div />
            )}

            {nextChapter && hasFullAccess && !contentLoading ? (
              <Link
                href={`/leer/${nextChapter.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700"
              >
                Siguiente Capítulo
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : nextChapter && isPremiumLocked ? (
              <button
                type="button"
                onClick={handleSubscribeClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700"
              >
                Siguiente Capítulo
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </ProtectedContent>

      {showSubscribeModal && (
        <TermsAcceptanceModal
          bookTitle={book.title}
          bookId={book.id}
          chapterNumber={chapter.number >= 4 ? chapter.number : 4}
          priceUsd={subscriptionPrice}
          authorName={book.author}
          redirectTo={`/leer/${chapter.id}`}
          onSuccess={() => {
            setShowSubscribeModal(false);
            void loadPremiumContent();
          }}
          onClose={() => setShowSubscribeModal(false)}
        />
      )}
    </div>
  );
}
