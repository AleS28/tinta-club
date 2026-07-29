import type { UserProfile, UserRole } from "@/types/user";
import { normalizeUserProfile } from "@/types/user";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export interface LinkSiteAdminResult {
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
    displayName: String(raw.displayName ?? "Administrador"),
    role: (raw.role as UserRole) ?? "reader",
    isSubscriber: isTruthy(raw.isSubscriber),
    isPremium: isTruthy(raw.isPremium),
    subscriptionStatus: raw.subscriptionStatus as UserProfile["subscriptionStatus"],
    photoURL: raw.photoURL as string | undefined,
    bio: raw.bio as string | undefined,
    authorSlug: raw.authorSlug as string | undefined,
    legacyAuthorId: raw.legacyAuthorId as string | undefined,
  });
}

export async function linkSiteAdminAdmin(uid: string, email: string): Promise<LinkSiteAdminResult> {
  const adminDb = await getAdminDb();
  if (!adminDb) {
    return { linked: false, reason: "admin_not_configured" };
  }

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existing = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;

  if (existing?.role === "admin" && isTruthy(existing.isPremium)) {
    return {
      linked: false,
      profile: toUserProfile(uid, existing, email),
      reason: "already_linked",
    };
  }

  await userRef.set(
    {
      uid,
      email,
      displayName: existing?.displayName ?? "Administrador",
      role: "admin",
      isPremium: true,
      isSubscriber: true,
      subscriptionStatus: "premium",
      adminLinkedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    await adminAuth.setCustomUserClaims(uid, {
      premium: true,
      subscriptionStatus: "premium",
      role: "admin",
    });
  }

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
