/**
 * Vincula manualmente una cuenta como administradora del sitio.
 *
 * Uso:
 *   npm run link:admin -- yhineth.alexandra.01@gmail.com
 *   npm run link:admin -- --uid FIREBASE_UID
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { isSiteAdminEmail } from "../src/data/site-admins";
import { linkSiteAdminAdmin } from "../src/lib/site-admin-link-admin";
import { getAdminAuth } from "../src/lib/firebase-admin";

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
      const value = trimmed.slice(eqIndex + 1).trim();
      process.env[key] = value;
    }
  } catch {
    console.warn("⚠ No se encontró .env.local — usa variables de entorno del sistema.");
  }
}

async function resolveUid(emailOrUidFlag: string, value: string): Promise<{ uid: string; email: string }> {
  const adminAuth = await getAdminAuth();
  if (!adminAuth) throw new Error("Firebase Admin no configurado");

  if (emailOrUidFlag === "--uid") {
    const user = await adminAuth.getUser(value);
    if (!user.email) throw new Error(`El UID ${value} no tiene email asociado`);
    return { uid: user.uid, email: user.email };
  }

  try {
    const user = await adminAuth.getUserByEmail(emailOrUidFlag);
    return { uid: user.uid, email: user.email ?? emailOrUidFlag };
  } catch {
    throw new Error(`No existe cuenta Firebase con email: ${emailOrUidFlag}`);
  }
}

async function main() {
  loadEnvLocal();

  const [, , emailOrUidFlag, uidValue] = process.argv;

  if (!emailOrUidFlag) {
    console.error("\nUso:");
    console.error("  npm run link:admin -- yhineth.alexandra.01@gmail.com");
    console.error("  npm run link:admin -- --uid FIREBASE_UID\n");
    process.exit(1);
  }

  const emailArg = emailOrUidFlag === "--uid" ? uidValue : emailOrUidFlag;
  if (!emailArg) {
    console.error("❌ Falta el email o UID.");
    process.exit(1);
  }

  const { uid, email } = await resolveUid(emailOrUidFlag, emailArg);

  if (!isSiteAdminEmail(email)) {
    console.error(`❌ ${email} no está en SITE_ADMIN_EMAILS.`);
    console.error("   Añádelo en .env.local y vuelve a intentar.\n");
    process.exit(1);
  }

  console.log(`\n🔗 Vinculando administradora…`);
  console.log(`   UID:   ${uid}`);
  console.log(`   Email: ${email}\n`);

  const result = await linkSiteAdminAdmin(uid, email);

  if (result.linked) {
    console.log("✅ Cuenta vinculada como administradora.");
    console.log("   Acceso premium total y panel en /autor\n");
  } else if (result.reason === "already_linked") {
    console.log("ℹ️  Esta cuenta ya era administradora.\n");
  } else {
    console.error(`❌ No se pudo vincular: ${result.reason ?? "error desconocido"}`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
