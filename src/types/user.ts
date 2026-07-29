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
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  subscribedAt?: string;
}

export function isPremiumUser(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
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
