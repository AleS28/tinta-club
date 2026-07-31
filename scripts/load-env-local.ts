import { config } from "dotenv";
import { resolve } from "path";

/** Carga `.env.local` con soporte para claves multilínea (p. ej. FIREBASE_PRIVATE_KEY). */
export function loadEnvLocal(): void {
  config({ path: resolve(process.cwd(), ".env.local"), quiet: true });
}
