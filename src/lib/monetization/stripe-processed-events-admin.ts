import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

export interface StripeProcessedEventRecord {
  key: string;
  eventId?: string;
  type: string;
  processedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Reclama una clave de idempotencia de Stripe (event.id, invoice.id, session.id, etc.).
 * Devuelve true si es la primera vez; false si ya fue procesada.
 */
export async function claimStripeProcessingKey(
  key: string,
  payload: Omit<StripeProcessedEventRecord, "key" | "processedAt">,
): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.stripeProcessedEvents).doc(key);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return false;

    tx.set(ref, {
      key,
      ...payload,
      processedAt: new Date().toISOString(),
    });
    return true;
  });
}

export async function wasStripeProcessingKeyClaimed(key: string): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const snap = await adminDb.collection(COLLECTIONS.stripeProcessedEvents).doc(key).get();
  return snap.exists;
}
