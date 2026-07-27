import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const requiredFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfig = {
  ...requiredFirebaseConfig,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
    : {}),
};

const PLACEHOLDER_PATTERN = /your_|^$/i;

export const isFirebaseConfigured = Object.values(requiredFirebaseConfig).every(
  (value) => Boolean(value) && !PLACEHOLDER_PATTERN.test(String(value)),
);

function createFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

const app = createFirebaseApp();

let authInstance: Auth | null = null;

/** Inicializa Auth en el cliente con soporte optimizado para popups (Next.js). */
export function getClientAuth(): Auth | null {
  if (!app) return null;

  if (typeof window === "undefined") {
    return getAuth(app);
  }

  if (!authInstance) {
    try {
      authInstance = initializeAuth(app, {
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      authInstance = getAuth(app);
    }
  }

  return authInstance;
}

export const db: Firestore | null = app ? getFirestore(app) : null;
