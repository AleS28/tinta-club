import type { DirectChapterSale, DirectBookSale } from "@/types/monetization";
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

export interface RecordDirectSaleInput {
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  amountPaid: number;
}

export interface RecordDirectChapterSaleInput {
  userId: string;
  bookId: string;
  chapterId: string;
  authorId: string;
  amounts: RevenueAmounts;
  checkoutId: string;
  paymentId?: string;
  monthYear?: string;
}

export interface RecordDirectBookSaleInput {
  userId: string;
  bookId: string;
  authorId: string;
  amounts: RevenueAmounts;
  checkoutId: string;
  paymentId?: string;
  monthYear?: string;
}

export async function recordDirectChapterSale(
  input: RecordDirectChapterSaleInput,
): Promise<DirectChapterSale> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const { grossUsd, feeUsd, netUsd } = input.amounts;
  const authorShare = netUsd * DIRECT_SALE_AUTHOR_SHARE;
  const platformShare = netUsd * DIRECT_SALE_PLATFORM_SHARE;
  const monthYear = input.monthYear ?? getCurrentMonthYear();
  const now = new Date().toISOString();

  const ref = adminDb.collection(COLLECTIONS.directChapterSales).doc(input.checkoutId);

  const sale: DirectChapterSale = {
    id: ref.id,
    userId: input.userId,
    bookId: input.bookId,
    chapterId: input.chapterId,
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

    const prevDirect = summarySnap.exists
      ? Number(summarySnap.data()?.directSalesEarnings ?? 0)
      : 0;

    tx.set(ref, sale);
    tx.set(
      summaryRef,
      {
        authorId: input.authorId,
        monthYear,
        directSalesEarnings: prevDirect + authorShare,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  const saved = await ref.get();
  if (!saved.exists) {
    throw new Error("No se pudo registrar la venta directa");
  }
  return saved.data() as DirectChapterSale;
}

export async function applyDirectSaleRefund(input: {
  checkoutId: string;
  refundAmounts: RevenueAmounts;
}): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const saleRef = adminDb.collection(COLLECTIONS.directChapterSales).doc(input.checkoutId);

  const saleSnap = await saleRef.get();
  if (!saleSnap.exists) return;

  const sale = saleSnap.data()!;
  if (sale.refundedAt) return;

  const netRefund = Math.abs(input.refundAmounts.netUsd);
  const authorRefund = netRefund * DIRECT_SALE_AUTHOR_SHARE;
  const monthYear = String(sale.createdAt ?? "").slice(0, 7) || getCurrentMonthYear();
  const now = new Date().toISOString();

  const summaryRef = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(String(sale.authorId), monthYear));

  await adminDb.runTransaction(async (tx) => {
    const [current, summarySnap] = await Promise.all([tx.get(saleRef), tx.get(summaryRef)]);
    if (!current.exists || current.data()?.refundedAt) return;

    const prevDirect = summarySnap.exists
      ? Number(summarySnap.data()?.directSalesEarnings ?? 0)
      : 0;

    tx.update(saleRef, {
      refundedAt: now,
      refundNet: netRefund,
      refundAuthorShare: authorRefund,
    });
    tx.set(
      summaryRef,
      {
        authorId: String(sale.authorId),
        monthYear,
        directSalesEarnings: Math.max(0, prevDirect - authorRefund),
        updatedAt: now,
      },
      { merge: true },
    );
  });
}

export async function recordDirectBookSale(
  input: RecordDirectBookSaleInput,
): Promise<DirectBookSale> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const { grossUsd, feeUsd, netUsd } = input.amounts;
  const authorShare = netUsd * DIRECT_SALE_AUTHOR_SHARE;
  const platformShare = netUsd * DIRECT_SALE_PLATFORM_SHARE;
  const monthYear = input.monthYear ?? getCurrentMonthYear();
  const now = new Date().toISOString();

  const ref = adminDb.collection(COLLECTIONS.directBookSales).doc(input.checkoutId);

  const sale: DirectBookSale = {
    id: ref.id,
    userId: input.userId,
    bookId: input.bookId,
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

    const prevDirect = summarySnap.exists
      ? Number(summarySnap.data()?.directSalesEarnings ?? 0)
      : 0;

    tx.set(ref, sale);
    tx.set(
      summaryRef,
      {
        authorId: input.authorId,
        monthYear,
        directSalesEarnings: prevDirect + authorShare,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  const saved = await ref.get();
  if (!saved.exists) {
    throw new Error("No se pudo registrar la venta directa del libro");
  }
  return saved.data() as DirectBookSale;
}

export async function applyDirectBookSaleRefund(input: {
  checkoutId: string;
  refundAmounts: RevenueAmounts;
}): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const saleRef = adminDb.collection(COLLECTIONS.directBookSales).doc(input.checkoutId);

  const saleSnap = await saleRef.get();
  if (!saleSnap.exists) return;

  const sale = saleSnap.data()!;
  if (sale.refundedAt) return;

  const netRefund = Math.abs(input.refundAmounts.netUsd);
  const authorRefund = netRefund * DIRECT_SALE_AUTHOR_SHARE;
  const monthYear = String(sale.createdAt ?? "").slice(0, 7) || getCurrentMonthYear();
  const now = new Date().toISOString();

  const summaryRef = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(String(sale.authorId), monthYear));

  await adminDb.runTransaction(async (tx) => {
    const [current, summarySnap] = await Promise.all([tx.get(saleRef), tx.get(summaryRef)]);
    if (!current.exists || current.data()?.refundedAt) return;

    const prevDirect = summarySnap.exists
      ? Number(summarySnap.data()?.directSalesEarnings ?? 0)
      : 0;

    tx.update(saleRef, {
      refundedAt: now,
      refundNet: netRefund,
      refundAuthorShare: authorRefund,
    });
    tx.set(
      summaryRef,
      {
        authorId: String(sale.authorId),
        monthYear,
        directSalesEarnings: Math.max(0, prevDirect - authorRefund),
        updatedAt: now,
      },
      { merge: true },
    );
  });
}

async function findSaleByPaymentField<T>(
  collection: string,
  paymentId: string,
): Promise<T | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  for (const field of ["paymentId", "stripePaymentIntentId"] as const) {
    const snap = await adminDb
      .collection(collection)
      .where(field, "==", paymentId)
      .limit(1)
      .get();
    if (!snap.empty) {
      const data = snap.docs[0]!.data() as T & { checkoutId?: string; stripeCheckoutSessionId?: string };
      if (!("checkoutId" in data) || !data.checkoutId) {
        return {
          ...data,
          checkoutId: data.stripeCheckoutSessionId ?? snap.docs[0]!.id,
        } as T;
      }
      return data;
    }
  }

  return null;
}

export async function findDirectBookSaleByPaymentId(
  paymentId: string,
): Promise<DirectBookSale | null> {
  return findSaleByPaymentField<DirectBookSale>(COLLECTIONS.directBookSales, paymentId);
}

export async function findDirectChapterSaleByPaymentId(
  paymentId: string,
): Promise<DirectChapterSale | null> {
  return findSaleByPaymentField<DirectChapterSale>(COLLECTIONS.directChapterSales, paymentId);
}

/** @deprecated Usar findDirectBookSaleByPaymentId */
export const findDirectBookSaleByPaymentIntent = findDirectBookSaleByPaymentId;

/** Registro legacy sin pasarela */
export async function recordLegacyDirectChapterSale(
  input: RecordDirectSaleInput,
): Promise<DirectChapterSale> {
  const amountPaid = Math.max(0, input.amountPaid);
  return recordDirectChapterSale({
    userId: input.userId,
    bookId: input.bookId,
    chapterId: input.chapterId,
    authorId: input.authorId,
    amounts: { grossUsd: amountPaid, feeUsd: 0, netUsd: amountPaid },
    checkoutId: `legacy_${input.userId}_${input.chapterId}_${Date.now()}`,
  });
}

function isInMonthYear(createdAt: string, monthYear: string): boolean {
  const start = `${monthYear}-01T00:00:00.000Z`;
  const [year, month] = monthYear.split("-").map(Number);
  const endDate = new Date(Date.UTC(year!, month!, 0, 23, 59, 59, 999));
  return createdAt >= start && createdAt <= endDate.toISOString();
}

export interface AuthorDirectSalesBreakdown {
  chapterSalesAuthorShare: number;
  bookSalesAuthorShare: number;
  totalAuthorShare: number;
  byBook: Array<{
    bookId: string;
    chapterSalesAuthorShare: number;
    bookSalesAuthorShare: number;
    totalAuthorShare: number;
  }>;
}

export async function getAuthorDirectSalesBreakdown(
  authorId: string,
  monthYear: string,
): Promise<AuthorDirectSalesBreakdown> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return {
      chapterSalesAuthorShare: 0,
      bookSalesAuthorShare: 0,
      totalAuthorShare: 0,
      byBook: [],
    };
  }

  const byBookMap = new Map<
    string,
    { chapterSalesAuthorShare: number; bookSalesAuthorShare: number }
  >();

  let chapterSalesAuthorShare = 0;
  let bookSalesAuthorShare = 0;

  const [chapterSnap, bookSnap] = await Promise.all([
    adminDb.collection(COLLECTIONS.directChapterSales).where("authorId", "==", authorId).get(),
    adminDb.collection(COLLECTIONS.directBookSales).where("authorId", "==", authorId).get(),
  ]);

  for (const doc of chapterSnap.docs) {
    const data = doc.data();
    if (data.refundedAt) continue;
    const createdAt = String(data.createdAt ?? "");
    if (!isInMonthYear(createdAt, monthYear)) continue;

    const share = Number(data.authorShare ?? 0);
    chapterSalesAuthorShare += share;

    const bookId = String(data.bookId ?? "");
    if (!bookId) continue;
    const entry = byBookMap.get(bookId) ?? {
      chapterSalesAuthorShare: 0,
      bookSalesAuthorShare: 0,
    };
    entry.chapterSalesAuthorShare += share;
    byBookMap.set(bookId, entry);
  }

  for (const doc of bookSnap.docs) {
    const data = doc.data();
    if (data.refundedAt) continue;
    const createdAt = String(data.createdAt ?? "");
    if (!isInMonthYear(createdAt, monthYear)) continue;

    const share = Number(data.authorShare ?? 0);
    bookSalesAuthorShare += share;

    const bookId = String(data.bookId ?? "");
    if (!bookId) continue;
    const entry = byBookMap.get(bookId) ?? {
      chapterSalesAuthorShare: 0,
      bookSalesAuthorShare: 0,
    };
    entry.bookSalesAuthorShare += share;
    byBookMap.set(bookId, entry);
  }

  const byBook = Array.from(byBookMap.entries())
    .map(([bookId, shares]) => ({
      bookId,
      chapterSalesAuthorShare: shares.chapterSalesAuthorShare,
      bookSalesAuthorShare: shares.bookSalesAuthorShare,
      totalAuthorShare: shares.chapterSalesAuthorShare + shares.bookSalesAuthorShare,
    }))
    .filter((row) => row.totalAuthorShare > 0)
    .sort((a, b) => b.totalAuthorShare - a.totalAuthorShare);

  return {
    chapterSalesAuthorShare,
    bookSalesAuthorShare,
    totalAuthorShare: chapterSalesAuthorShare + bookSalesAuthorShare,
    byBook,
  };
}

export async function getAuthorDirectSalesTotal(
  authorId: string,
  monthYear: string,
): Promise<number> {
  const breakdown = await getAuthorDirectSalesBreakdown(authorId, monthYear);
  if (breakdown.totalAuthorShare > 0) {
    return breakdown.totalAuthorShare;
  }

  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (snap.exists) {
    return Number(snap.data()?.directSalesEarnings ?? 0);
  }

  return 0;
}

export async function getDirectSaleByCheckoutSessionId(
  sessionId: string,
): Promise<DirectChapterSale | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection(COLLECTIONS.directChapterSales).doc(sessionId).get();
  if (!snap.exists) return null;
  return snap.data() as DirectChapterSale;
}
