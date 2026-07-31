import {
  hasChapterPurchaseAccess,
  getUserChapterPurchases,
} from "@/lib/monetization/chapter-access-admin";
import {
  hasBookPurchaseAccess,
  getUserBookPurchases,
} from "@/lib/monetization/book-access-admin";

export type DirectReadingAccessType = "chapter" | "book" | null;

export async function resolveDirectReadingAccess(
  userId: string,
  bookId: string,
  chapterId: string,
): Promise<{ granted: boolean; access: DirectReadingAccessType }> {
  if (await hasChapterPurchaseAccess(userId, chapterId)) {
    return { granted: true, access: "chapter" };
  }

  if (await hasBookPurchaseAccess(userId, bookId)) {
    return { granted: true, access: "book" };
  }

  return { granted: false, access: null };
}

export async function getUserDirectPurchases(userId: string) {
  const [books, chapters] = await Promise.all([
    getUserBookPurchases(userId),
    getUserChapterPurchases(userId),
  ]);

  return { books, chapters };
}
