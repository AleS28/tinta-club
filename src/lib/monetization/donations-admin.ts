import type { AuthorDonation } from "@/types/monetization";
import {
  COLLECTIONS,
  DIRECT_SALE_AUTHOR_SHARE,
  DIRECT_SALE_PLATFORM_SHARE,
} from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
import type { RevenueAmounts } from "@/lib/monetization/gateway-net";
import { getAdminDb } from "@/lib/firebase-admin";

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

export interface RecordAuthorDonationInput {
  userId: string;
  donorDisplayName: string;
  authorId: string;
  amounts: RevenueAmounts;
  checkoutId: string;
  paymentId?: string;
  monthYear?: string;
}

export async function recordAuthorDonation(
  input: RecordAuthorDonationInput,
): Promise<AuthorDonation> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const { grossUsd, feeUsd, netUsd } = input.amounts;
  const authorShare = netUsd * DIRECT_SALE_AUTHOR_SHARE;
  const platformShare = netUsd * DIRECT_SALE_PLATFORM_SHARE;
  const monthYear = input.monthYear ?? getCurrentMonthYear();
  const now = new Date().toISOString();

  const ref = adminDb.collection(COLLECTIONS.authorDonations).doc(input.checkoutId);

  const donation: AuthorDonation = {
    id: ref.id,
    userId: input.userId,
    donorDisplayName: input.donorDisplayName,
    authorId: input.authorId,
    amountPaid: grossUsd,
    gatewayFee: feeUsd,
    amountNet: netUsd,
    authorShare,
    platformShare,
    checkoutId: input.checkoutId,
    paymentId: input.paymentId,
    createdAt: now,
  };

  const summaryRef = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(input.authorId, monthYear));

  await adminDb.runTransaction(async (tx) => {
    const [existing, summarySnap] = await Promise.all([tx.get(ref), tx.get(summaryRef)]);
    if (existing.exists) return;

    const prevDonations = Number(summarySnap.data()?.donationsEarnings ?? 0);

    tx.set(ref, donation);
    tx.set(
      summaryRef,
      {
        authorId: input.authorId,
        monthYear,
        donationsEarnings: prevDonations + authorShare,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  const saved = await ref.get();
  if (!saved.exists) {
    throw new Error("No se pudo registrar la donación");
  }

  return saved.data() as AuthorDonation;
}

export async function getAuthorDonationsForMonth(authorId: string, monthYear: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const monthPrefix = `${monthYear}-`;
  const snap = await adminDb.collection(COLLECTIONS.authorDonations).get();

  return snap.docs
    .map((doc) => doc.data() as AuthorDonation)
    .filter((row) => row.authorId === authorId && row.createdAt.startsWith(monthPrefix))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDonationTotalsForMonth(monthYear: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return {
      gross: 0,
      gatewayFees: 0,
      net: 0,
      platformShare: 0,
      authorShare: 0,
      items: [] as AuthorDonation[],
    };
  }

  const monthPrefix = `${monthYear}-`;
  const snap = await adminDb.collection(COLLECTIONS.authorDonations).get();
  const items = snap.docs
    .map((doc) => doc.data() as AuthorDonation)
    .filter((row) => row.createdAt.startsWith(monthPrefix));

  let gross = 0;
  let gatewayFees = 0;
  let net = 0;
  let platformShare = 0;
  let authorShare = 0;

  for (const row of items) {
    gross += row.amountPaid;
    gatewayFees += row.gatewayFee;
    net += row.amountNet;
    platformShare += row.platformShare;
    authorShare += row.authorShare;
  }

  return { gross, gatewayFees, net, platformShare, authorShare, items };
}

export async function getAuthorDonationsAuthorShareTotal(
  authorId: string,
  monthYear: string,
): Promise<number> {
  const donations = await getAuthorDonationsForMonth(authorId, monthYear);
  return donations.reduce((sum, row) => sum + row.authorShare, 0);
}
