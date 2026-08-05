import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

export interface PaymentProcessedEventRecord {
  key: string;
  eventId?: string;
  type: string;
  processedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Reclama una clave de idempotencia de pagos (event.id, order.id, capture.id, etc.).
 * Devuelve true si es la primera vez; false si ya fue procesada.
 */
export async function claimPaymentProcessingKey(
  key: string,
  payload: Omit<PaymentProcessedEventRecord, "key" | "processedAt">,
): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const ref = adminDb.collection(COLLECTIONS.paymentProcessedEvents).doc(key);

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

export async function wasPaymentProcessingKeyClaimed(key: string): Promise<boolean> {
  const adminDb = await getAdminDb();
  if (!adminDb) return false;

  const snap = await adminDb.collection(COLLECTIONS.paymentProcessedEvents).doc(key).get();
  return snap.exists;
}

/** @deprecated Usar claimPaymentProcessingKey */
export const claimStripeProcessingKey = claimPaymentProcessingKey;
