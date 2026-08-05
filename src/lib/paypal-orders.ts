import {
  findPayPalApproveUrl,
  getAppBaseUrl,
  paypalFetch,
  type PayPalLink,
} from "@/lib/paypal";
import {
  savePendingPayment,
  type PendingPaymentType,
} from "@/lib/monetization/pending-payments-admin";

export interface CreatePayPalOrderInput {
  type: Exclude<PendingPaymentType, "subscription">;
  firebaseUid: string;
  amountUsd: number;
  description: string;
  successPath: string;
  cancelPath: string;
  bookId?: string;
  chapterId?: string;
  authorId?: string;
  donorDisplayName?: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        amount?: { value: string; currency_code: string };
        status?: string;
      }>;
    };
    amount?: { value: string; currency_code: string };
  }>;
}

function formatUsd(amount: number): string {
  return amount.toFixed(2);
}

export async function createPayPalOrder(
  input: CreatePayPalOrderInput,
): Promise<{ orderId: string; approveUrl: string }> {
  const baseUrl = getAppBaseUrl();
  const returnUrl = `${baseUrl}/api/paypal/return?flow=order`;
  const cancelUrl = `${baseUrl}${input.cancelPath}`;

  const order = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: formatUsd(input.amountUsd),
          },
          description: input.description.slice(0, 127),
          custom_id: `${input.type}:${input.firebaseUid}`.slice(0, 127),
        },
      ],
      // Prioriza pagar con tarjeta sin cuenta PayPal (guest checkout)
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "El Imperio de la Tinta",
            landing_page: "GUEST_CHECKOUT",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  });

  const approveUrl = findPayPalApproveUrl(order.links);
  if (!order.id || !approveUrl) {
    throw new Error("PayPal no devolvió URL de aprobación");
  }

  await savePendingPayment(order.id, {
    type: input.type,
    firebaseUid: input.firebaseUid,
    amountUsd: input.amountUsd,
    currency: "USD",
    successPath: input.successPath,
    cancelPath: input.cancelPath,
    bookId: input.bookId,
    chapterId: input.chapterId,
    authorId: input.authorId,
    donorDisplayName: input.donorDisplayName,
    description: input.description,
  });

  return { orderId: order.id, approveUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  orderId: string;
  captureId?: string;
  grossUsd: number;
  status: string;
}> {
  const captured = await paypalFetch<PayPalOrderResponse>(
    `/v2/checkout/orders/${orderId}/capture`,
    { method: "POST", body: "{}" },
  );

  const capture = captured.purchase_units?.[0]?.payments?.captures?.[0];
  const grossUsd = capture?.amount?.value
    ? Number(capture.amount.value)
    : Number(captured.purchase_units?.[0]?.amount?.value ?? 0);

  return {
    orderId: captured.id,
    captureId: capture?.id,
    grossUsd: Number.isFinite(grossUsd) ? grossUsd : 0,
    status: captured.status,
  };
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  return paypalFetch<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`);
}
