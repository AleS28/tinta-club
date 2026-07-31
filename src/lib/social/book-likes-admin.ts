import type { BookLikeState } from "@/types/social";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

function likeDocId(bookId: string, userId: string): string {
  return `${bookId}_${userId}`;
}

export async function getBookLikeState(
  bookId: string,
  userId?: string,
): Promise<BookLikeState> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return { bookId, count: 0, likedByMe: false };
  }

  const statsSnap = await adminDb.collection(COLLECTIONS.bookLikeStats).doc(bookId).get();
  const count = Number(statsSnap.data()?.count ?? 0);

  if (!userId) {
    return { bookId, count, likedByMe: false };
  }

  const likeSnap = await adminDb
    .collection(COLLECTIONS.bookLikes)
    .doc(likeDocId(bookId, userId))
    .get();

  return { bookId, count, likedByMe: likeSnap.exists };
}

export async function toggleBookLike(
  bookId: string,
  userId: string,
): Promise<BookLikeState> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const likeRef = adminDb.collection(COLLECTIONS.bookLikes).doc(likeDocId(bookId, userId));
  const statsRef = adminDb.collection(COLLECTIONS.bookLikeStats).doc(bookId);
  const now = new Date().toISOString();

  let likedByMe = false;

  await adminDb.runTransaction(async (tx) => {
    const likeSnap = await tx.get(likeRef);
    const statsSnap = await tx.get(statsRef);
    const currentCount = Number(statsSnap.data()?.count ?? 0);

    if (likeSnap.exists) {
      tx.delete(likeRef);
      tx.set(
        statsRef,
        { bookId, count: Math.max(0, currentCount - 1), updatedAt: now },
        { merge: true },
      );
      likedByMe = false;
      return;
    }

    tx.set(likeRef, { bookId, userId, createdAt: now });
    tx.set(
      statsRef,
      { bookId, count: currentCount + 1, updatedAt: now },
      { merge: true },
    );
    likedByMe = true;
  });

  const statsSnap = await statsRef.get();
  return {
    bookId,
    count: Number(statsSnap.data()?.count ?? 0),
    likedByMe,
  };
}

export async function getBookLikeCount(bookId: string): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const statsSnap = await adminDb.collection(COLLECTIONS.bookLikeStats).doc(bookId).get();
  return Number(statsSnap.data()?.count ?? 0);
}

export async function getRecentBookLikesForAuthor(
  authorId: string,
  bookIds: string[],
  limit = 20,
) {
  const adminDb = await getAdminDb();
  if (!adminDb || bookIds.length === 0) return [];

  const bookIdSet = new Set(bookIds);
  const snap = await adminDb
    .collection(COLLECTIONS.bookLikes)
    .limit(200)
    .get();

  return snap.docs
    .map((doc) => doc.data())
    .filter((row) => bookIdSet.has(String(row.bookId)))
    .slice(0, limit);
}
