import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let adminApp: App | null = null;
let adminInitFailed = false;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  key = key.replace(/\\n/g, "\n").replace(/\r/g, "");

  if (!key.includes("\n") && key.includes("-----BEGIN PRIVATE KEY-----")) {
    key = key
      .replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n")
      .replace(/\s*-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----\n");
  }

  if (!key.endsWith("\n")) key += "\n";

  return key;
}

function readServiceAccountFromFile(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    resolve(process.cwd(), "firebase-service-account.json"),
    resolve(process.cwd(), "serviceAccountKey.json"),
  ].filter(Boolean) as string[];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;

    try {
      const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };

      if (!parsed.project_id || !parsed.client_email || !parsed.private_key) continue;

      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: normalizePrivateKey(parsed.private_key) ?? parsed.private_key,
      };
    } catch {
      continue;
    }
  }

  return null;
}

async function initAdminApp(): Promise<App | null> {
  if (adminInitFailed) return null;
  if (adminApp) return adminApp;

  try {
    const { cert, getApps, initializeApp, applicationDefault } = await import("firebase-admin/app");

    if (getApps().length > 0) {
      adminApp = getApps()[0]!;
      return adminApp;
    }

    const fromFile = readServiceAccountFromFile();
    const fromEnvJson = readServiceAccountFromEnv();
    const serviceAccount = fromFile ?? fromEnvJson;

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert({
          projectId: serviceAccount.projectId,
          clientEmail: serviceAccount.clientEmail,
          privateKey: serviceAccount.privateKey,
        }),
      });
      return adminApp;
    }

    const projectId =
      process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (projectId && clientEmail && privateKey) {
      try {
        adminApp = initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });
        return adminApp;
      } catch (certError) {
        console.error("[firebase-admin] cert() falló, probando ADC…", certError);
      }
    }

    adminApp = initializeApp({
      credential: applicationDefault(),
      projectId:
        process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return adminApp;
  } catch (error) {
    adminInitFailed = true;
    console.error("[firebase-admin] Error al inicializar:", error);
    return null;
  }
}

function readServiceAccountFromEnv(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!inlineJson) return null;

  try {
    const parsed = JSON.parse(inlineJson) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };

    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key) ?? parsed.private_key,
    };
  } catch {
    return null;
  }
}

export async function getAdminAuth(): Promise<Auth | null> {
  if (adminAuthInstance) return adminAuthInstance;

  try {
    const app = await initAdminApp();
    if (!app) return null;

    const { getAuth } = await import("firebase-admin/auth");
    adminAuthInstance = getAuth(app);
    return adminAuthInstance;
  } catch (error) {
    console.error("[firebase-admin] getAdminAuth:", error);
    return null;
  }
}

export async function getAdminDb(): Promise<Firestore | null> {
  if (adminDbInstance) return adminDbInstance;

  try {
    const app = await initAdminApp();
    if (!app) return null;

    const { getFirestore } = await import("firebase-admin/firestore");
    adminDbInstance = getFirestore(app);
    return adminDbInstance;
  } catch (error) {
    console.error("[firebase-admin] getAdminDb:", error);
    return null;
  }
}

export async function isAdminConfigured(): Promise<boolean> {
  return (await initAdminApp()) !== null;
}

export async function probeAdminServices(): Promise<{
  auth: boolean;
  firestore: boolean;
}> {
  const result = { auth: false, firestore: false };

  try {
    const auth = await getAdminAuth();
    result.auth = auth !== null;
  } catch {
    result.auth = false;
  }

  try {
    const db = await getAdminDb();
    if (db) {
      await db.collection("users").limit(1).get();
      result.firestore = true;
    }
  } catch (error) {
    console.error("[firebase-admin] probe firestore:", error);
    result.firestore = false;
  }

  return result;
}

interface VerifiedToken {
  uid: string;
  email?: string;
  premium?: boolean;
  subscriptionStatus?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedToken | null> {
  try {
    const adminAuth = await getAdminAuth();

    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        return {
          uid: decoded.uid,
          email: decoded.email,
          premium: decoded.premium === true,
          subscriptionStatus:
            typeof decoded.subscriptionStatus === "string"
              ? decoded.subscriptionStatus
              : undefined,
        };
      } catch (error) {
        console.error("[firebase-admin] verifyIdToken:", error);
      }
    }
  } catch (error) {
    console.error("[firebase-admin] verifyFirebaseIdToken:", error);
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      users?: Array<{ localId: string; email?: string }>;
    };

    const user = data.users?.[0];
    if (!user) return null;

    return { uid: user.localId, email: user.email };
  } catch (error) {
    console.error("[firebase-admin] REST token lookup:", error);
    return null;
  }
}
