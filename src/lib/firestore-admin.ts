import type { UserProfile, UserRole, SubscriptionStatus } from "@/types/user";
import { normalizeUserProfile } from "@/types/user";
import type { Chapter } from "@/data/mock";
import { getChapterById as getMockChapterById } from "@/data/mock";
import { getAdminDb } from "@/lib/firebase-admin";

function isTruthy(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function resolveChapterContent(
  data: Record<string, unknown> | undefined,
  mock?: Chapter,
): string[] {
  const raw = data?.content;
  const mockContent = mock?.content ?? [];

  if (Array.isArray(raw) && raw.length > 0) {
    const fromFirestore = raw.map((paragraph) => String(paragraph)).filter(Boolean);
    if (mockContent.length > fromFirestore.length) {
      return mockContent;
    }
    return fromFirestore;
  }

  return mockContent;
}

export async function getChapterForApi(chapterId: string): Promise<Chapter | undefined> {
  const mockChapter = getMockChapterById(chapterId);

  try {
    const adminDb = await getAdminDb();
    if (!adminDb) {
      return mockChapter;
    }

    const snap = await adminDb.collection("chapters").doc(chapterId).get();
    if (!snap.exists) {
      return mockChapter;
    }

    const data = snap.data() as Record<string, unknown>;
    const content = resolveChapterContent(data, mockChapter);

    return {
      id: chapterId,
      bookId: String(data.bookId ?? mockChapter?.bookId ?? ""),
      number: Number(data.number ?? mockChapter?.number ?? 0),
      title: String(data.title ?? mockChapter?.title ?? "Capítulo"),
      isPremium: isTruthy(data.isPremium) || mockChapter?.isPremium === true,
      content,
    };
  } catch (error) {
    console.error("[firestore-admin] chapter read:", error);
    return mockChapter;
  }
}

export async function getUserProfileFromFirestore(
  uid: string,
  email?: string,
): Promise<UserProfile | null> {
  try {
    const adminDb = await getAdminDb();
    if (!adminDb) return null;

    const snap = await adminDb.collection("users").doc(uid).get();
    if (!snap.exists) return null;

    const raw = snap.data() as Record<string, unknown>;

    return normalizeUserProfile({
      uid,
      email: String(raw.email ?? email ?? ""),
      displayName: String(raw.displayName ?? "Lector"),
      role: (raw.role as UserRole) ?? "reader",
      isSubscriber: isTruthy(raw.isSubscriber),
      isPremium: isTruthy(raw.isPremium),
      subscriptionStatus: raw.subscriptionStatus as SubscriptionStatus | undefined,
      photoURL: raw.photoURL as string | undefined,
      bio: raw.bio as string | undefined,
      authorSlug: raw.authorSlug as string | undefined,
      legacyAuthorId: raw.legacyAuthorId as string | undefined,
    });
  } catch (error) {
    console.error("[firestore-admin] user read:", error);
    return null;
  }
}

export function sanitizeChapterContent(content: unknown): string[] {
  if (!Array.isArray(content)) return [];
  return content.map((paragraph) => String(paragraph ?? "")).filter(Boolean);
}
