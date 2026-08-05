"use client";

import type { User } from "firebase/auth";

interface PayPalCheckoutOptions {
  bookId?: string;
  redirectTo?: string;
  priceUsd?: number;
}

export async function startPayPalCheckout(
  user: User,
  options: PayPalCheckoutOptions = {},
): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/paypal/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "No se pudo iniciar el pago con PayPal");
  }

  window.location.href = payload.url;
}

export async function cancelPayPalSubscription(user: User): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/paypal/cancel", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };

  if (!response.ok) {
    throw new Error(payload.error ?? "No se pudo cancelar la suscripción");
  }
}
