import type { UserProfile, UserRole } from "@/types/user";
import { normalizeUserProfile } from "@/types/user";
import type { FounderAuthorConfig } from "@/data/founder-authors";
import { getAdminDb } from "@/lib/firebase-admin";

export interface LinkFounderResult {
  linked: boolean;
  profile?: UserProfile;
  reason?: string;
}

function isTruthy(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function toUserProfile(uid: string, raw: Record<string, unknown>, email?: string): UserProfile {
  return normalizeUserProfile({
    uid,
    email: String(raw.email ?? email ?? ""),
    displayName: String(raw.displayName ?? "Lector"),
    role: (raw.role as UserRole) ?? "reader",
    isSubscriber: isTruthy(raw.isSubscriber),
    isPremium: isTruthy(raw.isPremium),
    photoURL: raw.photoURL as string | undefined,
    bio: raw.bio as string | undefined,
    authorSlug: raw.authorSlug as string | undefined,
    legacyAuthorId: raw.legacyAuthorId as string | undefined,
  });
}

export async function linkFounderAuthorAdmin(
  uid: string,
  email: string,
  founder: FounderAuthorConfig,
): Promise<LinkFounderResult> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return { linked: false, reason: "admin_not_configured" };
  }

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existing = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;

  if (existing?.authorSlug === founder.slug && existing?.role === "author") {
    return {
      linked: false,
      profile: toUserProfile(uid, existing, email),
      reason: "already_linked",
    };
  }

  const batch = adminDb.batch();

  batch.set(
    userRef,
    {
      uid,
      email,
      displayName: existing?.displayName ?? founder.name,
      role: "author",
      bio: founder.bio,
      photoURL: founder.photoUrl,
      authorSlug: founder.slug,
      legacyAuthorId: founder.legacyAuthorId,
      linkedAt: new Date().toISOString(),
      // Preserva acuerdo firmado si el autor ya lo completó antes de vincular.
      ...(existing?.agreementSigned === true
        ? {
            agreementSigned: true,
            agreementSignedAt: existing.agreementSignedAt,
            agreementSignatureName: existing.agreementSignatureName,
            agreementVersion: existing.agreementVersion,
            agreementHash: existing.agreementHash,
            legalFullName: existing.legalFullName,
            legalIdNumber: existing.legalIdNumber,
            contactPhone: existing.contactPhone,
            paymentDetails: existing.paymentDetails,
          }
        : {}),
    },
    { merge: true },
  );

  for (const bookId of founder.bookIds) {
    batch.set(
      adminDb.collection("books").doc(bookId),
      {
        authorId: uid,
        author: founder.name,
      },
      { merge: true },
    );
  }

  batch.set(
    adminDb.collection("authors").doc(founder.legacyAuthorId),
    {
      id: founder.legacyAuthorId,
      name: founder.name,
      slug: founder.slug,
      linkedUid: uid,
      bookCount: founder.bookIds.length,
    },
    { merge: true },
  );

  await batch.commit();

  const updatedSnap = await userRef.get();
  const updated = updatedSnap.data() as Record<string, unknown>;

  return {
    linked: true,
    profile: toUserProfile(uid, updated, email),
  };
}

export async function getUserProfileAdmin(uid: string, email?: string): Promise<UserProfile | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;

  return toUserProfile(uid, snap.data() as Record<string, unknown>, email);
}
