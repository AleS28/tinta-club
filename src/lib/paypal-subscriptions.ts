import { BRAND_NAME } from "@/lib/brand";
import { DEFAULT_SUBSCRIPTION_PRICE } from "@/lib/subscription";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  findPayPalApproveUrl,
  getAppBaseUrl,
  getPayPalMode,
  paypalFetch,
  type PayPalLink,
} from "@/lib/paypal";
import { savePendingPayment } from "@/lib/monetization/pending-payments-admin";

function getPlanDocId(): string {
  return `paypal_subscription_plan_${getPayPalMode()}`;
}

interface PayPalProduct {
  id: string;
}

interface PayPalPlan {
  id: string;
}

interface PayPalSubscription {
  id: string;
  status: string;
  links?: PayPalLink[];
  custom_id?: string;
  billing_info?: {
    last_payment?: {
      amount?: { value: string; currency_code: string };
      time?: string;
    };
    next_billing_time?: string;
  };
  subscriber?: {
    payer_id?: string;
    email_address?: string;
  };
}

async function getCachedPlanId(priceUsd: number): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb.collection("app_config").doc(getPlanDocId()).get();
  if (!snap.exists) return null;

  const data = snap.data();
  if (Number(data?.priceUsd) !== priceUsd) return null;
  return typeof data?.planId === "string" ? data.planId : null;
}

async function saveCachedPlanId(planId: string, priceUsd: number): Promise<void> {
  const adminDb = await getAdminDb();
  if (!adminDb) return;

  await adminDb.collection("app_config").doc(getPlanDocId()).set(
    {
      planId,
      priceUsd,
      mode: getPayPalMode(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function ensureSubscriptionPlanId(priceUsd: number): Promise<string> {
  const fromEnv = process.env.PAYPAL_SUBSCRIPTION_PLAN_ID;
  if (fromEnv) return fromEnv;

  const cached = await getCachedPlanId(priceUsd);
  if (cached) return cached;

  const product = await paypalFetch<PayPalProduct>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: `Socia del Imperio — ${BRAND_NAME}`,
      description: "Acceso ilimitado a capítulos premium y apoyo a autores independientes.",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  const plan = await paypalFetch<PayPalPlan>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      name: `Socia del Imperio mensual — $${priceUsd.toFixed(2)}`,
      description: "Suscripción mensual",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: priceUsd.toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  // Algunos entornos dejan el plan en CREATED; activarlo garantiza que se pueda suscribir
  try {
    await paypalFetch(`/v1/billing/plans/${plan.id}/activate`, {
      method: "POST",
      body: "{}",
    });
  } catch {
    // Ya activo u omitido
  }

  await saveCachedPlanId(plan.id, priceUsd);
  return plan.id;
}

export async function createPayPalSubscription(input: {
  firebaseUid: string;
  email: string;
  priceUsd?: number;
  bookId?: string;
  successPath: string;
  cancelPath: string;
}): Promise<{ subscriptionId: string; approveUrl: string }> {
  const priceUsd = input.priceUsd ?? DEFAULT_SUBSCRIPTION_PRICE;
  const planId = await ensureSubscriptionPlanId(priceUsd);
  const baseUrl = getAppBaseUrl();

  const subscription = await paypalFetch<PayPalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    headers: {
      "PayPal-Request-Id": `sub-${input.firebaseUid}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: input.firebaseUid.slice(0, 127),
      subscriber: {
        email_address: input.email,
      },
      application_context: {
        brand_name: BRAND_NAME,
        user_action: "SUBSCRIBE_NOW",
        return_url: `${baseUrl}/api/paypal/return?flow=subscription`,
        cancel_url: `${baseUrl}${input.cancelPath}`,
      },
    }),
  });

  const approveUrl = findPayPalApproveUrl(subscription.links);
  if (!subscription.id || !approveUrl) {
    throw new Error("PayPal no devolvió URL de aprobación de suscripción");
  }

  await savePendingPayment(subscription.id, {
    type: "subscription",
    firebaseUid: input.firebaseUid,
    amountUsd: priceUsd,
    currency: "USD",
    successPath: input.successPath,
    cancelPath: input.cancelPath,
    bookId: input.bookId,
    description: `Socia del Imperio — ${BRAND_NAME}`,
  });

  return { subscriptionId: subscription.id, approveUrl };
}

export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>(`/v1/billing/subscriptions/${subscriptionId}`);
}

export async function cancelPayPalSubscriptionRemote(
  subscriptionId: string,
  reason = "Cancelada por la usuaria desde El Imperio de la Tinta",
): Promise<void> {
  await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
