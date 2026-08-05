import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, isPayPalConfigured } from "@/lib/paypal";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal-orders";
import { getPayPalSubscription } from "@/lib/paypal-subscriptions";
import {
  fulfillOneTimePayment,
  fulfillSubscriptionActivation,
  resolvePendingOrThrow,
} from "@/lib/monetization/fulfillment-admin";
import { deletePendingPayment } from "@/lib/monetization/pending-payments-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(path: string) {
  const base = getAppBaseUrl();
  const normalized = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return NextResponse.redirect(normalized);
}

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl();

  try {
    if (!isPayPalConfigured()) {
      return NextResponse.redirect(`${baseUrl}/biblioteca?subscription=canceled`);
    }

    const flow = request.nextUrl.searchParams.get("flow");
    const token = request.nextUrl.searchParams.get("token");
    const subscriptionId = request.nextUrl.searchParams.get("subscription_id");

    if (flow === "subscription" || subscriptionId) {
      const id = subscriptionId ?? token;
      if (!id) {
        return NextResponse.redirect(`${baseUrl}/biblioteca?subscription=canceled`);
      }

      const pending = await resolvePendingOrThrow(id);
      const subscription = await getPayPalSubscription(id);

      const status = String(subscription.status ?? "").toUpperCase();
      if (status === "ACTIVE" || status === "APPROVED") {
        await fulfillSubscriptionActivation({
          firebaseUid: pending.firebaseUid,
          paypalSubscriptionId: id,
          paypalPayerId: subscription.subscriber?.payer_id,
          subscriptionExpiresAt: subscription.billing_info?.next_billing_time,
        });
        await deletePendingPayment(id);
      }

      return redirectTo(pending.successPath);
    }

    // One-time order return: PayPal envía token=ORDER_ID
    const orderId = token;
    if (!orderId) {
      return NextResponse.redirect(`${baseUrl}/tienda?purchase=canceled`);
    }

    const pending = await resolvePendingOrThrow(orderId);

    let captureId: string | undefined;
    let grossUsd = pending.amountUsd;
    let status = "COMPLETED";

    try {
      const captured = await capturePayPalOrder(orderId);
      captureId = captured.captureId;
      grossUsd = captured.grossUsd || pending.amountUsd;
      status = captured.status;
    } catch (error) {
      // Puede estar ya capturado (doble visita / webhook)
      console.warn("[paypal/return] capture:", error);
      const existing = await getPayPalOrder(orderId);
      status = existing.status;
      const capture = existing.purchase_units?.[0]?.payments?.captures?.[0];
      captureId = capture?.id;
      if (capture?.amount?.value) {
        grossUsd = Number(capture.amount.value);
      }
    }

    if (status === "COMPLETED" || status === "APPROVED") {
      await fulfillOneTimePayment({
        pending,
        orderId,
        captureId,
        grossUsd,
      });
    }

    return redirectTo(pending.successPath);
  } catch (error) {
    console.error("[paypal/return]", error);
    const orderId = request.nextUrl.searchParams.get("token");
    const subscriptionId = request.nextUrl.searchParams.get("subscription_id");
    try {
      const pendingId = subscriptionId ?? orderId;
      if (pendingId) {
        const pending = await resolvePendingOrThrow(pendingId);
        return redirectTo(pending.cancelPath || pending.successPath);
      }
    } catch {
      // fallback abajo
    }
    return NextResponse.redirect(`${baseUrl}/biblioteca?payment=error`);
  }
}
