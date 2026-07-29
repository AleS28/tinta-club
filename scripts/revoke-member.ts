/**
 * Revoca la membresía premium y deja al usuario como lector.
 *
 * Uso:
 *   npm run revoke:member -- user@email.com
 *   npm run revoke:member -- --uid FIREBASE_UID
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { getAdminDb } from "../src/lib/firebase-admin";
import { resolveUserByEmailOrUid } from "../src/lib/admin-user-lookup";
import { deactivateSubscriptionAdmin } from "../src/lib/subscription-admin";

function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n");
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
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
      process.env[key] = value;
    }
  } catch {
    console.warn("⚠ No se encontró .env.local — usa variables de entorno del sistema.");
  }

  if (process.env.FIREBASE_PRIVATE_KEY) {
    process.env.FIREBASE_PRIVATE_KEY = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  }
}

async function main() {
  loadEnvLocal();

  const emailArg = process.argv[2];
  const uidArg = process.argv[3];

  if (!emailArg) {
    console.error("\nUso:");
    console.error("  npm run revoke:member -- user@email.com");
    console.error("  npm run revoke:member -- --uid FIREBASE_UID\n");
    process.exit(1);
  }

  const { uid, email } =
    emailArg === "--uid" && uidArg
      ? await resolveUserByEmailOrUid({ uid: uidArg })
      : await resolveUserByEmailOrUid({ email: emailArg });

  const adminDb = await getAdminDb();
  if (!adminDb) throw new Error("Firestore Admin no configurado");

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const before = userSnap.data() ?? {};
  const stripeSubId =
    typeof before.stripeSubscriptionId === "string" ? before.stripeSubscriptionId : null;

  console.log(`\n🔓 Revocando membresía…`);
  console.log(`   UID:   ${uid}`);
  console.log(`   Email: ${email}\n`);

  await deactivateSubscriptionAdmin(uid);

  await adminDb.collection("users").doc(uid).set(
    {
      role: "reader",
      subscriptionStatus: "free",
      isPremium: false,
      isSubscriber: false,
    },
    { merge: true },
  );

  console.log("✅ Usuario dejado como lector sin premium.");
  console.log("   Firestore: isPremium/isSubscriber → false, role → reader");
  console.log("   Auth: custom claims premium → false\n");

  if (stripeSubId) {
    console.log("⚠️  Esta cuenta tenía suscripción en Stripe:");
    console.log(`   ${stripeSubId}`);
    console.log("   Cancela también en Stripe Dashboard si quieres probar un pago nuevo.\n");
  }

  console.log("👉 La usuaria debe cerrar sesión e iniciar de nuevo para ver el cambio.\n");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
