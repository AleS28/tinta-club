import type { App } from "firebase-admin/app";

let adminApp: App | null = null;
let adminInitFailed = false;

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

async function initAdminApp(): Promise<App | null> {
  if (adminInitFailed) return null;
  if (adminApp) return adminApp;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  try {
    const { cert, getApps, initializeApp } = await import("firebase-admin/app");

    if (getApps().length > 0) {
      adminApp = getApps()[0]!;
      return adminApp;
    }

    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

    return adminApp;
  } catch (error) {
    adminInitFailed = true;
    console.error("[firebase-admin] Error al inicializar:", error);
    return null;
  }
}

export async function getAdminAuth() {
  const app = await initAdminApp();
  if (!app) return null;
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(app);
}

export async function getAdminDb() {
  const app = await initAdminApp();
  if (!app) return null;
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore(app);
}

export async function isAdminConfigured(): Promise<boolean> {
  return (await initAdminApp()) !== null;
}

interface VerifiedToken {
  uid: string;
  email?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedToken | null> {
  const adminAuth = await getAdminAuth();

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      return { uid: decoded.uid, email: decoded.email };
    } catch (error) {
      console.error("[firebase-admin] verifyIdToken:", error);
    }
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
