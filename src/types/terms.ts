import type { Timestamp } from "firebase/firestore";

export type TermsUserType = "reader" | "author";

export interface TermsAcceptanceRecord {
  userId: string;
  userType: TermsUserType;
  termsVersion: string;
  acceptedAt: Timestamp;
  ipAddress?: string;
  subscriptionIntent?: string;
  bookId?: string;
  legalName?: string;
  documentId?: string;
  signatureHash?: string;
}

/** Payload para registrar aceptación (acceptedAt lo asigna Firestore en el servidor). */
export type TermsAcceptanceInput = Omit<TermsAcceptanceRecord, "userId" | "acceptedAt">;

export const READER_TERMS_VERSION = "v1.0-lectores-2026";
export const AUTHOR_TERMS_VERSION = "v1.0-autores-2026";

export const READER_TERMS_DOCUMENT_ID = "terminos-lectores";
export const AUTHOR_TERMS_DOCUMENT_ID = "acuerdo-autores";
