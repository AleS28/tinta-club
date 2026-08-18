import {
  activateSubscriptionAdmin,
  deactivateSubscriptionAdmin,
} from "@/lib/subscription-admin";
import { estimatePayPalNet } from "@/lib/monetization/gateway-net";
import { claimPaymentProcessingKey } from "@/lib/monetization/payment-processed-events-admin";
import {
  deletePendingPayment,
  getPendingPayment,
  type PendingPayment,
} from "@/lib/monetization/pending-payments-admin";
import {
  grantChapterPurchaseAccess,
  revokeChapterPurchaseAccess,
} from "@/lib/monetization/chapter-access-admin";
import {
  grantBookPurchaseAccess,
  revokeBookPurchaseAccess,
} from "@/lib/monetization/book-access-admin";
import {
  applyDirectBookSaleRefund,
  applyDirectSaleRefund,
  findDirectBookSaleByPaymentId,
  findDirectChapterSaleByPaymentId,
  recordDirectBookSale,
  recordDirectChapterSale,
} from "@/lib/monetization/direct-sales-admin";
import { recordAuthorDonation } from "@/lib/monetization/donations-admin";
import { recordPlatformDonation } from "@/lib/monetization/platform-donations-admin";
import { addSubscriptionRevenueToPool } from "@/lib/monetization/monthly-pool-admin";
import { getCurrentMonthYear, getMonthYearFromUnixSeconds } from "@/lib/monetization/month-year";

export async function fulfillSubscriptionActivation(input: {
  firebaseUid: string;
  paypalSubscriptionId: string;
  paypalPayerId?: string;
  subscriptionExpiresAt?: string;
}): Promise<void> {
  const key = `subscription_activate_${input.paypalSubscriptionId}`;
  const claimed = await claimPaymentProcessingKey(key, {
    eventId: input.paypalSubscriptionId,
    type: "subscription_activate",
    metadata: { firebaseUid: input.firebaseUid },
  });

  // Siempre re-activar (idempotente en Firestore) aunque el claim falle por retries
  await activateSubscriptionAdmin(input.firebaseUid, {
    paypalSubscriptionId: input.paypalSubscriptionId,
    paypalPayerId: input.paypalPayerId,
    subscriptionStatus: "premium",
    subscriptionExpiresAt: input.subscriptionExpiresAt,
  });

  if (!claimed) return;
}

export async function fulfillSubscriptionDeactivation(firebaseUid: string): Promise<void> {
  await deactivateSubscriptionAdmin(firebaseUid);
}

export async function fulfillOneTimePayment(input: {
  pending: PendingPayment;
  orderId: string;
  captureId?: string;
  grossUsd: number;
}): Promise<void> {
  const { pending, orderId, captureId, grossUsd } = input;
  const amounts =
    grossUsd > 0 ? estimatePayPalNet(grossUsd) : estimatePayPalNet(pending.amountUsd);

  // Registrar primero (idempotente por orderId); el claim va al final para no bloquear reintentos
  if (pending.type === "chapter_purchase") {
    if (!pending.chapterId || !pending.bookId || !pending.authorId) {
      throw new Error("Metadata incompleta para compra de capítulo");
    }

    await recordDirectChapterSale({
      userId: pending.firebaseUid,
      bookId: pending.bookId,
      chapterId: pending.chapterId,
      authorId: pending.authorId,
      amounts,
      checkoutId: orderId,
      paymentId: captureId,
    });

    await grantChapterPurchaseAccess({
      userId: pending.firebaseUid,
      bookId: pending.bookId,
      chapterId: pending.chapterId,
      checkoutId: orderId,
      paymentId: captureId,
    });
  } else if (pending.type === "book_purchase") {
    if (!pending.bookId || !pending.authorId) {
      throw new Error("Metadata incompleta para compra de libro");
    }

    await recordDirectBookSale({
      userId: pending.firebaseUid,
      bookId: pending.bookId,
      authorId: pending.authorId,
      amounts,
      checkoutId: orderId,
      paymentId: captureId,
    });

    await grantBookPurchaseAccess({
      userId: pending.firebaseUid,
      bookId: pending.bookId,
      authorId: pending.authorId,
      checkoutId: orderId,
      paymentId: captureId,
    });
  } else if (pending.type === "author_donation") {
    if (!pending.authorId) {
      throw new Error("Metadata incompleta para donación");
    }

    await recordAuthorDonation({
      userId: pending.firebaseUid,
      donorDisplayName: pending.donorDisplayName ?? "Lector",
      authorId: pending.authorId,
      amounts,
      checkoutId: orderId,
      paymentId: captureId,
    });
  } else if (pending.type === "platform_donation") {
    await recordPlatformDonation({
      userId: pending.firebaseUid,
      donorDisplayName: pending.donorDisplayName ?? "Lector",
      amounts,
      checkoutId: orderId,
      paymentId: captureId,
    });
  }

  await claimPaymentProcessingKey(`checkout_payment_${orderId}`, {
    eventId: orderId,
    type: pending.type,
    metadata: {
      orderId,
      captureId,
      firebaseUid: pending.firebaseUid,
    },
  });

  await deletePendingPayment(orderId);
}

export async function fulfillSubscriptionSale(input: {
  saleId: string;
  grossUsd: number;
  paidAtIso?: string;
}): Promise<void> {
  if (input.grossUsd <= 0) return;

  const invoiceKey = `subscription_sale_${input.saleId}`;
  const claimed = await claimPaymentProcessingKey(invoiceKey, {
    eventId: input.saleId,
    type: "subscription_pool",
    metadata: { grossUsd: input.grossUsd },
  });

  if (!claimed) return;

  const amounts = estimatePayPalNet(input.grossUsd);
  const monthYear = input.paidAtIso
    ? input.paidAtIso.slice(0, 7)
    : getCurrentMonthYear();

  await addSubscriptionRevenueToPool(amounts, monthYear);
}

export async function fulfillPaymentRefund(input: {
  refundId: string;
  paymentId: string;
  refundGrossUsd: number;
  createdAtUnix?: number;
}): Promise<void> {
  const refundKey = `payment_refund_${input.refundId}_${Math.round(input.refundGrossUsd * 100)}`;
  const claimed = await claimPaymentProcessingKey(refundKey, {
    eventId: input.refundId,
    type: "payment_refunded",
    metadata: {
      paymentId: input.paymentId,
      refundGrossUsd: input.refundGrossUsd,
    },
  });

  if (!claimed || input.refundGrossUsd <= 0) return;

  const bookSale = await findDirectBookSaleByPaymentId(input.paymentId);
  if (bookSale?.checkoutId && !bookSale.refundedAt) {
    const originalGross = Number(bookSale.amountPaid ?? 0);
    const originalFee = Number(bookSale.gatewayFee ?? 0);
    const originalNet = Number(bookSale.amountNet ?? 0);
    const ratio = originalGross > 0 ? input.refundGrossUsd / originalGross : 1;

    await applyDirectBookSaleRefund({
      checkoutId: String(bookSale.checkoutId),
      refundAmounts: {
        grossUsd: -input.refundGrossUsd,
        feeUsd: -(originalFee * ratio),
        netUsd: -(originalNet * ratio),
      },
    });

    await revokeBookPurchaseAccess(String(bookSale.userId), String(bookSale.bookId));
    return;
  }

  const sale = await findDirectChapterSaleByPaymentId(input.paymentId);
  if (sale?.checkoutId && !sale.refundedAt) {
    const originalGross = Number(sale.amountPaid ?? 0);
    const originalFee = Number(sale.gatewayFee ?? 0);
    const originalNet = Number(sale.amountNet ?? 0);
    const ratio = originalGross > 0 ? input.refundGrossUsd / originalGross : 1;

    await applyDirectSaleRefund({
      checkoutId: String(sale.checkoutId),
      refundAmounts: {
        grossUsd: -input.refundGrossUsd,
        feeUsd: -(originalFee * ratio),
        netUsd: -(originalNet * ratio),
      },
    });

    await revokeChapterPurchaseAccess(String(sale.userId), String(sale.chapterId));
    return;
  }

  const amounts = estimatePayPalNet(input.refundGrossUsd);
  await addSubscriptionRevenueToPool(
    {
      grossUsd: -amounts.grossUsd,
      feeUsd: -amounts.feeUsd,
      netUsd: -amounts.netUsd,
    },
    input.createdAtUnix
      ? getMonthYearFromUnixSeconds(input.createdAtUnix)
      : getCurrentMonthYear(),
  );
}

export async function resolvePendingOrThrow(id: string): Promise<PendingPayment> {
  const pending = await getPendingPayment(id);
  if (!pending) {
    throw new Error(`Pago pendiente no encontrado: ${id}`);
  }
  return pending;
}
