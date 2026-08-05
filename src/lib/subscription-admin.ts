import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { SubscriptionStatus } from "@/types/user";

export interface SubscriptionGatewayData {
  paypalPayerId?: string;
  paypalSubscriptionId?: string;
  /** @deprecated Compatibilidad con datos Stripe previos */
  stripeCustomerId?: string;
  /** @deprecated Compatibilidad con datos Stripe previos */
  stripeSubscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus | "canceled" | "past_due";
  subscriptionExpiresAt?: string;
}

export async function activateSubscriptionAdmin(
  uid: string,
  gatewayData: SubscriptionGatewayData = {},
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
        ...gatewayData,
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

export async function getPayPalSubscriptionId(uid: string): Promise<string | undefined> {
  const adminDb = await getAdminDb();
  if (!adminDb) return undefined;

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return undefined;

  const data = snap.data();
  if (typeof data?.paypalSubscriptionId === "string") return data.paypalSubscriptionId;
  return undefined;
}

export async function savePayPalPayerId(uid: string, paypalPayerId: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  await adminDb.collection("users").doc(uid).set({ paypalPayerId }, { merge: true });
}
