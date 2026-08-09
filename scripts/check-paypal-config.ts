import { config } from "dotenv";
import { resolve } from "path";
import {
  getPayPalConfigStatus,
  testPayPalConnection,
} from "../src/lib/paypal";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const status = getPayPalConfigStatus();

  console.log("\n=== PayPal — diagnóstico ===\n");
  console.log(`Modo:              ${status.mode}`);
  console.log(`API configurada:   ${status.configured ? "sí" : "no"}`);
  console.log(`Cliente público:   ${status.clientEnabled ? "sí" : "no"}`);
  console.log(`Webhook ID:        ${status.hasWebhookId ? "sí" : "no"}`);
  console.log(`APP URL:           ${status.appBaseUrl}`);
  console.log(`Listo producción:  ${status.readyForProduction ? "sí" : "no"}`);

  if (status.missing.length > 0) {
    console.log(`\nFaltan variables: ${status.missing.join(", ")}`);
  }

  console.log(`\nWebhook URL: ${status.appBaseUrl}/api/paypal/webhook`);
  console.log(`Return URL:  ${status.appBaseUrl}/api/paypal/return`);

  if (status.configured) {
    const connection = await testPayPalConnection();
    console.log(`\nOAuth PayPal: ${connection.ok ? "OK" : `FALLÓ — ${connection.error}`}`);
  }

  console.log("");
  process.exit(status.configured && status.clientEnabled ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
