import { FieldValue } from "firebase-admin/firestore";
import type { ReadingSession } from "@/types/monetization";
import {
  COLLECTIONS,
  PREMIUM_VIEW_DEDUP_SECONDS,
  READING_CAP_WITHOUT_INTERACTION_SECONDS,
  STATISTICAL_VIEW_MIN_ACTIVE_SECONDS,
} from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import { incrementPoolReadingSeconds } from "@/lib/monetization/monthly-pool-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export interface RecordReadingTimeInput {
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  readingTimeSeconds: number;
  isSubscriptionRead: boolean;
  isTabVisible: boolean;
  hasRecentInteraction: boolean;
}

export interface RecordReadingSessionResult {
  session: ReadingSession;
  poolSecondsCredited: number;
  countsAsStatisticalView: boolean;
}

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

function statisticalViewWindowDocId(
  monthYear: string,
  userId: string,
  chapterId: string,
): string {
  return `${monthYear}_${userId}_${chapterId}`;
}

function readingCapSessionDocId(userId: string, chapterId: string): string {
  return `${userId}_${chapterId}`;
}

async function computePoolSecondsCredit(
  userId: string,
  chapterId: string,
  requestedSeconds: number,
  hasRecentInteraction: boolean,
): Promise<number> {
  if (requestedSeconds <= 0) return 0;

  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const ref = adminDb
    .collection(COLLECTIONS.readingCapSessions)
    .doc(readingCapSessionDocId(userId, chapterId));

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = new Date().toISOString();

    let continuousWithoutInteraction = snap.exists
      ? Number(snap.data()?.continuousWithoutInteraction ?? 0)
      : 0;

    if (hasRecentInteraction) {
      continuousWithoutInteraction = 0;
    }

    const remainingAllowance = Math.max(
      0,
      READING_CAP_WITHOUT_INTERACTION_SECONDS - continuousWithoutInteraction,
    );
    const credited = Math.min(requestedSeconds, remainingAllowance);

    continuousWithoutInteraction += requestedSeconds;

    tx.set(
      ref,
      {
        userId,
        chapterId,
        continuousWithoutInteraction,
        lastInteractionAt: hasRecentInteraction ? now : snap.data()?.lastInteractionAt ?? null,
        updatedAt: now,
      },
      { merge: true },
    );

    return credited;
  });
}

async function tryCountStatisticalView(
  userId: string,
  chapterId: string,
  monthYear: string,
  activeSecondsToAdd: number,
): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const ref = adminDb
    .collection(COLLECTIONS.statisticalViewWindows)
    .doc(statisticalViewWindowDocId(monthYear, userId, chapterId));

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    const accumulatedActiveSeconds =
      Number(snap.data()?.accumulatedActiveSeconds ?? 0) + activeSecondsToAdd;

    const lastViewAt = String(snap.data()?.lastStatisticalViewAt ?? "");
    const lastViewMs = lastViewAt ? new Date(lastViewAt).getTime() : 0;
    const dedupActive = lastViewMs > 0 && nowMs - lastViewMs < PREMIUM_VIEW_DEDUP_SECONDS * 1000;

    if (dedupActive) {
      tx.set(
        ref,
        { accumulatedActiveSeconds, lastPingAt: nowIso, userId, chapterId, monthYear },
        { merge: true },
      );
      return false;
    }

    if (accumulatedActiveSeconds < STATISTICAL_VIEW_MIN_ACTIVE_SECONDS) {
      tx.set(
        ref,
        { accumulatedActiveSeconds, lastPingAt: nowIso, userId, chapterId, monthYear },
        { merge: true },
      );
      return false;
    }

    tx.set(
      ref,
      {
        lastStatisticalViewAt: nowIso,
        lastPingAt: nowIso,
        accumulatedActiveSeconds: 0,
        userId,
        chapterId,
        monthYear,
      },
      { merge: true },
    );
    return true;
  });
}

async function incrementAuthorReadingSeconds(
  authorId: string,
  seconds: number,
  monthYear: string,
): Promise<void> {
  if (seconds <= 0) return;

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear));

  const now = new Date().toISOString();

  await ref.set(
    {
      authorId,
      monthYear,
      accumulatedReadingSeconds: FieldValue.increment(seconds),
      totalReadingSeconds: FieldValue.increment(seconds),
      updatedAt: now,
    },
    { merge: true },
  );
}

async function incrementAuthorStatisticalViews(
  authorId: string,
  monthYear: string,
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear));

  const now = new Date().toISOString();

  await ref.set(
    {
      authorId,
      monthYear,
      totalViews: FieldValue.increment(1),
      totalPremiumViews: FieldValue.increment(1),
      updatedAt: now,
    },
    { merge: true },
  );
}

async function incrementBookStatisticalViews(
  bookId: string,
  chapterId: string,
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  const bookRef = adminDb.collection("books").doc(bookId);
  const chapterRef = adminDb.collection("chapters").doc(chapterId);
  const now = new Date().toISOString();

  await Promise.all([
    bookRef.set({ totalViews: FieldValue.increment(1), updatedAt: now }, { merge: true }),
    chapterRef.set({ totalViews: FieldValue.increment(1), updatedAt: now }, { merge: true }),
  ]);
}

export async function recordReadingSession(
  input: RecordReadingTimeInput,
): Promise<RecordReadingSessionResult> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();
  const ref = adminDb.collection(COLLECTIONS.readingSessions).doc();

  let poolSecondsCredited = 0;

  if (input.isSubscriptionRead && input.isTabVisible) {
    poolSecondsCredited = await computePoolSecondsCredit(
      input.userId,
      input.chapterId,
      input.readingTimeSeconds,
      input.hasRecentInteraction,
    );
  }

  const countsAsStatisticalView = await tryCountStatisticalView(
    input.userId,
    input.chapterId,
    monthYear,
    input.readingTimeSeconds,
  );

  const session: ReadingSession = {
    id: ref.id,
    userId: input.userId,
    bookId: input.bookId,
    chapterId: input.chapterId,
    authorId: input.authorId,
    readingTimeSeconds: input.readingTimeSeconds,
    poolReadingSecondsCredited: poolSecondsCredited,
    isSubscriptionRead: input.isSubscriptionRead,
    countsAsStatisticalView,
    readAt: now,
  };

  await ref.set(session);

  const tasks: Promise<void>[] = [];

  if (poolSecondsCredited > 0) {
    tasks.push(
      incrementPoolReadingSeconds(poolSecondsCredited, monthYear),
      incrementAuthorReadingSeconds(input.authorId, poolSecondsCredited, monthYear),
    );
  }

  if (countsAsStatisticalView) {
    tasks.push(
      incrementAuthorStatisticalViews(input.authorId, monthYear),
      incrementBookStatisticalViews(input.bookId, input.chapterId),
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }

  return { session, poolSecondsCredited, countsAsStatisticalView };
}

export async function getAuthorAccumulatedReadingSeconds(
  authorId: string,
  monthYear: string,
): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (!snap.exists) return 0;
  const data = snap.data()!;
  return Number(data.accumulatedReadingSeconds ?? data.totalReadingSeconds ?? 0);
}

export async function getAuthorReadingSeconds(
  authorId: string,
  monthYear: string,
): Promise<number> {
  return getAuthorAccumulatedReadingSeconds(authorId, monthYear);
}

export async function getAuthorStatisticalViews(
  authorId: string,
  monthYear: string,
): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (!snap.exists) return 0;
  const data = snap.data()!;
  return Number(data.totalViews ?? data.totalPremiumViews ?? 0);
}

export async function getAuthorPremiumViews(
  authorId: string,
  monthYear: string,
): Promise<number> {
  return getAuthorStatisticalViews(authorId, monthYear);
}

export async function getCombinedAuthorStatisticalViews(
  authorIds: string[],
  monthYear: string,
): Promise<number> {
  let total = 0;
  for (const authorId of authorIds) {
    total += await getAuthorStatisticalViews(authorId, monthYear);
  }
  return total;
}

export async function getCombinedAuthorPremiumViews(
  authorIds: string[],
  monthYear: string,
): Promise<number> {
  return getCombinedAuthorStatisticalViews(authorIds, monthYear);
}

export async function getCombinedAuthorReadingSeconds(
  authorIds: string[],
  monthYear: string,
): Promise<number> {
  let total = 0;
  for (const authorId of authorIds) {
    total += await getAuthorAccumulatedReadingSeconds(authorId, monthYear);
  }
  return total;
}

export interface BookReadingStats {
  totalViews: number;
  accumulatedReadingSeconds: number;
  chapters: Map<string, number>;
}

export async function getBookReadingStatsForAuthor(
  authorIds: string[],
  monthYear: string,
): Promise<Map<string, BookReadingStats>> {
  const adminDb = await getAdminDb();
  const stats = new Map<string, BookReadingStats>();
  if (!adminDb) return stats;

  const start = `${monthYear}-01T00:00:00.000Z`;
  const [year, month] = monthYear.split("-").map(Number);
  const endDate = new Date(Date.UTC(year!, month!, 0, 23, 59, 59, 999));
  const end = endDate.toISOString();

  const authorIdSet = new Set(authorIds);
  const snap = await adminDb.collection(COLLECTIONS.readingSessions).get();

  for (const doc of snap.docs) {
    const data = doc.data();
    const readAt = String(data.readAt ?? "");
    if (readAt < start || readAt > end) continue;

    const authorId = String(data.authorId ?? "");
    if (!authorIdSet.has(authorId)) continue;

    const bookId = String(data.bookId ?? "");
    if (!bookId) continue;

    const current = stats.get(bookId) ?? {
      totalViews: 0,
      accumulatedReadingSeconds: 0,
      chapters: new Map<string, number>(),
    };

    current.accumulatedReadingSeconds += Number(
      data.poolReadingSecondsCredited ?? (data.isSubscriptionRead ? data.readingTimeSeconds : 0),
    );

    if (data.countsAsStatisticalView === true) {
      current.totalViews += 1;
      const chapterId = String(data.chapterId ?? "");
      if (chapterId) {
        current.chapters.set(chapterId, (current.chapters.get(chapterId) ?? 0) + 1);
      }
    }

    stats.set(bookId, current);
  }

  return stats;
}

export async function getBookPremiumViewStats(
  authorIds: string[],
  monthYear: string,
): Promise<Map<string, { premiumViews: number; readingSeconds: number; chapters: Map<string, number> }>> {
  const stats = await getBookReadingStatsForAuthor(authorIds, monthYear);
  const legacy = new Map<string, { premiumViews: number; readingSeconds: number; chapters: Map<string, number> }>();

  for (const [bookId, bookStats] of stats) {
    legacy.set(bookId, {
      premiumViews: bookStats.totalViews,
      readingSeconds: bookStats.accumulatedReadingSeconds,
      chapters: bookStats.chapters,
    });
  }

  return legacy;
}
