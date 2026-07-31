"use client";

import { useCallback, useEffect, useRef } from "react";
import { READING_PING_INTERVAL_SECONDS } from "@/lib/monetization/constants";
import type { User } from "firebase/auth";

interface UseReadingTimeTrackerOptions {
  user: User | null;
  bookId: string;
  chapterId: string;
  isActive: boolean;
  isSubscriptionRead: boolean;
}

export function useReadingTimeTracker({
  user,
  bookId,
  chapterId,
  isActive,
  isSubscriptionRead,
}: UseReadingTimeTrackerOptions) {
  const lastTickRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const hasRecentInteractionRef = useRef(false);

  const sendPing = useCallback(
    async (seconds: number) => {
      if (!user || seconds <= 0) return;

      const isTabVisible = document.visibilityState === "visible";
      if (!isTabVisible) return;

      try {
        const token = await user.getIdToken();
        await fetch("/api/tracking/reading-time", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookId,
            chapterId,
            readingTimeSeconds: seconds,
            isSubscriptionRead,
            isTabVisible: true,
            hasRecentInteraction: hasRecentInteractionRef.current,
          }),
          keepalive: true,
        });
      } catch {
        // Tracking no debe interrumpir la lectura.
      } finally {
        hasRecentInteractionRef.current = false;
      }
    },
    [user, bookId, chapterId, isSubscriptionRead],
  );

  useEffect(() => {
    const markInteraction = () => {
      hasRecentInteractionRef.current = true;
    };

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) {
        lastTickRef.current = Date.now();
      }
    };

    window.addEventListener("scroll", markInteraction, { passive: true });
    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("touchstart", markInteraction, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", markInteraction);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!isActive || !user) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (!visibleRef.current || document.visibilityState !== "visible") return;

      const now = Date.now();
      const last = lastTickRef.current ?? now;
      const elapsed = Math.min(
        READING_PING_INTERVAL_SECONDS + 5,
        Math.max(1, Math.round((now - last) / 1000)),
      );
      lastTickRef.current = now;

      void sendPing(elapsed);
    }, READING_PING_INTERVAL_SECONDS * 1000);

    return () => {
      window.clearInterval(interval);
      if (lastTickRef.current && document.visibilityState === "visible") {
        const elapsed = Math.min(
          READING_PING_INTERVAL_SECONDS + 5,
          Math.max(1, Math.round((Date.now() - lastTickRef.current) / 1000)),
        );
        void sendPing(elapsed);
      }
    };
  }, [isActive, user, sendPing]);
}
