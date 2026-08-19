import type { ChapterComment } from "@/types/social";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

export async function listChapterComments(chapterId: string): Promise<ChapterComment[]> {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const snap = await adminDb
    .collection(COLLECTIONS.chapterComments)
    .where("chapterId", "==", chapterId)
    .limit(100)
    .get();

  return snap.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ChapterComment, "id">),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getBookCommentCount(bookId: string): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const snap = await adminDb
    .collection(COLLECTIONS.chapterComments)
    .where("bookId", "==", bookId)
    .get();

  return snap.size;
}

export async function createChapterComment(input: {
  chapterId: string;
  bookId: string;
  bookAuthorId: string;
  userId: string;
  userDisplayName: string;
  text: string;
  parentId?: string;
}): Promise<ChapterComment> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const text = input.text.trim();
  if (text.length < 2 || text.length > 1200) {
    throw new Error("El comentario debe tener entre 2 y 1200 caracteres.");
  }

  const now = new Date().toISOString();
  const ref = adminDb.collection(COLLECTIONS.chapterComments).doc();

  const comment: ChapterComment = {
    id: ref.id,
    chapterId: input.chapterId,
    bookId: input.bookId,
    bookAuthorId: input.bookAuthorId,
    userId: input.userId,
    userDisplayName: input.userDisplayName,
    text,
    parentId: input.parentId,
    createdAt: now,
  };

  await ref.set(comment);
  return comment;
}

export async function deleteChapterComment(commentId: string, userId: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.chapterComments).doc(commentId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Comentario no encontrado.");
  }

  if (snap.data()?.userId !== userId) {
    throw new Error("Solo puedes eliminar tus propios comentarios.");
  }

  await ref.delete();
}

export async function getRecentCommentsForAuthor(authorId: string, limit = 30) {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const snap = await adminDb
    .collection(COLLECTIONS.chapterComments)
    .where("bookAuthorId", "==", authorId)
    .limit(100)
    .get();

  return snap.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ChapterComment, "id">),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
