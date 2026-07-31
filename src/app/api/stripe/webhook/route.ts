import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  activateSubscriptionAdmin,
  deactivateSubscriptionAdmin,
} from "@/lib/subscription-admin";
import { addSubscriptionRevenueToPool } from "@/lib/monetization/monthly-pool-admin";
import {
  getStripeNetFromCheckoutSession,
  getStripeNetFromInvoice,
} from "@/lib/monetization/stripe-net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFirebaseUidFromSubscription(
  subscription: Stripe.Subscription,
): string | undefined {
  return subscription.metadata?.firebaseUid || undefined;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid = session.metadata?.firebaseUid;
  if (!firebaseUid) return;

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  await activateSubscriptionAdmin(firebaseUid, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: "premium",
  });

  const stripe = getStripe();
  const amounts = await getStripeNetFromCheckoutSession(stripe, session);
  if (amounts.netUsd > 0) {
    await addSubscriptionRevenueToPool(amounts);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripe = getStripe();
  const amounts = await getStripeNetFromInvoice(stripe, invoice);
  if (amounts.netUsd <= 0) return;

  await addSubscriptionRevenueToPool(amounts);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const firebaseUid = getFirebaseUidFromSubscription(subscription);
  if (!firebaseUid) return;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (subscription.status === "active" || subscription.status === "trialing") {
    const periodEnd =
      "current_period_end" in subscription &&
      typeof subscription.current_period_end === "number"
        ? subscription.current_period_end
        : undefined;

    await activateSubscriptionAdmin(firebaseUid, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: "premium",
      subscriptionExpiresAt: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : undefined,
    });
    return;
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid" ||
    subscription.status === "incomplete_expired"
  ) {
    await deactivateSubscriptionAdmin(firebaseUid);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const firebaseUid = getFirebaseUidFromSubscription(subscription);
  if (!firebaseUid) return;

  await deactivateSubscriptionAdmin(firebaseUid);
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret no configurado" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature:", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe/webhook] handler:", event.type, error);
    return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
