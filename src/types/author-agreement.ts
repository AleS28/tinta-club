import { AUTHOR_TERMS_VERSION } from "@/types/terms";

/** Datos legales del acuerdo de autor a nivel de cuenta (todas las obras). */
export interface AuthorAgreementData {
  legalFullName: string;
  legalIdNumber: string;
  contactPhone: string;
  paymentDetails: string;
  signatureName: string;
}

export interface AuthorAgreementRecord extends AuthorAgreementData {
  agreementSigned: boolean;
  agreementSignedAt: string;
  agreementVersion: string;
  agreementHash: string;
}

export function buildAuthorAgreementHash(
  userId: string,
  legalIdNumber: string,
  signedAtUtc: string,
  agreementVersion: string = AUTHOR_TERMS_VERSION,
): string {
  return `${userId}${legalIdNumber.trim()}${signedAtUtc}${agreementVersion}`;
}
