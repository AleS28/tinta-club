import type { GlobalFinancialReport, AuthorFinancialBreakdown } from "@/types/admin-financial";
import type { MonthlyPool, PayoutStatus } from "@/types/monetization";
import { COLLECTIONS, MIN_PAYOUT_USD } from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import {
  getMonthlyPool,
  getOrCreateOpenPool,
} from "@/lib/monetization/monthly-pool-admin";
import { getAuthorDirectSalesTotal } from "@/lib/monetization/direct-sales-admin";
import {
  getAuthorReadingSeconds,
} from "@/lib/monetization/reading-tracking-admin";
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

function computePoolEarnings(authorSeconds: number, pool: MonthlyPool): number {
  if (authorSeconds <= 0 || pool.authorsPool70 <= 0) return 0;
  const totalSeconds = pool.totalPlatformReadingSeconds;
  if (totalSeconds <= 0) return 0;
  const vps = pool.valuePerSecond > 0 ? pool.valuePerSecond : pool.authorsPool70 / totalSeconds;
  return authorSeconds * vps;
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
  const snap = await adminDb.collection(COLLECTIONS.directChapterSales).get();

  let gross = 0;
  let gatewayFees = 0;
  let net = 0;
  let platformShare = 0;
  let authorShare = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
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

  const [sessionsSnap, salesSnap, summariesSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.readingSessions).get(),
    adminDb.collection(COLLECTIONS.directChapterSales).get(),
    adminDb.collection(COLLECTIONS.authorEarningsSummary).get(),
  ]);

  for (const doc of sessionsSnap.docs) {
    const data = doc.data();
    if (!String(data.readAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (!id) continue;
    const resolved = resolveAuthorFromIndex(id, identityIndex);
    if (!isFounderAuthorIdentity(resolved)) continue;
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of salesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (!id) continue;
    const resolved = resolveAuthorFromIndex(id, identityIndex);
    if (!isFounderAuthorIdentity(resolved)) continue;
    canonicalIds.add(resolved.canonicalId);
  }

  for (const doc of summariesSnap.docs) {
    if (doc.id.endsWith(`_${monthYear}`)) {
      const rawId = doc.id.replace(`_${monthYear}`, "");
      const resolved = resolveAuthorFromIndex(rawId, identityIndex);
      if (!isFounderAuthorIdentity(resolved)) continue;
      canonicalIds.add(resolved.canonicalId);
    }
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

async function getCombinedReadingSeconds(
  identity: ResolvedAuthorIdentity,
  monthYear: string,
): Promise<number> {
  let total = 0;
  for (const authorId of identity.aliasIds) {
    total += await getAuthorReadingSeconds(authorId, monthYear);
  }
  return total;
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

  const grossRevenue = subscriptionGross + directTotals.gross;
  const gatewayFees = subscriptionGatewayFees + directTotals.gatewayFees;
  const netRevenue = subscriptionNet + directTotals.net;
  const platformNet30 = pool.platformPool30 + directTotals.platformShare;
  const authorsPool70 = pool.authorsPool70 + directTotals.authorShare;

  const authorsBreakdown: AuthorFinancialBreakdown[] = await Promise.all(
    Array.from(identityByCanonical.entries()).map(async ([authorId, identity]) => {
      const [profile, readingSeconds, directSalesEarnings, activeBooksCount, summaryRaw] =
        await Promise.all([
          getAuthorProfileFromIdentity(identity),
          getCombinedReadingSeconds(identity, monthYear),
          getCombinedDirectSales(identity, monthYear),
          countActiveBooksForIdentity(identity),
          getCombinedEarningsSummaryRaw(identity, monthYear),
        ]);

      const poolEarnings = computePoolEarnings(readingSeconds, pool);
      const totalAuthorEarnings = poolEarnings + directSalesEarnings;

      return {
        authorId,
        authorName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        activeBooksCount,
        readingTimeSeconds: readingSeconds,
        poolEarnings,
        directSalesEarnings,
        totalAuthorEarnings,
        payoutStatus: resolvePayoutStatus(summaryRaw, pool, totalAuthorEarnings),
      };
    }),
  );

  authorsBreakdown.sort((a, b) => b.totalAuthorEarnings - a.totalAuthorEarnings);

  const availableMonths = await listAvailableMonthYears();

  return {
    monthYear,
    grossRevenue,
    gatewayFees,
    netRevenue,
    platformNet30,
    authorsPool70,
    totalPlatformReadingTime: pool.totalPlatformReadingSeconds,
    subscriptionGross,
    subscriptionGatewayFees,
    subscriptionNet,
    directSalesGross: directTotals.gross,
    directSalesGatewayFees: directTotals.gatewayFees,
    directSalesNet: directTotals.net,
    poolStatus: pool.status,
    availableMonths,
    authorsBreakdown,
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
