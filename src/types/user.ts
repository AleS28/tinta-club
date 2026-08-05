import { AUTHOR_TERMS_VERSION } from "@/types/terms";
import { findFounderBySlug } from "@/data/founder-authors";

export type UserRole = "reader" | "author" | "admin";
export type SubscriptionStatus = "free" | "premium";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSubscriber: boolean;
  isPremium?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  photoURL?: string;
  bio?: string;
  /** Slug del perfil público curado (/autor/[slug]) */
  authorSlug?: string;
  /** ID legacy del mock antes de vincular la cuenta Firebase */
  legacyAuthorId?: string;
  paypalPayerId?: string;
  paypalSubscriptionId?: string;
  /** @deprecated Compat Stripe */
  stripeCustomerId?: string;
  /** @deprecated Compat Stripe */
  stripeSubscriptionId?: string;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  subscribedAt?: string;
  /** Acuerdo de autor firmado a nivel de cuenta */
  legalFullName?: string;
  legalIdNumber?: string;
  contactPhone?: string;
  paymentDetails?: string;
  agreementSigned?: boolean;
  agreementSignedAt?: string;
  agreementSignatureName?: string;
  agreementVersion?: string;
  agreementHash?: string;
}

export function isAdminUser(profile: UserProfile | null | undefined): boolean {
  return profile?.role === "admin";
}

export function hasAuthorPanelAccess(profile: UserProfile | null | undefined): boolean {
  return profile?.role === "author";
}

/** Acuerdo de autor vigente firmado una sola vez por cuenta. */
export function hasAuthorAgreementSigned(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.authorSlug && findFounderBySlug(profile.authorSlug)) return true;
  if (!profile.agreementSigned) return false;
  if (!profile.agreementVersion) return true;
  return profile.agreementVersion === AUTHOR_TERMS_VERSION;
}

/** Autor puede publicar obras y capítulos (acuerdo firmado o admin). */
export function canAuthorPublish(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  if (isAdminUser(profile)) return true;
  return hasAuthorAgreementSigned(profile);
}

export function isPremiumUser(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  if (isAdminUser(profile)) return true;
  return (
    profile.isPremium === true ||
    profile.isSubscriber === true ||
    profile.subscriptionStatus === "premium"
  );
}

export function normalizeUserProfile(profile: UserProfile): UserProfile {
  const premium = isPremiumUser(profile);
  return {
    ...profile,
    isPremium: premium,
    isSubscriber: premium,
    subscriptionStatus: premium ? "premium" : "free",
  };
}
