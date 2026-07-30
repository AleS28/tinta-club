"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Book, Chapter } from "@/data/mock";
import { getPremiumPreviewContent } from "@/lib/chapter-access";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { useAuth } from "@/context/AuthContext";
import { isPremiumUser } from "@/types/user";
import { ReaderTopbar } from "@/components/leer/ReaderTopbar";
import { ReaderWatermark } from "@/components/leer/ReaderWatermark";
import { PaywallBanner } from "@/components/leer/PaywallBanner";
import { TermsAcceptanceModal } from "@/components/legal/TermsAcceptanceModal";
import { ProtectedContent } from "@/components/ui/ProtectedContent";

interface ReaderViewProps {
  chapter: Chapter;
  book: Book;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}

export function ReaderView({ chapter, book, prevChapter, nextChapter }: ReaderViewProps) {
  const { user, userProfile, isSubscriber, loading, openAuthModal, refreshUserProfile } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [premiumContent, setPremiumContent] = useState<string[] | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");

  const subscriptionPrice = book.membershipPrice ?? DEFAULT_SUBSCRIPTION_PRICE;
  const hasActiveSubscription = isSubscriber && isPremiumUser(userProfile);
  const isPremiumLocked = chapter.isPremium && !hasActiveSubscription;

  const watermarkLabel = useMemo(() => {
    if (!user) return "";
    return user.email ?? user.uid.slice(0, 12);
  }, [user]);

  const loadPremiumContent = useCallback(async () => {
    if (!user || !chapter.isPremium || !hasActiveSubscription) return;

    setContentLoading(true);
    setContentError("");

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`/api/chapters/${chapter.id}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        if (response.status === 403) {
          setContentError(
            "Tu cuenta aún no tiene premium activo en el servidor. Vuelve a suscribirte o recarga en unos segundos.",
          );
          return;
        }
        if (response.status === 503) {
          setContentError(
            "El servidor no pudo verificar tu suscripción. Revisa que las variables FIREBASE_* estén configuradas en Vercel.",
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

      const data = payload as { content?: string[] };
      if (!Array.isArray(data.content) || data.content.length === 0) {
        setContentError("El capítulo premium no tiene contenido disponible.");
        return;
      }

      setPremiumContent(data.content);
      setContentError("");
    } catch {
      setContentError("No pudimos conectar con el servidor. Intenta recargar la página.");
      setPremiumContent(null);
    } finally {
      setContentLoading(false);
    }
  }, [chapter.id, chapter.isPremium, hasActiveSubscription, user]);

  useEffect(() => {
    if (loading || !user || !chapter.isPremium) return;
    void refreshUserProfile();
  }, [chapter.id, chapter.isPremium, user, loading, refreshUserProfile]);

  useEffect(() => {
    setPremiumContent(null);
    setContentError("");
    if (chapter.isPremium && hasActiveSubscription && user) {
      loadPremiumContent();
    }
  }, [chapter.id, chapter.isPremium, hasActiveSubscription, user, loadPremiumContent]);

  const hasFullPremiumAccess =
    chapter.isPremium &&
    hasActiveSubscription &&
    premiumContent !== null &&
    premiumContent.length > 0;

  const paragraphs = useMemo(() => {
    if (!chapter.isPremium) return chapter.content;
    if (hasActiveSubscription && premiumContent) return premiumContent;
    return getPremiumPreviewContent(chapter.content);
  }, [chapter.content, chapter.isPremium, hasActiveSubscription, premiumContent]);

  const handleSubscribeClick = () => {
    if (!user) {
      openAuthModal(`/leer/${chapter.id}`, { intent: "subscribe" });
      return;
    }
    setShowSubscribeModal(true);
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

          {contentError && !hasFullPremiumAccess && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {contentError}
            </p>
          )}

          {hasFullPremiumAccess && (
            <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Socio del Imperio ✦ — Acceso premium verificado
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
            <PaywallBanner price={subscriptionPrice} onSubscribe={handleSubscribeClick} />
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

            {nextChapter && !isPremiumLocked && !contentLoading ? (
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
            loadPremiumContent();
          }}
          onClose={() => setShowSubscribeModal(false)}
        />
      )}
    </div>
  );
}
