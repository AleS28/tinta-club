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

async function collectAuthorIdsForMonth(monthYear: string): Promise<Set<string>> {
  const adminDb = await getAdminDb();
  const authorIds = new Set<string>();
  if (!adminDb) return authorIds;

  const monthPrefix = `${monthYear}-`;

  const [sessionsSnap, salesSnap, summariesSnap, authorsSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.readingSessions).get(),
    adminDb.collection(COLLECTIONS.directChapterSales).get(),
    adminDb.collection(COLLECTIONS.authorEarningsSummary).get(),
    adminDb.collection("users").where("role", "in", ["author", "admin"]).get(),
  ]);

  for (const doc of sessionsSnap.docs) {
    const data = doc.data();
    if (!String(data.readAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (id) authorIds.add(id);
  }

  for (const doc of salesSnap.docs) {
    const data = doc.data();
    if (!String(data.createdAt ?? "").startsWith(monthPrefix)) continue;
    const id = String(data.authorId ?? "");
    if (id) authorIds.add(id);
  }

  for (const doc of summariesSnap.docs) {
    if (doc.id.endsWith(`_${monthYear}`)) {
      authorIds.add(doc.id.replace(`_${monthYear}`, ""));
    }
  }

  for (const doc of authorsSnap.docs) {
    authorIds.add(doc.id);
  }

  return authorIds;
}

async function getAuthorProfile(authorId: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("users").doc(authorId).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  return {
    displayName: String(data.displayName ?? "Autor"),
    email: String(data.email ?? ""),
    photoURL: data.photoURL as string | undefined,
  };
}

async function countActiveBooks(authorId: string): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb.collection("books").where("authorId", "==", authorId).get();
  return snap.size;
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
  const authorIds = await collectAuthorIdsForMonth(monthYear);

  const subscriptionGross = pool.subscriptionGross;
  const subscriptionGatewayFees = pool.subscriptionGatewayFees;
  const subscriptionNet = pool.subscriptionNet;

  const grossRevenue = subscriptionGross + directTotals.gross;
  const gatewayFees = subscriptionGatewayFees + directTotals.gatewayFees;
  const netRevenue = subscriptionNet + directTotals.net;
  const platformNet30 = pool.platformPool30 + directTotals.platformShare;
  const authorsPool70 = pool.authorsPool70 + directTotals.authorShare;

  const authorsBreakdown: AuthorFinancialBreakdown[] = await Promise.all(
    Array.from(authorIds).map(async (authorId) => {
      const [profile, readingSeconds, directSalesEarnings, activeBooksCount, summaryRaw] =
        await Promise.all([
          getAuthorProfile(authorId),
          getAuthorReadingSeconds(authorId, monthYear),
          getAuthorDirectSalesTotal(authorId, monthYear),
          countActiveBooks(authorId),
          getEarningsSummaryRaw(authorId, monthYear),
        ]);

      const poolEarnings = computePoolEarnings(readingSeconds, pool);
      const totalAuthorEarnings = poolEarnings + directSalesEarnings;

      return {
        authorId,
        authorName: profile?.displayName ?? "Autor",
        email: profile?.email ?? "",
        photoURL: profile?.photoURL,
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
