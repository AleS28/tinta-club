import { FieldValue } from "firebase-admin/firestore";
import type {
  AuthorBookPerformance,
  AuthorEarningsDashboard,
  AuthorEarningsSummary,
  MonthlyPool,
} from "@/types/monetization";
import { MIN_PAYOUT_USD, COLLECTIONS } from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import {
  closeMonthlyPool,
  getMonthlyPool,
  getOrCreateOpenPool,
} from "@/lib/monetization/monthly-pool-admin";
import { getAuthorDirectSalesTotal } from "@/lib/monetization/direct-sales-admin";
import {
  getAuthorReadingSeconds,
  getBookReadingStats,
} from "@/lib/monetization/reading-tracking-admin";
import { getAdminDb } from "@/lib/firebase-admin";

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

function computeSubscriptionEarnings(
  authorSeconds: number,
  pool: MonthlyPool,
): number {
  if (authorSeconds <= 0 || pool.authorsPool70 <= 0) return 0;

  const totalSeconds = pool.totalPlatformReadingSeconds;
  if (totalSeconds <= 0) return 0;

  const valuePerSecond = pool.valuePerSecond > 0
    ? pool.valuePerSecond
    : pool.authorsPool70 / totalSeconds;

  return authorSeconds * valuePerSecond;
}

function computeIncomeBreakdown(
  subscriptionEarnings: number,
  directSalesEarnings: number,
): { subscriptionPercent: number; directSalesPercent: number } {
  const total = subscriptionEarnings + directSalesEarnings;
  if (total <= 0) {
    return { subscriptionPercent: 0, directSalesPercent: 0 };
  }

  return {
    subscriptionPercent: Math.round((subscriptionEarnings / total) * 100),
    directSalesPercent: Math.round((directSalesEarnings / total) * 100),
  };
}

async function getAuthorBooksFromFirestore(authorId: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const snap = await adminDb
    .collection("books")
    .where("authorId", "==", authorId)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    title: String(doc.data().title ?? "Sin título"),
  }));
}

async function countPremiumChapters(bookId: string): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection("chapters")
    .where("bookId", "==", bookId)
    .where("isPremium", "==", true)
    .get();

  return snap.size;
}

export async function getAuthorEstimatedEarnings(
  authorId: string,
  monthYear = getCurrentMonthYear(),
): Promise<AuthorEarningsDashboard> {
  const pool = (await getMonthlyPool(monthYear)) ?? (await getOrCreateOpenPool(monthYear));

  const [authorSeconds, directSalesEarnings, bookStats, books] = await Promise.all([
    getAuthorReadingSeconds(authorId, monthYear),
    getAuthorDirectSalesTotal(authorId, monthYear),
    getBookReadingStats(authorId, monthYear),
    getAuthorBooksFromFirestore(authorId),
  ]);

  const subscriptionEarnings = computeSubscriptionEarnings(authorSeconds, pool);
  const estimatedBalance = subscriptionEarnings + directSalesEarnings;
  const incomeBreakdown = computeIncomeBreakdown(subscriptionEarnings, directSalesEarnings);

  const valuePerSecond =
    pool.totalPlatformReadingSeconds > 0 && pool.authorsPool70 > 0
      ? pool.authorsPool70 / pool.totalPlatformReadingSeconds
      : 0;

  const bookPerformance: AuthorBookPerformance[] = await Promise.all(
    books.map(async (book) => {
      const stats = bookStats.get(book.id) ?? { readingSeconds: 0, views: 0 };
      const bookSubscriptionShare = computeSubscriptionEarnings(stats.readingSeconds, pool);
      const premiumChapterCount = await countPremiumChapters(book.id);

      return {
        bookId: book.id,
        title: book.title,
        premiumChapterCount,
        totalViews: stats.views,
        readingSeconds: stats.readingSeconds,
        estimatedEarnings: bookSubscriptionShare,
      };
    }),
  );

  bookPerformance.sort((a, b) => b.estimatedEarnings - a.estimatedEarnings);

  const totalViews = Array.from(bookStats.values()).reduce((sum, stats) => sum + stats.views, 0);

  const closedSummary = await getAuthorEarningsSummary(authorId, monthYear);
  const availableForWithdrawal =
    pool.status === "closed" && closedSummary?.isPayoutReady
      ? closedSummary.totalEarnings
      : 0;

  const isPayoutReady =
    pool.status === "closed" &&
    (closedSummary?.totalEarnings ?? estimatedBalance) >= MIN_PAYOUT_USD;

  return {
    monthYear,
    estimatedBalance,
    subscriptionEarnings,
    directSalesEarnings,
    totalReadingSeconds: authorSeconds,
    totalViews,
    availableForWithdrawal,
    isPayoutReady,
    minPayoutThreshold: MIN_PAYOUT_USD,
    pool: {
      subscriptionGross: pool.subscriptionGross,
      subscriptionGatewayFees: pool.subscriptionGatewayFees,
      subscriptionNet: pool.subscriptionNet,
      authorsPool70: pool.authorsPool70,
      totalPlatformReadingSeconds: pool.totalPlatformReadingSeconds,
      valuePerSecond,
      status: pool.status,
    },
    incomeBreakdown,
    bookPerformance,
  };
}

export async function getAuthorEarningsSummary(
  authorId: string,
  monthYear: string,
): Promise<AuthorEarningsSummary | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (!snap.exists) return null;

  const raw = snap.data()!;
  return {
    authorId,
    monthYear,
    totalReadingSeconds: Number(raw.totalReadingSeconds ?? 0),
    estimatedSubscriptionEarnings: Number(raw.estimatedSubscriptionEarnings ?? 0),
    directSalesEarnings: Number(raw.directSalesEarnings ?? 0),
    totalEarnings: Number(raw.totalEarnings ?? 0),
    isPayoutReady: raw.isPayoutReady === true,
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export async function consolidateAuthorEarningsForMonth(
  authorId: string,
  monthYear: string,
  pool: MonthlyPool,
): Promise<AuthorEarningsSummary> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const authorSeconds = await getAuthorReadingSeconds(authorId, monthYear);
  const directSalesEarnings = await getAuthorDirectSalesTotal(authorId, monthYear);
  const estimatedSubscriptionEarnings = computeSubscriptionEarnings(authorSeconds, pool);
  const totalEarnings = estimatedSubscriptionEarnings + directSalesEarnings;
  const now = new Date().toISOString();

  const summary: AuthorEarningsSummary = {
    authorId,
    monthYear,
    totalReadingSeconds: authorSeconds,
    estimatedSubscriptionEarnings,
    directSalesEarnings,
    totalEarnings,
    isPayoutReady: totalEarnings >= MIN_PAYOUT_USD,
    payoutStatus:
      totalEarnings >= MIN_PAYOUT_USD ? "ready_for_payout" : "pending",
    updatedAt: now,
  };

  await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .set(summary, { merge: true });

  if (summary.isPayoutReady) {
    await adminDb.collection("users").doc(authorId).set(
      {
        availableBalance: FieldValue.increment(totalEarnings),
        lastPayoutMonth: monthYear,
      },
      { merge: true },
    );
  }

  return summary;
}

export async function closeMonthAndConsolidate(monthYear: string): Promise<{
  pool: MonthlyPool;
  authorsProcessed: number;
}> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const pool = await closeMonthlyPool(monthYear);

  const authorIds = new Set<string>();
  const monthPrefix = `${monthYear}-`;

  const sessionsSnap = await adminDb.collection(COLLECTIONS.readingSessions).get();

  for (const doc of sessionsSnap.docs) {
    const data = doc.data();
    const readAt = String(data.readAt ?? "");
    if (!readAt.startsWith(monthPrefix)) continue;
    const authorId = String(data.authorId ?? "");
    if (authorId) authorIds.add(authorId);
  }

  const salesSnap = await adminDb.collection(COLLECTIONS.directChapterSales).get();

  for (const doc of salesSnap.docs) {
    const data = doc.data();
    const createdAt = String(data.createdAt ?? "");
    if (!createdAt.startsWith(monthPrefix)) continue;
    const authorId = String(data.authorId ?? "");
    if (authorId) authorIds.add(authorId);
  }

  await Promise.all(
    Array.from(authorIds).map((authorId) =>
      consolidateAuthorEarningsForMonth(authorId, monthYear, pool),
    ),
  );

  await getOrCreateOpenPool(getCurrentMonthYear());

  return { pool, authorsProcessed: authorIds.size };
}
