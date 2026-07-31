/**
 * Ejecuta Stripe CLI con variables de .env.local (STRIPE_SECRET_KEY → STRIPE_API_KEY).
 * Uso: npx tsx scripts/stripe-cli.ts listen --forward-to localhost:3000/api/stripe/webhook
 *      npx tsx scripts/stripe-cli.ts trigger invoice.payment_succeeded
 */
import { config } from "dotenv";
import { spawnSync } from "child_process";

config({ path: ".env.local" });

if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_API_KEY) {
  process.env.STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: npx tsx scripts/stripe-cli.ts <comando stripe> [args...]");
  process.exit(1);
}

const result = spawnSync("stripe", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
