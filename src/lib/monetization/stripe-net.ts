import type Stripe from "stripe";

/** Comisión estimada Stripe US (2.9% + $0.30) — fallback si no hay balance_transaction. */
export const STRIPE_FEE_PERCENT = 0.029;
export const STRIPE_FEE_FIXED_USD = 0.3;

export interface RevenueAmounts {
  grossUsd: number;
  feeUsd: number;
  netUsd: number;
}

export function estimateStripeNet(grossUsd: number): RevenueAmounts {
  const gross = Math.max(0, grossUsd);
  const feeUsd = Math.round((gross * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED_USD) * 100) / 100;
  const netUsd = Math.max(0, Math.round((gross - feeUsd) * 100) / 100);
  return { grossUsd: gross, feeUsd, netUsd };
}

export function splitNetRevenue(netUsd: number): { authorsShare: number; platformShare: number } {
  const net = Math.max(0, netUsd);
  return {
    authorsShare: Math.round(net * 0.7 * 100) / 100,
    platformShare: Math.round(net * 0.3 * 100) / 100,
  };
}

async function netFromBalanceTransaction(
  stripe: Stripe,
  balanceTransactionId: string,
  fallbackGrossUsd: number,
): Promise<RevenueAmounts> {
  try {
    const bt = await stripe.balanceTransactions.retrieve(balanceTransactionId);
    return {
      grossUsd: bt.amount / 100,
      feeUsd: bt.fee / 100,
      netUsd: bt.net / 100,
    };
  } catch {
    return estimateStripeNet(fallbackGrossUsd);
  }
}

async function netFromPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
  fallbackGrossUsd: number,
): Promise<RevenueAmounts> {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.balance_transaction"],
    });

    const charge = pi.latest_charge;
    if (typeof charge === "object" && charge?.balance_transaction) {
      const bt = charge.balance_transaction;
      if (typeof bt === "object" && bt !== null) {
        return {
          grossUsd: bt.amount / 100,
          feeUsd: bt.fee / 100,
          netUsd: bt.net / 100,
        };
      }
      if (typeof bt === "string") {
        return netFromBalanceTransaction(stripe, bt, fallbackGrossUsd);
      }
    }
  } catch {
    // fallback below
  }

  return estimateStripeNet(fallbackGrossUsd);
}

export async function getStripeNetFromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<RevenueAmounts> {
  const grossUsd =
    typeof session.amount_total === "number" ? session.amount_total / 100 : 0;

  if (grossUsd <= 0) {
    return { grossUsd: 0, feeUsd: 0, netUsd: 0 };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (paymentIntentId) {
    return netFromPaymentIntent(stripe, paymentIntentId, grossUsd);
  }

  return estimateStripeNet(grossUsd);
}

export async function getStripeNetFromInvoice(
  stripe: Stripe,
  invoice: Stripe.Invoice,
): Promise<RevenueAmounts> {
  const grossUsd =
    typeof invoice.amount_paid === "number" ? invoice.amount_paid / 100 : 0;

  if (grossUsd <= 0) {
    return { grossUsd: 0, feeUsd: 0, netUsd: 0 };
  }

  try {
    const full = await stripe.invoices.retrieve(invoice.id, {
      expand: ["charge.balance_transaction", "payment_intent.latest_charge.balance_transaction"],
    });

    const legacy = full as Stripe.Invoice & {
      charge?: string | Stripe.Charge | null;
      payment_intent?: string | Stripe.PaymentIntent | null;
    };

    const paymentIntentId =
      typeof legacy.payment_intent === "string"
        ? legacy.payment_intent
        : legacy.payment_intent?.id;

    if (paymentIntentId) {
      return netFromPaymentIntent(stripe, paymentIntentId, grossUsd);
    }

    const charge = legacy.charge;
    if (typeof charge === "object" && charge?.balance_transaction) {
      const bt = charge.balance_transaction;
      if (typeof bt === "object" && bt !== null) {
        return {
          grossUsd: bt.amount / 100,
          feeUsd: bt.fee / 100,
          netUsd: bt.net / 100,
        };
      }
      if (typeof bt === "string") {
        return netFromBalanceTransaction(stripe, bt, grossUsd);
      }
    }
    if (typeof charge === "string") {
      const chargeObj = await stripe.charges.retrieve(charge, {
        expand: ["balance_transaction"],
      });
      const bt = chargeObj.balance_transaction;
      if (typeof bt === "object" && bt !== null) {
        return {
          grossUsd: bt.amount / 100,
          feeUsd: bt.fee / 100,
          netUsd: bt.net / 100,
        };
      }
      if (typeof bt === "string") {
        return netFromBalanceTransaction(stripe, bt, grossUsd);
      }
    }
  } catch {
    // fallback below
  }

  return estimateStripeNet(grossUsd);
}
