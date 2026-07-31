import type { ChapterPurchase } from "@/types/monetization";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

function chapterPurchaseDocId(userId: string, chapterId: string): string {
  return `${userId}_${chapterId}`;
}

export async function grantChapterPurchaseAccess(input: {
  userId: string;
  bookId: string;
  chapterId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
}): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const now = new Date().toISOString();
  const ref = adminDb
    .collection(COLLECTIONS.chapterPurchases)
    .doc(chapterPurchaseDocId(input.userId, input.chapterId));

  await ref.set(
    {
      userId: input.userId,
      bookId: input.bookId,
      chapterId: input.chapterId,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      purchasedAt: now,
      active: true,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function revokeChapterPurchaseAccess(
  userId: string,
  chapterId: string,
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  const ref = adminDb
    .collection(COLLECTIONS.chapterPurchases)
    .doc(chapterPurchaseDocId(userId, chapterId));

  await ref.set(
    {
      active: false,
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function hasChapterPurchaseAccess(
  userId: string,
  chapterId: string,
): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const snap = await adminDb
    .collection(COLLECTIONS.chapterPurchases)
    .doc(chapterPurchaseDocId(userId, chapterId))
    .get();

  if (!snap.exists) return false;
  return snap.data()?.active !== false;
}

export async function getUserChapterPurchases(userId: string): Promise<ChapterPurchase[]> {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const snap = await adminDb
    .collection(COLLECTIONS.chapterPurchases)
    .where("userId", "==", userId)
    .get();

  return snap.docs
    .map((doc) => doc.data() as ChapterPurchase)
    .filter((p) => p.active !== false)
    .sort((a, b) => String(b.purchasedAt).localeCompare(String(a.purchasedAt)));
}

export async function findChapterPurchaseByPaymentIntent(
  paymentIntentId: string,
): Promise<{ userId: string; chapterId: string; bookId: string } | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb
    .collection(COLLECTIONS.chapterPurchases)
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const data = snap.docs[0]!.data();
  return {
    userId: String(data.userId ?? ""),
    chapterId: String(data.chapterId ?? ""),
    bookId: String(data.bookId ?? ""),
  };
}
