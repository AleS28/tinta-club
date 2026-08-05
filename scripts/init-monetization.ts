/**
 * Inicializa colecciones de monetización en Firestore.
 * Ejecutar: npm run init:monetization
 *
 * Colecciones:
 * - reading_sessions
 * - direct_chapter_sales
 * - monthly_pools
 * - author_earnings_summary
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getCurrentMonthYear } from "../src/lib/monetization/month-year";
import { COLLECTIONS } from "../src/lib/monetization/constants";

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

  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan credenciales FIREBASE_* en .env.local");
  }

  const app =
    getApps().length > 0
      ? getApps()[0]!
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });

  const db = getFirestore(app);
  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();

  await db.collection(COLLECTIONS.monthlyPools).doc(monthYear).set(
    {
      monthYear,
      subscriptionGross: 0,
      subscriptionGatewayFees: 0,
      subscriptionNet: 0,
      totalSubscriptionRevenue: 0,
      authorsPool70: 0,
      platformPool30: 0,
      totalPlatformReadingSeconds: 0,
      valuePerSecond: 0,
      totalPlatformPremiumViews: 0,
      valuePerView: 0,
      status: "open",
      updatedAt: now,
    },
    { merge: true },
  );

  console.log(`✓ Pool mensual inicializado: ${monthYear}`);
  console.log("Colecciones listas:");
  console.log(`  - ${COLLECTIONS.readingSessions}`);
  console.log(`  - ${COLLECTIONS.directChapterSales}`);
  console.log(`  - ${COLLECTIONS.monthlyPools}`);
  console.log(`  - ${COLLECTIONS.paymentProcessedEvents}`);
  console.log(`  - ${COLLECTIONS.chapterPurchases}`);
  console.log(`  - ${COLLECTIONS.bookPurchases}`);
  console.log(`  - ${COLLECTIONS.directBookSales}`);
  console.log("\nPublica firestore.rules en Firebase Console.");
  console.log("Cron de cierre: POST /api/cron/close-month (header x-admin-secret)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
