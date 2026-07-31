/**
 * Simula webhooks firmados localmente (equivalente a stripe listen + trigger).
 * Uso: npx tsx scripts/test-stripe-webhooks-local.ts [baseUrl]
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/stripe/webhook`;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.error("STRIPE_WEBHOOK_SECRET no está definido en .env.local");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

function uniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function postSignedEvent(event: Stripe.Event): Promise<number> {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret as string,
  });

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const body = await response.text();
  console.log(`→ ${event.type}`);
  console.log(`  HTTP ${response.status} ${response.statusText}`);
  console.log(`  Body: ${body.slice(0, 200)}`);
  return response.status;
}

function buildInvoicePaymentSucceededEvent(): Stripe.Event {
  const invoiceId = uniqueId("in");
  return {
    id: uniqueId("evt"),
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "invoice.payment_succeeded",
    data: {
      object: {
        id: invoiceId,
        object: "invoice",
        amount_paid: 649,
        billing_reason: "subscription_create",
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        lines: {
          object: "list",
          data: [
            {
              id: "il_test",
              object: "line_item",
              amount: 649,
              parent: {
                subscription_item_details: {
                  subscription: "sub_test_subscription",
                },
              },
            },
          ],
          has_more: false,
          url: "/v1/invoices/lines",
        },
        status_transitions: {
          paid_at: Math.floor(Date.now() / 1000),
        },
      } as Stripe.Invoice,
    },
  } as Stripe.Event;
}

function buildCheckoutSessionCompletedPaymentEvent(): Stripe.Event {
  const sessionId = uniqueId("cs");
  return {
    id: uniqueId("evt"),
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        mode: "payment",
        payment_status: "paid",
        amount_total: 100,
        currency: "usd",
        metadata: {
          type: "chapter_purchase",
          firebaseUid: "test_uid_webhook",
          userId: "test_uid_webhook",
          chapterId: "test_chapter",
          bookId: "test_book",
          authorId: "test_author",
        },
        payment_intent: uniqueId("pi"),
      } as unknown as Stripe.Checkout.Session,
    },
  } as Stripe.Event;
}

function buildChargeRefundedEvent(): Stripe.Event {
  return {
    id: uniqueId("evt"),
    object: "event",
    api_version: "2024-11-20.acacia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "charge.refunded",
    data: {
      object: {
        id: uniqueId("ch"),
        object: "charge",
        amount: 100,
        amount_refunded: 100,
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        payment_intent: uniqueId("pi"),
      } as Stripe.Charge,
    },
  } as Stripe.Event;
}

async function main() {
  console.log(`Probando webhook en ${webhookUrl}\n`);

  const events = [
    buildInvoicePaymentSucceededEvent(),
    buildCheckoutSessionCompletedPaymentEvent(),
    buildChargeRefundedEvent(),
  ];

  const statuses: number[] = [];
  for (const event of events) {
    statuses.push(await postSignedEvent(event));
    console.log("");
  }

  const allOk = statuses.every((s) => s === 200);
  console.log(allOk ? "✓ Todos los eventos respondieron HTTP 200" : "✗ Al menos un evento no devolvió 200");
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
