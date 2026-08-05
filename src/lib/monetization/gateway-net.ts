/** Comisión estimada PayPal Checkout US (~2.99% + $0.49). */
export const PAYPAL_FEE_PERCENT = 0.0299;
export const PAYPAL_FEE_FIXED_USD = 0.49;

export interface RevenueAmounts {
  grossUsd: number;
  feeUsd: number;
  netUsd: number;
}

export function estimatePayPalNet(grossUsd: number): RevenueAmounts {
  const gross = Math.max(0, grossUsd);
  const feeUsd = Math.round((gross * PAYPAL_FEE_PERCENT + PAYPAL_FEE_FIXED_USD) * 100) / 100;
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

/** @deprecated Alias — usar estimatePayPalNet */
export const estimateStripeNet = estimatePayPalNet;
