"use client";

import type { User } from "firebase/auth";

interface StripeCheckoutOptions {
  bookId?: string;
  redirectTo?: string;
  priceUsd?: number;
}

export async function startStripeCheckout(
  user: User,
  options: StripeCheckoutOptions = {},
): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "No se pudo iniciar el pago con Stripe");
  }

  window.location.href = payload.url;
}

export async function openStripeBillingPortal(user: User): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "No se pudo abrir el portal de facturación");
  }

  window.location.href = payload.url;
}
