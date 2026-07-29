/**
 * Vincula manualmente un autor fundador a su cuenta Firebase.
 *
 * Uso:
 *   npm run link:founder -- pedro-garcia-martinez user@email.com
 *   npm run link:founder -- pedro-garcia-martinez --uid FIREBASE_UID
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { findFounderBySlug } from "../src/data/founder-authors";
import { linkFounderAuthorAdmin } from "../src/lib/founder-author-link-admin";
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
  if (emailOrUidFlag === "--uid") {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) throw new Error("Firebase Admin no configurado");

    const user = await adminAuth.getUser(value);
    if (!user.email) throw new Error(`El UID ${value} no tiene email asociado`);
    return { uid: user.uid, email: user.email };
  }

  const adminAuth = await getAdminAuth();
  if (!adminAuth) throw new Error("Firebase Admin no configurado");

  try {
    const user = await adminAuth.getUserByEmail(value);
    return { uid: user.uid, email: user.email ?? value };
  } catch {
    throw new Error(`No existe cuenta Firebase con email: ${value}`);
  }
}

async function main() {
  loadEnvLocal();

  const [, , slug, emailOrUidFlag, value] = process.argv;

  if (!slug || !emailOrUidFlag) {
    console.error("\nUso:");
    console.error("  npm run link:founder -- pedro-garcia-martinez user@email.com");
    console.error("  npm run link:founder -- pedro-garcia-martinez --uid FIREBASE_UID\n");
    process.exit(1);
  }

  const founder = findFounderBySlug(slug);
  if (!founder) {
    console.error(`❌ Autor fundador no encontrado: ${slug}`);
    process.exit(1);
  }

  const emailArg = emailOrUidFlag === "--uid" ? value : emailOrUidFlag;
  const { uid, email } = await resolveUid(emailOrUidFlag, emailArg);

  console.log(`\n🔗 Vinculando ${founder.name}…`);
  console.log(`   UID:   ${uid}`);
  console.log(`   Email: ${email}`);
  console.log(`   Libros: ${founder.bookIds.join(", ")}\n`);

  const result = await linkFounderAuthorAdmin(uid, email, founder);

  if (result.linked) {
    console.log("✅ Autor fundador vinculado correctamente.");
    console.log(`   Perfil público: /autor/${founder.slug}`);
    console.log(`   Panel: /autor\n`);
  } else if (result.reason === "already_linked") {
    console.log("ℹ️  Esta cuenta ya estaba vinculada como autor fundador.\n");
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
