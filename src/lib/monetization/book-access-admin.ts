import type { BookPurchase } from "@/types/monetization";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

function bookPurchaseDocId(userId: string, bookId: string): string {
  return `${userId}_${bookId}`;
}

export async function grantBookPurchaseAccess(input: {
  userId: string;
  bookId: string;
  authorId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
}): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const now = new Date().toISOString();
  const ref = adminDb
    .collection(COLLECTIONS.bookPurchases)
    .doc(bookPurchaseDocId(input.userId, input.bookId));

  await ref.set(
    {
      userId: input.userId,
      bookId: input.bookId,
      authorId: input.authorId,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      purchasedAt: now,
      active: true,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function revokeBookPurchaseAccess(userId: string, bookId: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  const ref = adminDb
    .collection(COLLECTIONS.bookPurchases)
    .doc(bookPurchaseDocId(userId, bookId));

  await ref.set(
    {
      active: false,
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function hasBookPurchaseAccess(userId: string, bookId: string): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const snap = await adminDb
    .collection(COLLECTIONS.bookPurchases)
    .doc(bookPurchaseDocId(userId, bookId))
    .get();

  if (!snap.exists) return false;
  return snap.data()?.active !== false;
}

export async function getUserBookPurchases(userId: string): Promise<BookPurchase[]> {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const snap = await adminDb
    .collection(COLLECTIONS.bookPurchases)
    .where("userId", "==", userId)
    .get();

  return snap.docs
    .map((doc) => doc.data() as BookPurchase)
    .filter((p) => p.active !== false)
    .sort((a, b) => String(b.purchasedAt).localeCompare(String(a.purchasedAt)));
}

export async function findBookPurchaseByPaymentIntent(
  paymentIntentId: string,
): Promise<{ userId: string; bookId: string } | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb
    .collection(COLLECTIONS.bookPurchases)
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const data = snap.docs[0]!.data();
  return {
    userId: String(data.userId ?? ""),
    bookId: String(data.bookId ?? ""),
  };
}
