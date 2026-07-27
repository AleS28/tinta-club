/**
 * Volca los datos mock a Firestore.
 * Ejecutar: npm run seed:firestore
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, writeBatch } from "firebase/firestore";
import { allBooks, chapters, topAuthors } from "../src/data/mock";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
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
}

loadEnvLocal();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log("🌱 Sembrando Firestore...\n");

  let batch = writeBatch(db);
  let ops = 0;

  const commitIfNeeded = async (force = false) => {
    if (ops === 0) return;
    if (force || ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  for (const book of allBooks) {
    batch.set(doc(db, "books", book.id), book);
    ops++;
    await commitIfNeeded();
  }
  console.log(`  ✓ ${allBooks.length} libros`);

  for (const chapter of chapters) {
    batch.set(doc(db, "chapters", chapter.id), chapter);
    ops++;
    await commitIfNeeded();
  }
  console.log(`  ✓ ${chapters.length} capítulos`);

  for (const author of topAuthors) {
    batch.set(doc(db, "authors", author.id), author);
    ops++;
    await commitIfNeeded();
  }
  console.log(`  ✓ ${topAuthors.length} autores`);

  await commitIfNeeded(true);

  console.log("\n✅ Firestore listo. Colecciones: books, chapters, authors");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error al sembrar Firestore:", error);
  process.exit(1);
});
