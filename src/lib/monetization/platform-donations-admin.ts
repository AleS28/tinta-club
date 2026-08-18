import { COLLECTIONS } from "@/lib/monetization/constants";
import type { RevenueAmounts } from "@/lib/monetization/gateway-net";
import { getAdminDb } from "@/lib/firebase-admin";

export interface PlatformDonation {
  id: string;
  userId: string;
  donorDisplayName: string;
  amountPaid: number;
  gatewayFee: number;
  amountNet: number;
  checkoutId: string;
  paymentId?: string;
  createdAt: string;
}

export interface RecordPlatformDonationInput {
  userId: string;
  donorDisplayName: string;
  amounts: RevenueAmounts;
  checkoutId: string;
  paymentId?: string;
}

export async function recordPlatformDonation(
  input: RecordPlatformDonationInput,
): Promise<PlatformDonation> {
  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const { grossUsd, feeUsd, netUsd } = input.amounts;
  const now = new Date().toISOString();
  const ref = adminDb.collection(COLLECTIONS.platformDonations).doc(input.checkoutId);

  const donation: PlatformDonation = {
    id: ref.id,
    userId: input.userId,
    donorDisplayName: input.donorDisplayName,
    amountPaid: grossUsd,
    gatewayFee: feeUsd,
    amountNet: netUsd,
    checkoutId: input.checkoutId,
    paymentId: input.paymentId,
    createdAt: now,
  };

  await adminDb.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists) return;
    tx.set(ref, donation);
  });

  const saved = await ref.get();
  if (!saved.exists) {
    throw new Error("No se pudo registrar la donación a la plataforma");
  }

  return saved.data() as PlatformDonation;
}
