/**
 * Vincula todos los autores fundadores definidos en founder-authors.ts.
 *
 * Uso:
 *   npm run link:founders
 *   npm run link:founders -- pedro-garcia-martinez will-flechas
 */
import { loadEnvLocal } from "./load-env-local";
import { linkAllFounderAuthors } from "../src/lib/link-all-founders-admin";

async function main() {
  loadEnvLocal();

  const slugs = process.argv.slice(2).filter(Boolean);
  console.log("\n🔗 Vinculando autores fundadores…\n");

  const results = await linkAllFounderAuthors(slugs.length > 0 ? slugs : undefined);

  let hadError = false;
  for (const result of results) {
    if (result.linked) {
      console.log(`✅ ${result.slug}`);
      console.log(`   Email: ${result.email}`);
      console.log(`   UID:   ${result.uid ?? "—"}`);
      if (result.reason === "already_linked") {
        console.log("   (ya estaba vinculado)");
      }
    } else {
      hadError = true;
      console.log(`❌ ${result.slug}`);
      console.log(`   Email: ${result.email || "—"}`);
      console.log(`   Motivo: ${result.reason ?? "desconocido"}`);
    }
    console.log("");
  }

  if (hadError) process.exit(1);
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
