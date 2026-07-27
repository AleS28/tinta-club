"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Book, Chapter } from "@/data/mock";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { useAuth } from "@/context/AuthContext";
import { ReaderTopbar } from "@/components/leer/ReaderTopbar";
import { PaywallBanner } from "@/components/leer/PaywallBanner";
import { SubscribeModal } from "@/components/subscription/SubscribeModal";

const PREVIEW_PARAGRAPHS = 3;

interface ReaderViewProps {
  chapter: Chapter;
  book: Book;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}

export function ReaderView({ chapter, book, prevChapter, nextChapter }: ReaderViewProps) {
  const { user, isSubscriber, loading, openAuthModal } = useAuth();
  const [fontSize, setFontSize] = useState(18);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const subscriptionPrice = book.membershipPrice ?? DEFAULT_SUBSCRIPTION_PRICE;
  const isPremiumLocked = chapter.isPremium && !isSubscriber;

  useEffect(() => {
    if (loading) return;
    if (chapter.isPremium && !user) {
      openAuthModal(`/leer/${chapter.id}`);
    }
  }, [chapter.id, chapter.isPremium, user, loading, openAuthModal]);

  const visibleParagraphs = isPremiumLocked
    ? Math.min(PREVIEW_PARAGRAPHS, chapter.content.length)
    : chapter.content.length;
  const blurredParagraphs = isPremiumLocked ? chapter.content.slice(visibleParagraphs) : [];

  const handleSubscribeClick = () => {
    if (!user) {
      openAuthModal(`/leer/${chapter.id}`);
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

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
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

        <div className="mt-8 space-y-6">
          {chapter.content.slice(0, visibleParagraphs).map((paragraph, index) => (
            <p
              key={index}
              className="leading-relaxed text-ink/90"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}

          {blurredParagraphs.length > 0 && (
            <div className="relative">
              <div
                className="pointer-events-none select-none space-y-6 blur-[6px]"
                aria-hidden="true"
              >
                {blurredParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="leading-relaxed text-ink/90"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper via-paper/80 to-transparent" />
            </div>
          )}
        </div>

        {isPremiumLocked && user && (
          <PaywallBanner price={subscriptionPrice} onSubscribe={handleSubscribeClick} />
        )}

        <nav className="mt-12 flex items-center justify-between gap-4 border-t border-sidebar pt-8">
          {prevChapter ? (
            <Link
              href={`/leer/${prevChapter.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-sidebar bg-white/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              <ChevronLeft className="h-4 w-4" />
              Capítulo Anterior
            </Link>
          ) : (
            <div />
          )}

          {nextChapter && !isPremiumLocked ? (
            <Link
              href={`/leer/${nextChapter.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Siguiente Capítulo
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : nextChapter && isPremiumLocked ? (
            <button
              type="button"
              onClick={handleSubscribeClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Siguiente Capítulo
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}
        </nav>
      </article>

      {showSubscribeModal && (
        <SubscribeModal
          price={subscriptionPrice}
          authorName={book.author}
          onSuccess={() => setShowSubscribeModal(false)}
          onClose={() => setShowSubscribeModal(false)}
        />
      )}
    </div>
  );
}
