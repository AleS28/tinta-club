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
  markPoolConsolidated,
} from "@/lib/monetization/monthly-pool-admin";
import { getAuthorDirectSalesBreakdown } from "@/lib/monetization/direct-sales-admin";
import { getAuthorDonationsForMonth } from "@/lib/monetization/donations-admin";
import {
  getCombinedAuthorReadingSeconds,
  getCombinedAuthorStatisticalViews,
  getBookReadingStatsForAuthor,
} from "@/lib/monetization/reading-tracking-admin";
import {
  computeEstimatedPoolEarningsBySeconds,
  distributePoolByReadingSeconds,
} from "@/lib/monetization/pool-distribution";
import {
  buildAuthorIdentityIndex,
  resolveAuthorFromIndex,
} from "@/lib/author-identity-admin";
import { getAdminDb } from "@/lib/firebase-admin";

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

function computeIncomeBreakdown(
  subscriptionEarnings: number,
  directSalesEarnings: number,
  donationsEarnings: number,
): { subscriptionPercent: number; directSalesPercent: number } {
  const total = subscriptionEarnings + directSalesEarnings + donationsEarnings;
  if (total <= 0) {
    return { subscriptionPercent: 0, directSalesPercent: 0 };
  }

  return {
    subscriptionPercent: Math.round((subscriptionEarnings / total) * 100),
    directSalesPercent: Math.round(((directSalesEarnings + donationsEarnings) / total) * 100),
  };
}

async function resolveAuthorAliasIds(authorId: string): Promise<string[]> {
  const identityIndex = await buildAuthorIdentityIndex();
  const identity = resolveAuthorFromIndex(authorId, identityIndex);
  return identity.aliasIds.length > 0 ? identity.aliasIds : [authorId];
}

async function getAuthorBooksFromFirestore(authorIds: string[]) {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const books = new Map<string, { id: string; title: string }>();
  for (const authorId of authorIds) {
    const snap = await adminDb
      .collection("books")
      .where("authorId", "==", authorId)
      .get();

    for (const doc of snap.docs) {
      if (!books.has(doc.id)) {
        books.set(doc.id, {
          id: doc.id,
          title: String(doc.data().title ?? "Sin título"),
        });
      }
    }
  }

  return Array.from(books.values());
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

async function getCombinedDirectSalesBreakdown(authorIds: string[], monthYear: string) {
  const merged = {
    chapterSalesAuthorShare: 0,
    bookSalesAuthorShare: 0,
    totalAuthorShare: 0,
    byBook: new Map<
      string,
      { chapterSalesAuthorShare: number; bookSalesAuthorShare: number }
    >(),
  };

  for (const authorId of authorIds) {
    const breakdown = await getAuthorDirectSalesBreakdown(authorId, monthYear);
    merged.chapterSalesAuthorShare += breakdown.chapterSalesAuthorShare;
    merged.bookSalesAuthorShare += breakdown.bookSalesAuthorShare;
    merged.totalAuthorShare += breakdown.totalAuthorShare;

    for (const row of breakdown.byBook) {
      const entry = merged.byBook.get(row.bookId) ?? {
        chapterSalesAuthorShare: 0,
        bookSalesAuthorShare: 0,
      };
      entry.chapterSalesAuthorShare += row.chapterSalesAuthorShare;
      entry.bookSalesAuthorShare += row.bookSalesAuthorShare;
      merged.byBook.set(row.bookId, entry);
    }
  }

  return merged;
}

export async function getAuthorEstimatedEarnings(
  authorId: string,
  monthYear = getCurrentMonthYear(),
): Promise<AuthorEarningsDashboard> {
  const pool = (await getMonthlyPool(monthYear)) ?? (await getOrCreateOpenPool(monthYear));
  const aliasIds = await resolveAuthorAliasIds(authorId);

  const [authorSeconds, authorViews, directSalesBreakdown, bookStats, books, donationsItems] =
    await Promise.all([
    getCombinedAuthorReadingSeconds(aliasIds, monthYear),
    getCombinedAuthorStatisticalViews(aliasIds, monthYear),
    getCombinedDirectSalesBreakdown(aliasIds, monthYear),
    getBookReadingStatsForAuthor(aliasIds, monthYear),
    getAuthorBooksFromFirestore(aliasIds),
    getAuthorDonationsForMonth(authorId, monthYear),
  ]);

  const directSalesEarnings = directSalesBreakdown.totalAuthorShare;
  const donationsEarnings = donationsItems.reduce((sum, row) => sum + row.authorShare, 0);

  const closedSummary = await getAuthorEarningsSummary(authorId, monthYear);
  const frozenValuePerSecond =
    pool.status === "closed"
      ? (closedSummary?.frozenValuePerSecond ?? pool.valuePerSecond)
      : undefined;

  const valuePerSecond =
    pool.totalPlatformReadingSeconds > 0 && pool.authorsPool70 > 0
      ? pool.authorsPool70 / pool.totalPlatformReadingSeconds
      : 0;

  const { earnings: subscriptionEarnings, valuePerSecond: estimatedValuePerSecond } =
    pool.status === "closed" && closedSummary
      ? {
          earnings: closedSummary.estimatedSubscriptionEarnings,
          valuePerSecond: frozenValuePerSecond ?? pool.valuePerSecond,
        }
      : computeEstimatedPoolEarningsBySeconds(
          authorSeconds,
          pool.authorsPool70,
          pool.totalPlatformReadingSeconds,
          frozenValuePerSecond,
        );

  const estimatedBalance = subscriptionEarnings + directSalesEarnings + donationsEarnings;
  const incomeBreakdown = computeIncomeBreakdown(
    subscriptionEarnings,
    directSalesEarnings,
    donationsEarnings,
  );

  const bookTitleMap = new Map(books.map((b) => [b.id, b.title]));

  const bookPerformance: AuthorBookPerformance[] = await Promise.all(
    books.map(async (book) => {
      const stats = bookStats.get(book.id) ?? {
        totalViews: 0,
        accumulatedReadingSeconds: 0,
        chapters: new Map<string, number>(),
      };
      const { earnings: bookPoolEarnings } = computeEstimatedPoolEarningsBySeconds(
        stats.accumulatedReadingSeconds,
        pool.authorsPool70,
        pool.totalPlatformReadingSeconds,
        frozenValuePerSecond,
      );
      const premiumChapterCount = await countPremiumChapters(book.id);
      const bookDirect = directSalesBreakdown.byBook.get(book.id);

      return {
        bookId: book.id,
        title: book.title,
        premiumChapterCount,
        totalViews: stats.totalViews,
        accumulatedReadingSeconds: stats.accumulatedReadingSeconds,
        readingSeconds: stats.accumulatedReadingSeconds,
        estimatedEarnings: bookPoolEarnings,
        directSalesEarnings: bookDirect
          ? bookDirect.chapterSalesAuthorShare + bookDirect.bookSalesAuthorShare
          : 0,
        chapters: Array.from(stats.chapters.entries()).map(([chapterId, totalViews]) => ({
          chapterId,
          totalViews,
        })),
      };
    }),
  );

  bookPerformance.sort((a, b) => b.estimatedEarnings - a.estimatedEarnings);

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
    donationsEarnings,
    accumulatedReadingSeconds: authorSeconds,
    totalReadingSeconds: authorSeconds,
    totalViews: authorViews,
    estimatedValuePerSecond,
    frozenValuePerSecond,
    availableForWithdrawal,
    isPayoutReady,
    minPayoutThreshold: MIN_PAYOUT_USD,
    pool: {
      subscriptionGross: pool.subscriptionGross,
      subscriptionGatewayFees: pool.subscriptionGatewayFees,
      subscriptionNet: pool.subscriptionNet,
      authorsPool70: pool.authorsPool70,
      totalPlatformReadingSeconds: pool.totalPlatformReadingSeconds,
      valuePerSecond: pool.valuePerSecond || valuePerSecond || estimatedValuePerSecond,
      totalPlatformPremiumViews: pool.totalPlatformPremiumViews,
      valuePerView: pool.valuePerView,
      status: pool.status,
      consolidationId: pool.consolidationId,
      consolidatedAt: pool.consolidatedAt,
    },
    incomeBreakdown,
    bookPerformance,
    directSales: {
      chapterSalesAuthorShare: directSalesBreakdown.chapterSalesAuthorShare,
      bookSalesAuthorShare: directSalesBreakdown.bookSalesAuthorShare,
      totalAuthorShare: directSalesBreakdown.totalAuthorShare,
      byBook: Array.from(directSalesBreakdown.byBook.entries())
        .map(([bookId, shares]) => ({
          bookId,
          title: bookTitleMap.get(bookId) ?? bookId,
          chapterSalesAuthorShare: shares.chapterSalesAuthorShare,
          bookSalesAuthorShare: shares.bookSalesAuthorShare,
          totalAuthorShare: shares.chapterSalesAuthorShare + shares.bookSalesAuthorShare,
        }))
        .filter((row) => row.totalAuthorShare > 0)
        .sort((a, b) => b.totalAuthorShare - a.totalAuthorShare),
    },
    donations: {
      totalAuthorShare: donationsEarnings,
      items: donationsItems.map((row) => ({
        id: row.id,
        donorDisplayName: row.donorDisplayName,
        authorShare: row.authorShare,
        createdAt: row.createdAt,
      })),
    },
  };
}

export async function getAuthorEarningsSummary(
  authorId: string,
  monthYear: string,
): Promise<AuthorEarningsSummary | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const aliasIds = await resolveAuthorAliasIds(authorId);

  for (const id of aliasIds) {
    const snap = await adminDb
      .collection(COLLECTIONS.authorEarningsSummary)
      .doc(earningsSummaryDocId(id, monthYear))
      .get();

    if (snap.exists) {
      const raw = snap.data()!;
      const accumulatedReadingSeconds = Number(
        raw.accumulatedReadingSeconds ?? raw.totalReadingSeconds ?? 0,
      );
      const totalViews = Number(raw.totalViews ?? raw.totalPremiumViews ?? 0);
      const frozenValuePerSecond =
        Number(raw.frozenValuePerSecond ?? raw.frozenValuePerView ?? 0) || undefined;

      return {
        authorId: id,
        monthYear,
        accumulatedReadingSeconds,
        totalReadingSeconds: accumulatedReadingSeconds,
        totalViews,
        totalPremiumViews: totalViews,
        estimatedSubscriptionEarnings: Number(raw.estimatedSubscriptionEarnings ?? 0),
        directSalesEarnings: Number(raw.directSalesEarnings ?? 0),
        totalEarnings: Number(raw.totalEarnings ?? 0),
        isPayoutReady: raw.isPayoutReady === true,
        payoutStatus: raw.payoutStatus as AuthorEarningsSummary["payoutStatus"],
        paidAt: raw.paidAt as string | undefined,
        updatedAt: String(raw.updatedAt ?? ""),
        frozenValuePerSecond,
        frozenValuePerView: frozenValuePerSecond,
      };
    }
  }

  return null;
}

export async function consolidateAuthorEarningsForMonth(
  authorId: string,
  monthYear: string,
  poolShare: {
    poolEarnings: number;
    readingSeconds: number;
    totalViews: number;
    frozenValuePerSecond: number;
  },
  directSalesEarnings: number,
): Promise<AuthorEarningsSummary> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const docRef = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear));

  const existingSnap = await docRef.get();
  const alreadyConsolidated =
    existingSnap.exists && existingSnap.data()?.walletCredited === true;

  const totalEarnings = poolShare.poolEarnings + directSalesEarnings;
  const now = new Date().toISOString();

  const summary: AuthorEarningsSummary = {
    authorId,
    monthYear,
    accumulatedReadingSeconds: poolShare.readingSeconds,
    totalReadingSeconds: poolShare.readingSeconds,
    totalViews: poolShare.totalViews,
    totalPremiumViews: poolShare.totalViews,
    estimatedSubscriptionEarnings: poolShare.poolEarnings,
    directSalesEarnings,
    totalEarnings,
    isPayoutReady: totalEarnings >= MIN_PAYOUT_USD,
    payoutStatus: totalEarnings >= MIN_PAYOUT_USD ? "ready_for_payout" : "pending",
    frozenValuePerSecond: poolShare.frozenValuePerSecond,
    frozenValuePerView: poolShare.frozenValuePerSecond,
    updatedAt: now,
  };

  await docRef.set({ ...summary, walletCredited: alreadyConsolidated ? true : undefined }, { merge: true });

  if (summary.isPayoutReady && !alreadyConsolidated) {
    await adminDb.collection("users").doc(authorId).set(
      {
        availableBalance: FieldValue.increment(totalEarnings),
        lastPayoutMonth: monthYear,
      },
      { merge: true },
    );
    await docRef.set({ walletCredited: true }, { merge: true });
  }

  return summary;
}

async function collectCanonicalAuthorIdsForMonth(monthYear: string): Promise<string[]> {
  const adminDb = await getAdminDb();
  const identityIndex = await buildAuthorIdentityIndex();
  const canonicalIds = new Set<string>();
  const monthPrefix = `${monthYear}-`;

  if (!adminDb) return [];

  const [summariesSnap, chapterSalesSnap, bookSalesSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.authorEarningsSummary).get(),
    adminDb.collection(COLLECTIONS.directChapterSales).get(),
    adminDb.collection(COLLECTIONS.directBookSales).get(),
  ]);

  for (const doc of summariesSnap.docs) {
    if (!doc.id.endsWith(`_${monthYear}`)) continue;
    const rawId = doc.id.replace(`_${monthYear}`, "");
    const data = doc.data();
    const hasActivity =
      Number(data.accumulatedReadingSeconds ?? data.totalReadingSeconds ?? 0) > 0 ||
      Number(data.totalViews ?? data.totalPremiumViews ?? 0) > 0;
    if (!hasActivity) continue;
    const resolved = resolveAuthorFromIndex(rawId, identityIndex);
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of chapterSalesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const authorId = String(data.authorId ?? "");
    if (!authorId) continue;
    const resolved = resolveAuthorFromIndex(authorId, identityIndex);
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of bookSalesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const authorId = String(data.authorId ?? "");
    if (!authorId) continue;
    const resolved = resolveAuthorFromIndex(authorId, identityIndex);
    canonicalIds.add(resolved.canonicalId);
  }

  return Array.from(canonicalIds);
}

export async function closeMonthAndConsolidate(monthYear: string): Promise<{
  pool: MonthlyPool;
  authorsProcessed: number;
  alreadyClosed: boolean;
  consolidationId?: string;
}> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  let pool = (await getMonthlyPool(monthYear)) ?? (await getOrCreateOpenPool(monthYear));

  if (pool.status === "closed" && pool.consolidationId) {
    return {
      pool,
      authorsProcessed: pool.authorsConsolidatedCount ?? 0,
      alreadyClosed: true,
      consolidationId: pool.consolidationId,
    };
  }

  pool = await closeMonthlyPool(monthYear);

  const consolidationId = pool.consolidationId ?? `close_${monthYear}_${Date.now()}`;
  const frozenValuePerSecond = pool.valuePerSecond;

  const canonicalAuthorIds = await collectCanonicalAuthorIdsForMonth(monthYear);
  const identityIndex = await buildAuthorIdentityIndex();

  const authorReadingShares = await Promise.all(
    canonicalAuthorIds.map(async (authorId) => {
      const identity = resolveAuthorFromIndex(authorId, identityIndex);
      const [readingSeconds, totalViews] = await Promise.all([
        getCombinedAuthorReadingSeconds(identity.aliasIds, monthYear),
        getCombinedAuthorStatisticalViews(identity.aliasIds, monthYear),
      ]);
      return { authorId: identity.canonicalId, readingSeconds, totalViews };
    }),
  );

  const distribution = distributePoolByReadingSeconds(pool.authorsPool70, authorReadingShares);

  await Promise.all(
    authorReadingShares.map(async ({ authorId, readingSeconds, totalViews }) => {
      const directSalesEarnings = (
        await getCombinedDirectSalesBreakdown(
          resolveAuthorFromIndex(authorId, identityIndex).aliasIds,
          monthYear,
        )
      ).totalAuthorShare;

      return consolidateAuthorEarningsForMonth(
        authorId,
        monthYear,
        {
          poolEarnings: distribution.byAuthor.get(authorId) ?? 0,
          readingSeconds,
          totalViews,
          frozenValuePerSecond,
        },
        directSalesEarnings,
      );
    }),
  );

  await markPoolConsolidated(monthYear, {
    consolidationId,
    authorsConsolidatedCount: canonicalAuthorIds.length,
    totalPoolDistributed: distribution.totalDistributed,
    roundingAdjustmentCents: distribution.roundingAdjustmentCents,
    valuePerSecond: frozenValuePerSecond,
  });

  pool = (await getMonthlyPool(monthYear))!;

  await getOrCreateOpenPool(getCurrentMonthYear());

  return {
    pool,
    authorsProcessed: canonicalAuthorIds.length,
    alreadyClosed: false,
    consolidationId,
  };
}
