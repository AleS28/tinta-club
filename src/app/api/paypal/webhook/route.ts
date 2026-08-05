import { NextRequest, NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalApiBase, isPayPalConfigured } from "@/lib/paypal";
import { getPayPalOrder } from "@/lib/paypal-orders";
import { getPayPalSubscription } from "@/lib/paypal-subscriptions";
import { claimPaymentProcessingKey } from "@/lib/monetization/payment-processed-events-admin";
import { getPendingPayment } from "@/lib/monetization/pending-payments-admin";
import {
  fulfillOneTimePayment,
  fulfillPaymentRefund,
  fulfillSubscriptionActivation,
  fulfillSubscriptionDeactivation,
  fulfillSubscriptionSale,
} from "@/lib/monetization/fulfillment-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  create_time?: string;
  resource: Record<string, unknown>;
}

async function verifyPayPalWebhook(
  request: NextRequest,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // En desarrollo local se puede omitir la verificación si no hay webhook id
    return process.env.NODE_ENV !== "production";
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionSig = request.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!response.ok) return false;
  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}

export async function POST(request: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 503 });
  }

  const rawBody = await request.text();

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const verified = await verifyPayPalWebhook(request, rawBody);
  if (!verified) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const eventClaimed = await claimPaymentProcessingKey(`event_${event.id}`, {
    eventId: event.id,
    type: event.event_type,
  });

  if (!eventClaimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED": {
        const orderId = String(event.resource.id ?? "");
        if (!orderId) break;
        const pending = await getPendingPayment(orderId);
        if (!pending || pending.type === "subscription") break;

        // El return handler captura; si el usuario cierra la pestaña, capturamos aquí
        const { capturePayPalOrder } = await import("@/lib/paypal-orders");
        try {
          const captured = await capturePayPalOrder(orderId);
          await fulfillOneTimePayment({
            pending,
            orderId,
            captureId: captured.captureId,
            grossUsd: captured.grossUsd || pending.amountUsd,
          });
        } catch {
          const existing = await getPayPalOrder(orderId);
          const capture = existing.purchase_units?.[0]?.payments?.captures?.[0];
          if (existing.status === "COMPLETED" || capture) {
            await fulfillOneTimePayment({
              pending,
              orderId,
              captureId: capture?.id,
              grossUsd: capture?.amount?.value
                ? Number(capture.amount.value)
                : pending.amountUsd,
            });
          }
        }
        break;
      }

      case "PAYMENT.CAPTURE.COMPLETED": {
        const capture = event.resource;
        const orderId =
          typeof capture.supplementary_data === "object" &&
          capture.supplementary_data !== null &&
          "related_ids" in capture.supplementary_data
            ? String(
                (capture.supplementary_data as { related_ids?: { order_id?: string } })
                  .related_ids?.order_id ?? "",
              )
            : "";

        // custom_id a veces está en el capture; preferimos pending por order
        const pending = orderId ? await getPendingPayment(orderId) : null;
        if (pending && pending.type !== "subscription") {
          const grossUsd = Number(
            (capture.amount as { value?: string } | undefined)?.value ?? pending.amountUsd,
          );
          await fulfillOneTimePayment({
            pending,
            orderId,
            captureId: String(capture.id ?? ""),
            grossUsd,
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        const subscriptionId = String(event.resource.id ?? "");
        const customId = String(event.resource.custom_id ?? "");
        const status = String(event.resource.status ?? "").toUpperCase();

        let firebaseUid = customId;
        const pending = subscriptionId ? await getPendingPayment(subscriptionId) : null;
        if (pending) firebaseUid = pending.firebaseUid;

        if (!firebaseUid || !subscriptionId) break;

        if (status === "ACTIVE" || status === "APPROVED" || event.event_type.endsWith("ACTIVATED")) {
          const sub = await getPayPalSubscription(subscriptionId);
          await fulfillSubscriptionActivation({
            firebaseUid,
            paypalSubscriptionId: subscriptionId,
            paypalPayerId: sub.subscriber?.payer_id,
            subscriptionExpiresAt: sub.billing_info?.next_billing_time,
          });
        } else if (
          status === "CANCELLED" ||
          status === "EXPIRED" ||
          status === "SUSPENDED"
        ) {
          await fulfillSubscriptionDeactivation(firebaseUid);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subscriptionId = String(event.resource.id ?? "");
        const customId = String(event.resource.custom_id ?? "");
        const pending = subscriptionId ? await getPendingPayment(subscriptionId) : null;
        const firebaseUid = pending?.firebaseUid || customId;
        if (firebaseUid) {
          await fulfillSubscriptionDeactivation(firebaseUid);
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Cobros de suscripción recurrente
        const saleId = String(event.resource.id ?? event.id);
        const billingAgreementId = String(
          event.resource.billing_agreement_id ?? event.resource.billing_agreement_id ?? "",
        );
        const grossUsd = Number(
          (event.resource.amount as { total?: string; value?: string } | undefined)?.total ??
            (event.resource.amount as { value?: string } | undefined)?.value ??
            0,
        );

        // Solo acreditar pool si está ligado a una suscripción
        if (billingAgreementId || event.resource.billing_agreement_id) {
          await fulfillSubscriptionSale({
            saleId,
            grossUsd,
            paidAtIso: event.create_time ?? event.resource.create_time
              ? String(event.resource.create_time ?? event.create_time)
              : undefined,
          });
        }
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED":
      case "PAYMENT.SALE.REFUNDED": {
        const refundId = String(event.resource.id ?? event.id);
        const paymentId = String(
          event.resource.sale_id ??
            event.resource.id ??
            (event.resource.links as Array<{ rel?: string; href?: string }> | undefined)?.find(
              (l) => l.rel === "up",
            )?.href?.split("/").pop() ??
            "",
        );
        const refundGross = Number(
          (event.resource.amount as { value?: string; total?: string } | undefined)?.value ??
            (event.resource.amount as { total?: string } | undefined)?.total ??
            0,
        );

        if (paymentId && refundGross > 0) {
          await fulfillPaymentRefund({
            refundId,
            paymentId,
            refundGrossUsd: refundGross,
            createdAtUnix: event.create_time
              ? Math.floor(new Date(event.create_time).getTime() / 1000)
              : undefined,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[paypal/webhook] handler:", event.event_type, error);
    return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
