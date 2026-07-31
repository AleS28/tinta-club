import type { AuthorFollower } from "@/types/social";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";
import { buildAuthorIdentityIndex, resolveAuthorFromIndex } from "@/lib/author-identity-admin";

function followerDocId(authorId: string, followerId: string): string {
  return `${authorId}_${followerId}`;
}

export async function resolveAuthorAliasIds(authorId: string): Promise<string[]> {
  const index = await buildAuthorIdentityIndex();
  const identity = resolveAuthorFromIndex(authorId, index);
  return identity.aliasIds.length > 0 ? identity.aliasIds : [authorId];
}

export async function toggleAuthorFollow(input: {
  authorId: string;
  followerId: string;
  followerDisplayName: string;
  isFollowing: boolean;
}): Promise<{ followerCount: number; isFollowing: boolean }> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  if (input.authorId === input.followerId) {
    throw new Error("No puedes seguirte a ti mismo.");
  }

  const aliasIds = await resolveAuthorAliasIds(input.authorId);
  const canonicalAuthorId = aliasIds[0] ?? input.authorId;
  const now = new Date().toISOString();

  const followingRef = adminDb
    .collection("users")
    .doc(input.followerId)
    .collection("following")
    .doc(canonicalAuthorId);

  const followerRef = adminDb
    .collection(COLLECTIONS.authorFollowers)
    .doc(followerDocId(canonicalAuthorId, input.followerId));

  await adminDb.runTransaction(async (tx) => {
    if (input.isFollowing) {
      tx.delete(followingRef);
      tx.delete(followerRef);
      return;
    }

    tx.set(followingRef, { authorId: canonicalAuthorId, followedAt: now });
    tx.set(followerRef, {
      authorId: canonicalAuthorId,
      followerId: input.followerId,
      followerDisplayName: input.followerDisplayName,
      createdAt: now,
    });
  });

  const followerCount = await getAuthorFollowerCount(canonicalAuthorId);
  return { followerCount, isFollowing: !input.isFollowing };
}

export async function getAuthorFollowerCount(authorId: string): Promise<number> {
  const adminDb = await getAdminDb();
  if (!adminDb) return 0;

  const aliasIds = await resolveAuthorAliasIds(authorId);
  let total = 0;

  for (const aliasId of aliasIds) {
    const snap = await adminDb
      .collection(COLLECTIONS.authorFollowers)
      .where("authorId", "==", aliasId)
      .get();
    total += snap.size;
  }

  return total;
}

export async function listAuthorFollowers(authorId: string, limit = 50): Promise<AuthorFollower[]> {
  const adminDb = await getAdminDb();
  if (!adminDb) return [];

  const aliasIds = await resolveAuthorAliasIds(authorId);
  const followers = new Map<string, AuthorFollower>();

  for (const aliasId of aliasIds) {
    const snap = await adminDb
      .collection(COLLECTIONS.authorFollowers)
      .where("authorId", "==", aliasId)
      .limit(limit)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      followers.set(String(data.followerId), {
        followerId: String(data.followerId),
        followerDisplayName: String(data.followerDisplayName ?? "Lector"),
        createdAt: String(data.createdAt ?? ""),
      });
    }
  }

  return Array.from(followers.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function isFollowingAuthor(
  followerId: string,
  authorId: string,
): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const aliasIds = await resolveAuthorAliasIds(authorId);
  for (const aliasId of aliasIds) {
    const snap = await adminDb
      .collection(COLLECTIONS.authorFollowers)
      .doc(followerDocId(aliasId, followerId))
      .get();
    if (snap.exists) return true;
  }

  return false;
}
