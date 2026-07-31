/**
 * Cierra el mes anterior y consolida ganancias de autores.
 * Ejecutar: npm run close:month
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { closeMonthAndConsolidate } from "../src/lib/monetization/earnings-service";
import { getPreviousMonthYear } from "../src/lib/monetization/month-year";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\n/g, "\n");
  }
}

async function main() {
  loadEnvLocal();

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

  privateKey = privateKey.replace(/\\n/g, "\n");

  if (!getApps().length && projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  const monthYear = process.argv[2] ?? getPreviousMonthYear();
  const result = await closeMonthAndConsolidate(monthYear);

  console.log(`✓ Mes ${monthYear} cerrado`);
  console.log(`  Autores procesados: ${result.authorsProcessed}`);
  console.log(`  Ya cerrado: ${result.alreadyClosed ? "sí" : "no"}`);
  console.log(`  Tiempo pool: ${result.pool.totalPlatformReadingSeconds}s`);
  console.log(`  Valor/segundo: ${result.pool.valuePerSecond}`);
  console.log(`  Pool distribuido: ${result.pool.totalPoolDistributed ?? 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
