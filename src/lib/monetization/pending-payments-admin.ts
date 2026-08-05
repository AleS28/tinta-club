import { getAdminDb } from "@/lib/firebase-admin";

export type PendingPaymentType =
  | "subscription"
  | "chapter_purchase"
  | "book_purchase"
  | "author_donation";

export interface PendingPayment {
  id: string;
  type: PendingPaymentType;
  firebaseUid: string;
  amountUsd: number;
  currency: "USD";
  successPath: string;
  cancelPath: string;
  bookId?: string;
  chapterId?: string;
  authorId?: string;
  donorDisplayName?: string;
  description?: string;
  createdAt: string;
}

const COLLECTION = "pending_payments";

export async function savePendingPayment(
  id: string,
  data: Omit<PendingPayment, "id" | "createdAt">,
): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const payload: Record<string, unknown> = {
    id,
    type: data.type,
    firebaseUid: data.firebaseUid,
    amountUsd: data.amountUsd,
    currency: data.currency,
    successPath: data.successPath,
    cancelPath: data.cancelPath,
    createdAt: new Date().toISOString(),
  };

  if (data.bookId) payload.bookId = data.bookId;
  if (data.chapterId) payload.chapterId = data.chapterId;
  if (data.authorId) payload.authorId = data.authorId;
  if (data.donorDisplayName) payload.donorDisplayName = data.donorDisplayName;
  if (data.description) payload.description = data.description;

  await adminDb.collection(COLLECTION).doc(id).set(payload);
}

export async function getPendingPayment(id: string): Promise<PendingPayment | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as PendingPayment;
}

export async function deletePendingPayment(id: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;
  await adminDb.collection(COLLECTION).doc(id).delete().catch(() => undefined);
}
