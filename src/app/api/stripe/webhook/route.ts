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
import { claimStripeProcessingKey } from "@/lib/monetization/stripe-processed-events-admin";
import { getMonthYearFromUnixSeconds } from "@/lib/monetization/month-year";
import {
  grantChapterPurchaseAccess,
  revokeChapterPurchaseAccess,
} from "@/lib/monetization/chapter-access-admin";
import {
  grantBookPurchaseAccess,
  revokeBookPurchaseAccess,
} from "@/lib/monetization/book-access-admin";
import {
  applyDirectSaleRefund,
  applyDirectBookSaleRefund,
  findDirectBookSaleByPaymentIntent,
  recordDirectChapterSaleFromStripe,
  recordDirectBookSaleFromStripe,
} from "@/lib/monetization/direct-sales-admin";
import { COLLECTIONS } from "@/lib/monetization/constants";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getFirebaseUidFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): string | undefined {
  return metadata?.firebaseUid || metadata?.userId || undefined;
}

function getFirebaseUidFromSubscription(
  subscription: Stripe.Subscription,
): string | undefined {
  return subscription.metadata?.firebaseUid || undefined;
}

function resolvePaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null | undefined,
): string | undefined {
  if (!paymentIntent) return undefined;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

async function findDirectSaleByPaymentIntent(paymentIntentId: string) {
  const adminDb = await getAdminDb();
  if (!adminDb) return null;

  const snap = await adminDb
    .collection(COLLECTIONS.directChapterSales)
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0]!.data();
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid = getFirebaseUidFromMetadata(session.metadata);
  if (!firebaseUid) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  await activateSubscriptionAdmin(firebaseUid, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: "premium",
  });
}

async function handleChapterPurchaseCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  if (session.payment_status !== "paid") return;

  const metadata = session.metadata ?? {};
  const firebaseUid = getFirebaseUidFromMetadata(metadata);
  const chapterId = metadata.chapterId;
  const bookId = metadata.bookId;
  const authorId = metadata.authorId;

  if (!firebaseUid || !chapterId || !bookId || !authorId) {
    console.error("[stripe/webhook] chapter purchase missing metadata", session.id);
    return;
  }

  const sessionKey = `checkout_payment_${session.id}`;
  const claimed = await claimStripeProcessingKey(sessionKey, {
    eventId: session.id,
    type: "chapter_purchase",
    metadata: { sessionId: session.id, firebaseUid, chapterId },
  });

  if (!claimed) return;

  const amounts = await getStripeNetFromCheckoutSession(stripe, session);
  const paymentIntentId = resolvePaymentIntentId(session.payment_intent);

  await recordDirectChapterSaleFromStripe({
    userId: firebaseUid,
    bookId,
    chapterId,
    authorId,
    amounts,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  });

  await grantChapterPurchaseAccess({
    userId: firebaseUid,
    bookId,
    chapterId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  });
}

async function handleBookPurchaseCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  if (session.payment_status !== "paid") return;

  const metadata = session.metadata ?? {};
  const firebaseUid = getFirebaseUidFromMetadata(metadata);
  const bookId = metadata.bookId;
  const authorId = metadata.authorId;

  if (!firebaseUid || !bookId || !authorId) {
    console.error("[stripe/webhook] book purchase missing metadata", session.id);
    return;
  }

  const sessionKey = `checkout_payment_${session.id}`;
  const claimed = await claimStripeProcessingKey(sessionKey, {
    eventId: session.id,
    type: "book_purchase",
    metadata: { sessionId: session.id, firebaseUid, bookId },
  });

  if (!claimed) return;

  const amounts = await getStripeNetFromCheckoutSession(stripe, session);
  const paymentIntentId = resolvePaymentIntentId(session.payment_intent);

  await recordDirectBookSaleFromStripe({
    userId: firebaseUid,
    bookId,
    authorId,
    amounts,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  });

  await grantBookPurchaseAccess({
    userId: firebaseUid,
    bookId,
    authorId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  });
}

async function handlePaymentCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  const purchaseType = session.metadata?.type;
  if (purchaseType === "book_purchase") {
    await handleBookPurchaseCheckoutCompleted(session, stripe);
    return;
  }

  await handleChapterPurchaseCheckoutCompleted(session, stripe);
}

function isSubscriptionInvoice(invoice: Stripe.Invoice): boolean {
  const reason = invoice.billing_reason;
  if (
    reason === "subscription_create" ||
    reason === "subscription_cycle" ||
    reason === "subscription_update" ||
    reason === "subscription_threshold"
  ) {
    return true;
  }

  return invoice.lines.data.some(
    (line) => !!line.parent?.subscription_item_details?.subscription,
  );
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  stripe: Stripe,
  eventId: string,
) {
  if (!invoice.id) return;

  if (!isSubscriptionInvoice(invoice)) {
    return;
  }

  const invoiceKey = `invoice_pool_${invoice.id}`;
  const claimed = await claimStripeProcessingKey(invoiceKey, {
    eventId,
    type: "subscription_pool",
    metadata: { invoiceId: invoice.id, billingReason: invoice.billing_reason },
  });

  if (!claimed) return;

  const amounts = await getStripeNetFromInvoice(stripe, invoice);
  if (amounts.netUsd <= 0 && amounts.grossUsd <= 0) return;

  const paidAt =
    invoice.status_transitions?.paid_at ??
    invoice.created ??
    Math.floor(Date.now() / 1000);

  await addSubscriptionRevenueToPool(amounts, getMonthYearFromUnixSeconds(paidAt));
}

async function handleChargeRefunded(charge: Stripe.Charge, eventId: string) {
  const refundKey = `charge_refund_${charge.id}_${charge.amount_refunded}`;
  const claimed = await claimStripeProcessingKey(refundKey, {
    eventId,
    type: "charge_refunded",
    metadata: { chargeId: charge.id, amountRefunded: charge.amount_refunded },
  });

  if (!claimed || charge.amount_refunded <= 0) return;

  const paymentIntentId = resolvePaymentIntentId(charge.payment_intent);
  const refundGross = charge.amount_refunded / 100;

  if (paymentIntentId) {
    const bookSale = await findDirectBookSaleByPaymentIntent(paymentIntentId);
    if (bookSale?.stripeCheckoutSessionId && !bookSale.refundedAt) {
      const originalGross = Number(bookSale.amountPaid ?? 0);
      const originalFee = Number(bookSale.gatewayFee ?? 0);
      const originalNet = Number(bookSale.amountNet ?? 0);
      const ratio = originalGross > 0 ? refundGross / originalGross : 1;

      await applyDirectBookSaleRefund({
        stripeCheckoutSessionId: String(bookSale.stripeCheckoutSessionId),
        refundAmounts: {
          grossUsd: -refundGross,
          feeUsd: -(originalFee * ratio),
          netUsd: -(originalNet * ratio),
        },
      });

      await revokeBookPurchaseAccess(String(bookSale.userId), String(bookSale.bookId));
      return;
    }

    const sale = await findDirectSaleByPaymentIntent(paymentIntentId);
    if (sale?.stripeCheckoutSessionId && !sale.refundedAt) {
      const originalGross = Number(sale.amountPaid ?? 0);
      const originalFee = Number(sale.gatewayFee ?? 0);
      const originalNet = Number(sale.amountNet ?? 0);
      const ratio = originalGross > 0 ? refundGross / originalGross : 1;

      await applyDirectSaleRefund({
        stripeCheckoutSessionId: String(sale.stripeCheckoutSessionId),
        refundAmounts: {
          grossUsd: -refundGross,
          feeUsd: -(originalFee * ratio),
          netUsd: -(originalNet * ratio),
        },
      });

      await revokeChapterPurchaseAccess(String(sale.userId), String(sale.chapterId));
      return;
    }
  }

  const estimatedFee = refundGross * 0.029 + (charge.amount_refunded === charge.amount ? 0.3 : 0);
  const netRefund = Math.max(0, refundGross - estimatedFee);

  await addSubscriptionRevenueToPool(
    {
      grossUsd: -refundGross,
      feeUsd: -estimatedFee,
      netUsd: -netRefund,
    },
    getMonthYearFromUnixSeconds(charge.created),
  );
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

  const eventClaimed = await claimStripeProcessingKey(`event_${event.id}`, {
    eventId: event.id,
    type: event.type,
    metadata: { livemode: event.livemode },
  });

  if (!eventClaimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        } else if (session.mode === "payment") {
          await handlePaymentCheckoutCompleted(session, stripe);
        }
        break;
      }
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
          stripe,
          event.id,
        );
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge, event.id);
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
