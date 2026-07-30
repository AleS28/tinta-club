import { FieldValue } from "firebase-admin/firestore";
import type { ReadingSession } from "@/types/monetization";
import { COLLECTIONS } from "@/lib/monetization/constants";
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
}

function earningsSummaryDocId(authorId: string, monthYear: string): string {
  return `${authorId}_${monthYear}`;
}

async function incrementAuthorReadingSeconds(
  authorId: string,
  seconds: number,
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
      totalReadingSeconds: FieldValue.increment(seconds),
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function recordReadingSession(
  input: RecordReadingTimeInput,
): Promise<ReadingSession> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();
  const ref = adminDb.collection(COLLECTIONS.readingSessions).doc();

  const session: ReadingSession = {
    id: ref.id,
    userId: input.userId,
    bookId: input.bookId,
    chapterId: input.chapterId,
    authorId: input.authorId,
    readingTimeSeconds: input.readingTimeSeconds,
    isSubscriptionRead: input.isSubscriptionRead,
    readAt: now,
  };

  await ref.set(session);

  if (input.isSubscriptionRead) {
    await Promise.all([
      incrementPoolReadingSeconds(input.readingTimeSeconds, monthYear),
      incrementAuthorReadingSeconds(input.authorId, input.readingTimeSeconds, monthYear),
    ]);
  }

  return session;
}

export async function getAuthorReadingSeconds(
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
  return Number(snap.data()?.totalReadingSeconds ?? 0);
}

export async function getBookReadingStats(
  authorId: string,
  monthYear: string,
): Promise<Map<string, { readingSeconds: number; views: number }>> {
  const adminDb = await getAdminDb();
  const stats = new Map<string, { readingSeconds: number; views: number }>();
  if (!adminDb) return stats;

  const start = `${monthYear}-01T00:00:00.000Z`;
  const [year, month] = monthYear.split("-").map(Number);
  const endDate = new Date(Date.UTC(year!, month!, 0, 23, 59, 59, 999));
  const end = endDate.toISOString();

  const snap = await adminDb
    .collection(COLLECTIONS.readingSessions)
    .where("authorId", "==", authorId)
    .get();

  for (const doc of snap.docs) {
    const data = doc.data();
    const readAt = String(data.readAt ?? "");
    if (readAt < start || readAt > end) continue;
    const bookId = String(data.bookId ?? "");
    if (!bookId) continue;

    const current = stats.get(bookId) ?? { readingSeconds: 0, views: 0 };
    current.readingSeconds += Number(data.readingTimeSeconds ?? 0);
    current.views += 1;
    stats.set(bookId, current);
  }

  return stats;
}
