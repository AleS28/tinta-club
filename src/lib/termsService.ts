import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, getClientAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  AUTHOR_TERMS_DOCUMENT_ID,
  AUTHOR_TERMS_VERSION,
  READER_TERMS_DOCUMENT_ID,
  READER_TERMS_VERSION,
  type TermsAcceptanceInput,
  type TermsUserType,
} from "@/types/terms";

export {
  AUTHOR_TERMS_DOCUMENT_ID,
  AUTHOR_TERMS_VERSION,
  READER_TERMS_DOCUMENT_ID,
  READER_TERMS_VERSION,
};

export class TermsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TermsServiceError";
  }
}

function assertFirestoreReady(): void {
  if (!isFirebaseConfigured || !db) {
    throw new TermsServiceError(
      "Firestore no está configurado. Revisa las variables NEXT_PUBLIC_FIREBASE_* en tu entorno.",
    );
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (!value?.trim()) {
    throw new TermsServiceError(`El campo "${fieldName}" es obligatorio.`);
  }
}

function assertAuthenticatedUser(userId: string): void {
  const auth = getClientAuth();
  const currentUser = auth?.currentUser;

  if (!currentUser) {
    throw new TermsServiceError(
      "Debes iniciar sesión para registrar la aceptación de términos legales.",
    );
  }

  if (currentUser.uid !== userId) {
    throw new TermsServiceError(
      "No puedes registrar aceptaciones legales en nombre de otra cuenta de usuario.",
    );
  }
}

function legalAgreementsCollection(appId: string, userId: string) {
  assertFirestoreReady();
  return collection(db!, "artifacts", appId, "users", userId, "legal_agreements");
}

function validateAcceptanceInput(data: TermsAcceptanceInput, expectedUserType: TermsUserType): void {
  assertNonEmpty(data.termsVersion, "termsVersion");
  assertNonEmpty(data.userType, "userType");

  if (data.userType !== expectedUserType) {
    throw new TermsServiceError(
      `El tipo de usuario debe ser "${expectedUserType}" para este registro legal.`,
    );
  }
}

function stripUndefined<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

/**
 * Registra una aceptación legal de forma append-only (inmutable).
 * Ruta: /artifacts/{appId}/users/{userId}/legal_agreements/{autoId}
 */
async function appendLegalAgreement(
  appId: string,
  userId: string,
  data: TermsAcceptanceInput,
): Promise<string> {
  assertNonEmpty(appId, "appId");
  assertNonEmpty(userId, "userId");
  assertAuthenticatedUser(userId);

  const agreementsRef = legalAgreementsCollection(appId, userId);

  const payload = stripUndefined({
    userId,
    userType: data.userType,
    termsVersion: data.termsVersion.trim(),
    acceptedAt: serverTimestamp(),
    ipAddress: data.ipAddress?.trim(),
    subscriptionIntent: data.subscriptionIntent?.trim(),
    bookId: data.bookId?.trim(),
    legalName: data.legalName?.trim(),
    documentId: data.documentId?.trim(),
    signatureHash: data.signatureHash?.trim(),
  });

  const docRef = await addDoc(agreementsRef, payload);
  return docRef.id;
}

/**
 * Registra la aceptación de Términos para Lectores y Suscriptores.
 */
export async function recordReaderTermsAcceptance(
  appId: string,
  userId: string,
  data: Omit<TermsAcceptanceInput, "userType">,
): Promise<string> {
  try {
    const record: TermsAcceptanceInput = {
      ...data,
      userType: "reader",
      termsVersion: data.termsVersion ?? READER_TERMS_VERSION,
      documentId: data.documentId ?? READER_TERMS_DOCUMENT_ID,
    };

    validateAcceptanceInput(record, "reader");
    return await appendLegalAgreement(appId, userId, record);
  } catch (error) {
    if (error instanceof TermsServiceError) throw error;

    console.error("[termsService] recordReaderTermsAcceptance:", error);
    throw new TermsServiceError(
      "No se pudo registrar la aceptación de términos para lectores. Intenta de nuevo.",
    );
  }
}

/**
 * Registra la firma / aceptación del Acuerdo de Publicación para Autores.
 */
export async function recordAuthorSignature(
  appId: string,
  userId: string,
  data: Omit<TermsAcceptanceInput, "userType">,
): Promise<string> {
  try {
    const record: TermsAcceptanceInput = {
      ...data,
      userType: "author",
      termsVersion: data.termsVersion ?? AUTHOR_TERMS_VERSION,
      documentId: data.documentId ?? AUTHOR_TERMS_DOCUMENT_ID,
    };

    validateAcceptanceInput(record, "author");
    return await appendLegalAgreement(appId, userId, record);
  } catch (error) {
    if (error instanceof TermsServiceError) throw error;

    console.error("[termsService] recordAuthorSignature:", error);
    throw new TermsServiceError(
      "No se pudo registrar la firma del acuerdo de autor. Intenta de nuevo.",
    );
  }
}

/**
 * Comprueba si el usuario ya aceptó la versión de términos indicada.
 */
export async function hasUserAcceptedLatestTerms(
  appId: string,
  userId: string,
  termsVersion: string,
): Promise<boolean> {
  try {
    assertNonEmpty(appId, "appId");
    assertNonEmpty(userId, "userId");
    assertNonEmpty(termsVersion, "termsVersion");
    assertAuthenticatedUser(userId);

    const agreementsRef = legalAgreementsCollection(appId, userId);
    const snapshot = await getDocs(
      query(agreementsRef, where("termsVersion", "==", termsVersion.trim()), limit(1)),
    );

    return !snapshot.empty;
  } catch (error) {
    if (error instanceof TermsServiceError) throw error;

    console.error("[termsService] hasUserAcceptedLatestTerms:", error);
    throw new TermsServiceError(
      "No se pudo verificar la aceptación de términos legales. Intenta de nuevo.",
    );
  }
}

/** ID de aplicación por defecto (Firebase App ID del proyecto). */
export function getDefaultTermsAppId(): string {
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (!appId) {
    throw new TermsServiceError(
      "NEXT_PUBLIC_FIREBASE_APP_ID no está configurado para registrar acuerdos legales.",
    );
  }
  return appId;
}
