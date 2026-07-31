import type {
  GlobalFinancialReport,
  AuthorFinancialBreakdown,
  BookFinancialBreakdown,
} from "@/types/admin-financial";
import type { MonthlyPool, PayoutStatus } from "@/types/monetization";
import { COLLECTIONS, MIN_PAYOUT_USD } from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import {
  getMonthlyPool,
  getOrCreateOpenPool,
} from "@/lib/monetization/monthly-pool-admin";
import {
  getAuthorDirectSalesTotal,
  getAuthorDirectSalesBreakdown,
} from "@/lib/monetization/direct-sales-admin";
import { getDonationTotalsForMonth } from "@/lib/monetization/donations-admin";
import {
  getCombinedAuthorReadingSeconds,
  getCombinedAuthorStatisticalViews,
  getBookReadingStatsForAuthor,
} from "@/lib/monetization/reading-tracking-admin";
import {
  computeEstimatedPoolEarningsBySeconds,
  distributePoolByReadingSeconds,
} from "@/lib/monetization/pool-distribution";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  buildAuthorIdentityIndex,
  listCanonicalAuthorIdentities,
  resolveAuthorFromIndex,
  type ResolvedAuthorIdentity,
} from "@/lib/author-identity-admin";
import { founderAuthors, isFounderAuthorIdentity } from "@/data/founder-authors";

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

function resolvePayoutStatus(
  summary: { isPayoutReady?: boolean; payoutStatus?: string } | null,
  pool: MonthlyPool,
  totalEarnings: number,
): PayoutStatus {
  if (summary?.payoutStatus === "paid") return "paid";
  if (pool.status === "closed" && totalEarnings >= MIN_PAYOUT_USD) return "ready_for_payout";
  if (summary?.isPayoutReady) return "ready_for_payout";
  return "pending";
}

async function getDirectSalesTotalsForMonth(monthYear: string): Promise<{
  gross: number;
  gatewayFees: number;
  net: number;
  platformShare: number;
  authorShare: number;
}> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return { gross: 0, gatewayFees: 0, net: 0, platformShare: 0, authorShare: 0 };
  }

  const monthPrefix = `${monthYear}-`;
  const [chapterSnap, bookSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.directChapterSales).get(),
    adminDb.collection(COLLECTIONS.directBookSales).get(),
  ]);

  let gross = 0;
  let gatewayFees = 0;
  let net = 0;
  let platformShare = 0;
  let authorShare = 0;

  for (const doc of [...chapterSnap.docs, ...bookSnap.docs]) {
    const data = doc.data();
    if (data.refundedAt) continue;
    const createdAt = String(data.createdAt ?? "");
    if (!createdAt.startsWith(monthPrefix)) continue;

    gross += Number(data.amountPaid ?? 0);
    gatewayFees += Number(data.gatewayFee ?? 0);
    net += Number(data.amountNet ?? data.amountPaid ?? 0);
    platformShare += Number(data.platformShare ?? 0);
    authorShare += Number(data.authorShare ?? 0);
  }

  return { gross, gatewayFees, net, platformShare, authorShare };
}

async function collectAuthorIdsForMonth(
  monthYear: string,
  identityIndex: Map<string, ResolvedAuthorIdentity>,
): Promise<Set<string>> {
  const adminDb = await getAdminDb();
  const canonicalIds = new Set<string>();

  for (const identity of listCanonicalAuthorIdentities(identityIndex)) {
    canonicalIds.add(identity.canonicalId);
  }

  if (!adminDb) return canonicalIds;

  const monthPrefix = `${monthYear}-`;

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
    if (!isFounderAuthorIdentity(resolved)) continue;
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of chapterSalesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (!id) continue;
    const resolved = resolveAuthorFromIndex(id, identityIndex);
    if (!isFounderAuthorIdentity(resolved)) continue;
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of bookSalesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (!id) continue;
    const resolved = resolveAuthorFromIndex(id, identityIndex);
    if (!isFounderAuthorIdentity(resolved)) continue;
    canonicalIds.add(resolved.canonicalId);
  }

  return canonicalIds;
}

async function getAuthorProfileFromIdentity(identity: ResolvedAuthorIdentity) {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return {
      displayName: identity.displayName,
      email: identity.email,
      photoURL: identity.photoURL,
    };
  }

  const snap = await adminDb.collection("users").doc(identity.canonicalId).get();
  if (snap.exists) {
    const data = snap.data()!;
    return {
      displayName: String(data.displayName ?? identity.displayName),
      email: String(data.email ?? identity.email),
      photoURL: (data.photoURL as string | undefined) ?? identity.photoURL,
    };
  }

  return {
    displayName: identity.displayName,
    email: identity.email,
    photoURL: identity.photoURL,
  };
}

async function countActiveBooksForIdentity(identity: ResolvedAuthorIdentity): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    const founder = founderAuthors.find((f) => identity.aliasIds.includes(f.legacyAuthorId));
    return founder?.bookIds.length ?? 0;
  }

  const bookIds = new Set<string>();
  for (const authorId of identity.aliasIds) {
    const snap = await adminDb.collection("books").where("authorId", "==", authorId).get();
    for (const doc of snap.docs) bookIds.add(doc.id);
  }
  return bookIds.size;
}

async function getCombinedDirectSales(
  identity: ResolvedAuthorIdentity,
  monthYear: string,
): Promise<number> {
  let total = 0;
  for (const authorId of identity.aliasIds) {
    total += await getAuthorDirectSalesTotal(authorId, monthYear);
  }
  return total;
}

async function getCombinedEarningsSummaryRaw(
  identity: ResolvedAuthorIdentity,
  monthYear: string,
) {
  for (const authorId of identity.aliasIds) {
    const summary = await getEarningsSummaryRaw(authorId, monthYear);
    if (summary) return summary;
  }
  return null;
}

async function getEarningsSummaryRaw(authorId: string, monthYear: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (!snap.exists) return null;
  return snap.data()!;
}

export async function listAvailableMonthYears(limit = 12): Promise<string[]> {
  const adminDb = await getAdminDb();
  const months = new Set<string>();

  months.add(getCurrentMonthYear());

  if (adminDb) {
    const snap = await adminDb.collection(COLLECTIONS.monthlyPools).get();
    for (const doc of snap.docs) {
      months.add(doc.id);
    }
  }

  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export async function getGlobalFinancialReport(
  monthYear = getCurrentMonthYear(),
): Promise<GlobalFinancialReport> {
  const pool = (await getMonthlyPool(monthYear)) ?? (await getOrCreateOpenPool(monthYear));
  const directTotals = await getDirectSalesTotalsForMonth(monthYear);
  const donationTotals = await getDonationTotalsForMonth(monthYear);
  const identityIndex = await buildAuthorIdentityIndex();
  const authorIds = await collectAuthorIdsForMonth(monthYear, identityIndex);
  const identityByCanonical = new Map<string, ResolvedAuthorIdentity>();
  for (const authorId of authorIds) {
    const identity = resolveAuthorFromIndex(authorId, identityIndex);
    if (!isFounderAuthorIdentity(identity)) continue;
    identityByCanonical.set(authorId, identity);
  }

  const subscriptionGross = pool.subscriptionGross;
  const subscriptionGatewayFees = pool.subscriptionGatewayFees;
  const subscriptionNet = pool.subscriptionNet;
  const subscriptionAuthorsPool70 = pool.authorsPool70;
  const subscriptionPlatformPool30 = pool.platformPool30;

  const grossRevenue = subscriptionGross + directTotals.gross + donationTotals.gross;
  const gatewayFees = subscriptionGatewayFees + directTotals.gatewayFees + donationTotals.gatewayFees;
  const netRevenue = subscriptionNet + directTotals.net + donationTotals.net;
  const platformNet30 = subscriptionPlatformPool30 + directTotals.platformShare + donationTotals.platformShare;
  const authorsPool70 = subscriptionAuthorsPool70 + directTotals.authorShare + donationTotals.authorShare;

  const totalPlatformReadingSeconds = pool.totalPlatformReadingSeconds;
  const valuePerSecond = pool.valuePerSecond;
  const totalPlatformStatisticalViews = pool.totalPlatformPremiumViews;
  const valuePerView = pool.valuePerView;

  const authorReadingShares = await Promise.all(
    Array.from(identityByCanonical.entries()).map(async ([authorId, identity]) => ({
      authorId,
      readingSeconds: await getCombinedAuthorReadingSeconds(identity.aliasIds, monthYear),
    })),
  );

  const poolDistribution =
    pool.status === "closed"
      ? null
      : distributePoolByReadingSeconds(subscriptionAuthorsPool70, authorReadingShares);

  const authorsBreakdown: AuthorFinancialBreakdown[] = await Promise.all(
    Array.from(identityByCanonical.entries()).map(async ([authorId, identity]) => {
      const [profile, statisticalViews, readingSeconds, directSalesEarnings, activeBooksCount, summaryRaw] =
        await Promise.all([
          getAuthorProfileFromIdentity(identity),
          getCombinedAuthorStatisticalViews(identity.aliasIds, monthYear),
          getCombinedAuthorReadingSeconds(identity.aliasIds, monthYear),
          getCombinedDirectSales(identity, monthYear),
          countActiveBooksForIdentity(identity),
          getCombinedEarningsSummaryRaw(identity, monthYear),
        ]);

      const readingSharePercent =
        totalPlatformReadingSeconds > 0
          ? Math.round((readingSeconds / totalPlatformReadingSeconds) * 10000) / 100
          : 0;

      const poolEarnings =
        pool.status === "closed" && summaryRaw
          ? Number(summaryRaw.estimatedSubscriptionEarnings ?? 0)
          : poolDistribution?.byAuthor.get(authorId) ??
            computeEstimatedPoolEarningsBySeconds(
              readingSeconds,
              subscriptionAuthorsPool70,
              totalPlatformReadingSeconds,
              pool.status === "closed" ? valuePerSecond : undefined,
            ).earnings;

      const totalAuthorEarnings = poolEarnings + directSalesEarnings;

      return {
        authorId,
        authorName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        activeBooksCount,
        premiumViews: statisticalViews,
        viewSharePercent: readingSharePercent,
        readingTimeSeconds: readingSeconds,
        poolEarnings,
        directSalesEarnings,
        totalAuthorEarnings,
        payoutStatus: resolvePayoutStatus(summaryRaw, pool, totalAuthorEarnings),
      };
    }),
  );

  authorsBreakdown.sort((a, b) => b.totalAuthorEarnings - a.totalAuthorEarnings);

  const booksBreakdown: BookFinancialBreakdown[] = [];
  const bookMeta = new Map<string, { title: string; authorId: string; authorName: string }>();

  const adminDb = await getAdminDb();
  if (adminDb) {
    for (const [authorId, identity] of identityByCanonical) {
      const profile = await getAuthorProfileFromIdentity(identity);
      for (const aliasId of identity.aliasIds) {
        const snap = await adminDb.collection("books").where("authorId", "==", aliasId).get();
        for (const doc of snap.docs) {
          bookMeta.set(doc.id, {
            title: String(doc.data().title ?? "Sin título"),
            authorId,
            authorName: profile.displayName,
          });
        }
      }
    }
  }

  for (const [, identity] of identityByCanonical) {
    const bookStats = await getBookReadingStatsForAuthor(identity.aliasIds, monthYear);
    for (const [bookId, stats] of bookStats) {
      const meta = bookMeta.get(bookId);
      if (!meta) continue;
      const viewSharePercent =
        totalPlatformReadingSeconds > 0
          ? Math.round((stats.accumulatedReadingSeconds / totalPlatformReadingSeconds) * 10000) / 100
          : 0;
      const { earnings: poolEarnings } = computeEstimatedPoolEarningsBySeconds(
        stats.accumulatedReadingSeconds,
        subscriptionAuthorsPool70,
        totalPlatformReadingSeconds,
        pool.status === "closed" ? valuePerSecond : undefined,
      );

      booksBreakdown.push({
        bookId,
        title: meta.title,
        authorId: meta.authorId,
        authorName: meta.authorName,
        premiumViews: stats.totalViews,
        viewSharePercent,
        poolEarnings,
      });
    }
  }

  booksBreakdown.sort((a, b) => b.poolEarnings - a.poolEarnings);

  const availableMonths = await listAvailableMonthYears();

  const donationsAudit = donationTotals.items.map((row) => {
    const identity = resolveAuthorFromIndex(row.authorId, identityIndex);
    return {
      id: row.id,
      donorUserId: row.userId,
      donorDisplayName: row.donorDisplayName,
      authorId: row.authorId,
      authorName: identity.displayName,
      amountPaid: row.amountPaid,
      platformShare: row.platformShare,
      authorShare: row.authorShare,
      createdAt: row.createdAt,
    };
  });

  return {
    monthYear,
    grossRevenue,
    gatewayFees,
    netRevenue,
    platformNet30,
    authorsPool70,
    totalPlatformPremiumViews: totalPlatformStatisticalViews,
    valuePerView,
    valuePerSecond,
    totalPlatformReadingTime: totalPlatformReadingSeconds,
    subscriptionGross,
    subscriptionGatewayFees,
    subscriptionNet,
    subscriptionAuthorsPool70,
    subscriptionPlatformPool30,
    directSalesGross: directTotals.gross,
    directSalesGatewayFees: directTotals.gatewayFees,
    directSalesNet: directTotals.net,
    donationsGross: donationTotals.gross,
    donationsGatewayFees: donationTotals.gatewayFees,
    donationsNet: donationTotals.net,
    donationsPlatformShare: donationTotals.platformShare,
    donationsAuthorShare: donationTotals.authorShare,
    donationsAudit,
    poolStatus: pool.status,
    consolidationId: pool.consolidationId,
    consolidatedAt: pool.consolidatedAt,
    totalPoolDistributed: pool.totalPoolDistributed,
    roundingAdjustmentCents: pool.roundingAdjustmentCents,
    availableMonths,
    authorsBreakdown,
    booksBreakdown,
  };
}

export async function markAuthorPayoutPaid(
  authorId: string,
  monthYear: string,
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const now = new Date().toISOString();
  const ref = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear));

  await ref.set(
    {
      authorId,
      monthYear,
      payoutStatus: "paid",
      paidAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}
