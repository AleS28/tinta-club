import type { AuthorInteractionsFeed } from "@/types/social";
import { getBookById } from "@/lib/db";
import { getRecentBookLikesForAuthor, getBookLikeCount } from "@/lib/social/book-likes-admin";
import { getRecentCommentsForAuthor } from "@/lib/social/comments-admin";
import {
  getAuthorFollowerCount,
  listAuthorFollowers,
  resolveAuthorAliasIds,
} from "@/lib/social/followers-admin";
import { getAdminDb } from "@/lib/firebase-admin";

async function getAuthorBookIds(authorIds: string[]): Promise<Array<{ id: string; title: string }>> {
  const adminDb = await getAdminDb();
  const books = new Map<string, { id: string; title: string }>();

  if (adminDb) {
    for (const authorId of authorIds) {
      const snap = await adminDb
        .collection("books")
        .where("authorId", "==", authorId)
        .get();
      for (const doc of snap.docs) {
        books.set(doc.id, { id: doc.id, title: String(doc.data().title ?? "Sin título") });
      }
    }
  }

  if (books.size === 0) {
    const { getBooksByAuthorId } = await import("@/lib/db");
    for (const authorId of authorIds) {
      const mockBooks = await getBooksByAuthorId(authorId);
      for (const book of mockBooks) {
        books.set(book.id, { id: book.id, title: book.title });
      }
    }
  }

  return Array.from(books.values());
}

export async function getAuthorInteractionsFeed(authorId: string): Promise<AuthorInteractionsFeed> {
  const aliasIds = await resolveAuthorAliasIds(authorId);
  const books = await getAuthorBookIds(aliasIds);
  const bookIds = books.map((b) => b.id);
  const bookTitleMap = new Map(books.map((b) => [b.id, b.title]));

  const [followerCount, followers, recentLikes, recentComments, likeCounts] = await Promise.all([
    getAuthorFollowerCount(authorId),
    listAuthorFollowers(authorId, 20),
    getRecentBookLikesForAuthor(authorId, bookIds, 15),
    getRecentCommentsForAuthor(authorId, 20),
    Promise.all(
      books.map(async (book) => ({
        bookId: book.id,
        title: book.title,
        count: await getBookLikeCount(book.id),
      })),
    ),
  ]);

  const userNameCache = new Map<string, string>();

  async function resolveUserName(userId: string): Promise<string> {
    if (userNameCache.has(userId)) return userNameCache.get(userId)!;

    const adminDb = await getAdminDb();
    let name = "Lector";
    if (adminDb) {
      const snap = await adminDb.collection("users").doc(userId).get();
      name = String(snap.data()?.displayName ?? snap.data()?.email ?? "Lector");
    }
    userNameCache.set(userId, name);
    return name;
  }

  const likeItems = await Promise.all(
    recentLikes.map(async (like) => ({
      type: "like" as const,
      bookId: String(like.bookId),
      bookTitle: bookTitleMap.get(String(like.bookId)) ?? "Obra",
      userId: String(like.userId),
      userDisplayName: await resolveUserName(String(like.userId)),
      createdAt: String(like.createdAt ?? ""),
    })),
  );

  const commentItems = await Promise.all(
    recentComments.map(async (comment) => {
      const chapter = await (async () => {
        const adminDb = await getAdminDb();
        if (!adminDb) return null;
        const snap = await adminDb.collection("chapters").doc(comment.chapterId).get();
        return snap.exists ? snap.data() : null;
      })();

      return {
        type: "comment" as const,
        commentId: comment.id,
        chapterId: comment.chapterId,
        bookId: comment.bookId,
        bookTitle: bookTitleMap.get(comment.bookId) ?? (await getBookById(comment.bookId))?.title ?? "Obra",
        chapterTitle: String(chapter?.title ?? `Capítulo`),
        userId: comment.userId,
        userDisplayName: comment.userDisplayName,
        text: comment.text,
        createdAt: comment.createdAt,
      };
    }),
  );

  const items = [...likeItems, ...commentItems]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);

  return {
    followerCount,
    followers,
    items,
    bookLikeCounts: likeCounts.sort((a, b) => b.count - a.count),
  };
}
