import type { UserProfile, UserRole } from "@/types/user";
import { normalizeUserProfile } from "@/types/user";
import type { FounderAuthorConfig } from "@/data/founder-authors";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { AUTHOR_TERMS_VERSION } from "@/types/terms";
import { createHash } from "crypto";

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

function formatUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

function agreementFieldsFromUser(
  existing: Record<string, unknown>,
): Record<string, unknown> | null {
  if (existing.agreementSigned !== true) return null;

  return {
    agreementSigned: true,
    agreementSignedAt: existing.agreementSignedAt,
    agreementSignatureName: existing.agreementSignatureName,
    agreementVersion: existing.agreementVersion ?? AUTHOR_TERMS_VERSION,
    agreementHash: existing.agreementHash,
    legalFullName: existing.legalFullName,
    legalIdNumber: existing.legalIdNumber,
    contactPhone: existing.contactPhone,
    paymentDetails: existing.paymentDetails,
  };
}

async function agreementFieldsFromLegalAudit(
  uid: string,
): Promise<Record<string, unknown> | null> {
  const adminDb = await getAdminDb();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (!adminDb || !appId) return null;

  const snap = await adminDb
    .collection("artifacts")
    .doc(appId)
    .collection("users")
    .doc(uid)
    .collection("legal_agreements")
    .where("userType", "==", "author")
    .limit(10)
    .get();

  if (snap.empty) return null;

  const docs = snap.docs
    .map((doc) => doc.data())
    .sort((a, b) =>
      String(b.acceptedAt ?? "").localeCompare(String(a.acceptedAt ?? "")),
    );
  const latest = docs[0];
  if (!latest) return null;

  return {
    agreementSigned: true,
    agreementSignedAt: String(latest.acceptedAt ?? formatUtcTimestamp()),
    agreementSignatureName: String(latest.signatureName ?? latest.legalName ?? ""),
    agreementVersion: String(latest.termsVersion ?? AUTHOR_TERMS_VERSION),
    agreementHash: String(latest.signatureHash ?? ""),
    legalFullName: String(latest.legalName ?? ""),
    legalIdNumber: String(latest.legalIdNumber ?? ""),
    contactPhone: String(latest.contactPhone ?? ""),
    paymentDetails: String(latest.paymentDetails ?? ""),
  };
}

/** Autores fundadores que firmaron antes de vincular la cuenta. */
function founderGrandfatheredAgreement(
  uid: string,
  existing: Record<string, unknown> | null,
  founder: FounderAuthorConfig,
): Record<string, unknown> {
  const signedAtUtc = String(existing?.createdAt ?? formatUtcTimestamp());
  const legalFullName = String(existing?.displayName ?? founder.name);
  const legalIdNumber = String(existing?.legalIdNumber ?? "FOUNDER");
  const payload = `${uid}${legalIdNumber}${signedAtUtc}${AUTHOR_TERMS_VERSION}`;
  const agreementHash = createHash("sha256").update(payload, "utf8").digest("hex");

  return {
    agreementSigned: true,
    agreementSignedAt: signedAtUtc,
    agreementSignatureName: legalFullName,
    agreementVersion: AUTHOR_TERMS_VERSION,
    agreementHash,
    legalFullName,
    ...(existing?.legalIdNumber ? { legalIdNumber: String(existing.legalIdNumber) } : {}),
    ...(existing?.contactPhone ? { contactPhone: String(existing.contactPhone) } : {}),
    ...(existing?.paymentDetails ? { paymentDetails: String(existing.paymentDetails) } : {}),
  };
}

async function resolveAgreementFieldsForFounder(
  uid: string,
  existing: Record<string, unknown> | null,
  founder: FounderAuthorConfig,
): Promise<Record<string, unknown>> {
  if (existing) {
    const fromUser = agreementFieldsFromUser(existing);
    if (fromUser) return fromUser;
  }

  const fromAudit = await agreementFieldsFromLegalAudit(uid);
  if (fromAudit) return fromAudit;

  return founderGrandfatheredAgreement(uid, existing, founder);
}

async function resolveUserPhotoURL(
  uid: string,
  existing: Record<string, unknown> | null,
): Promise<string | undefined> {
  const current = existing?.photoURL ? String(existing.photoURL) : undefined;

  if (current?.startsWith("http")) return current;

  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    try {
      const authUser = await adminAuth.getUser(uid);
      if (authUser.photoURL?.startsWith("http")) return authUser.photoURL;
    } catch {
      // Sin foto en Auth; no usar imagen curada del catálogo en la cuenta.
    }
  }

  return undefined;
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

  const batch = adminDb.batch();
  const wasLinked =
    existing?.authorSlug === founder.slug &&
    existing?.role === "author" &&
    existing?.legacyAuthorId === founder.legacyAuthorId;

  const agreementFields = await resolveAgreementFieldsForFounder(uid, existing, founder);
  const photoURL = await resolveUserPhotoURL(uid, existing);

  batch.set(
    userRef,
    {
      uid,
      email,
      displayName: founder.name,
      role: "author",
      bio: founder.bio,
      authorSlug: founder.slug,
      legacyAuthorId: founder.legacyAuthorId,
      linkedAt: existing?.linkedAt ?? new Date().toISOString(),
      ...(photoURL ? { photoURL } : {}),
      ...agreementFields,
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
    reason: wasLinked ? "already_linked" : undefined,
  };
}

export async function linkFounderAuthorByUid(
  slug: string,
  uid: string,
  email?: string,
): Promise<LinkFounderResult & { slug: string }> {
  const { findFounderBySlug } = await import("@/data/founder-authors");
  const founder = findFounderBySlug(slug);
  if (!founder) {
    return { slug, linked: false, reason: "founder_not_found" };
  }

  const adminDb = await getAdminDb();
  if (!adminDb) {
    return { slug, linked: false, reason: "admin_not_configured" };
  }

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const resolvedEmail = email ?? String(userSnap.data()?.email ?? "");

  const result = await linkFounderAuthorAdmin(uid, resolvedEmail, founder);
  return { slug, ...result };
}

export async function getUserProfileAdmin(uid: string, email?: string): Promise<UserProfile | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;

  return toUserProfile(uid, snap.data() as Record<string, unknown>, email);
}
