import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { SubscriptionStatus } from "@/types/user";

export interface SubscriptionStripeData {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus | "canceled" | "past_due";
  subscriptionExpiresAt?: string;
}

export async function activateSubscriptionAdmin(
  uid: string,
  stripeData: SubscriptionStripeData = {},
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  await adminDb
    .collection("users")
    .doc(uid)
    .set(
      {
        isPremium: true,
        isSubscriber: true,
        subscriptionStatus: "premium",
        subscribedAt: new Date().toISOString(),
        ...stripeData,
      },
      { merge: true },
    );

  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    await adminAuth.setCustomUserClaims(uid, {
      premium: true,
      subscriptionStatus: "premium",
    });
  }
}

export async function deactivateSubscriptionAdmin(uid: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  await adminDb.collection("users").doc(uid).set(
    {
      isPremium: false,
      isSubscriber: false,
      subscriptionStatus: "free",
      subscriptionExpiresAt: new Date().toISOString(),
    },
    { merge: true },
  );

  const adminAuth = await getAdminAuth();
  if (adminAuth) {
    await adminAuth.setCustomUserClaims(uid, {
      premium: false,
      subscriptionStatus: "free",
    });
  }
}

export async function getStripeCustomerId(uid: string): Promise<string | undefined> {
  const adminDb = await getAdminDb();
  if (!adminDb) return undefined;

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return undefined;

  const data = snap.data();
  return typeof data?.stripeCustomerId === "string" ? data.stripeCustomerId : undefined;
}

export async function saveStripeCustomerId(uid: string, stripeCustomerId: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  await adminDb.collection("users").doc(uid).set({ stripeCustomerId }, { merge: true });
}
