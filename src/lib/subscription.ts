import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { SubscriptionStatus } from "@/types/user";

export const DEFAULT_SUBSCRIPTION_PRICE = 4.99;

export async function activateSubscription(uid: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  await setDoc(
    doc(db, "users", uid),
    {
      isPremium: true,
      isSubscriber: true,
      subscriptionStatus: "premium" as SubscriptionStatus,
      subscribedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
