import type { DirectChapterSale } from "@/types/monetization";
import {
  COLLECTIONS,
  DIRECT_SALE_AUTHOR_SHARE,
  DIRECT_SALE_PLATFORM_SHARE,
} from "@/lib/monetization/constants";
import { getCurrentMonthYear } from "@/lib/monetization/month-year";
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

export async function recordDirectChapterSale(
  input: RecordDirectSaleInput,
): Promise<DirectChapterSale> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const amountPaid = Math.max(0, input.amountPaid);
  const authorShare = amountPaid * DIRECT_SALE_AUTHOR_SHARE;
  const platformShare = amountPaid * DIRECT_SALE_PLATFORM_SHARE;
  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();

  const ref = adminDb.collection(COLLECTIONS.directChapterSales).doc();
  const sale: DirectChapterSale = {
    id: ref.id,
    userId: input.userId,
    bookId: input.bookId,
    chapterId: input.chapterId,
    authorId: input.authorId,
    amountPaid,
    authorShare,
    platformShare,
    createdAt: now,
  };

  const summaryRef = adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(input.authorId, monthYear));

  await adminDb.runTransaction(async (tx) => {
    tx.set(ref, sale);

    const summarySnap = await tx.get(summaryRef);
    const prevDirect = summarySnap.exists
      ? Number(summarySnap.data()?.directSalesEarnings ?? 0)
      : 0;

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

  return sale;
}

export async function getAuthorDirectSalesTotal(
  authorId: string,
  monthYear: string,
): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(COLLECTIONS.authorEarningsSummary)
    .doc(earningsSummaryDocId(authorId, monthYear))
    .get();

  if (snap.exists) {
    return Number(snap.data()?.directSalesEarnings ?? 0);
  }

  const start = `${monthYear}-01T00:00:00.000Z`;
  const [year, month] = monthYear.split("-").map(Number);
  const endDate = new Date(Date.UTC(year!, month!, 0, 23, 59, 59, 999));

  const salesSnap = await adminDb
    .collection(COLLECTIONS.directChapterSales)
    .where("authorId", "==", authorId)
    .get();

  return salesSnap.docs.reduce((sum, doc) => {
    const createdAt = String(doc.data().createdAt ?? "");
    if (createdAt < start || createdAt > endDate.toISOString()) return sum;
    return sum + Number(doc.data().authorShare ?? 0);
  }, 0);
}
