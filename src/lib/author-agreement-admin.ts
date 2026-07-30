import { createHash } from "crypto";
import type { AuthorAgreementData } from "@/types/author-agreement";
import { buildAuthorAgreementHash } from "@/types/author-agreement";
import { AUTHOR_TERMS_DOCUMENT_ID, AUTHOR_TERMS_VERSION } from "@/types/terms";
import { getAdminDb } from "@/lib/firebase-admin";

export interface SignAuthorAgreementResult {
  signed: boolean;
  alreadySigned?: boolean;
  agreementSignedAt: string;
  agreementHash: string;
  agreementVersion: string;
}

function formatUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

function generateAgreementHashHex(
  userId: string,
  legalIdNumber: string,
  signedAtUtc: string,
): string {
  const payload = buildAuthorAgreementHash(userId, legalIdNumber, signedAtUtc, AUTHOR_TERMS_VERSION);
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

export function validateAuthorAgreementInput(data: AuthorAgreementData): void {
  if (data.legalFullName.trim().length < 3) {
    throw new Error("El nombre legal debe tener al menos 3 caracteres.");
  }
  if (data.legalIdNumber.trim().length < 4) {
    throw new Error("El documento de identidad debe tener al menos 4 caracteres.");
  }
  if (!data.contactPhone.trim()) {
    throw new Error("El teléfono de contacto es obligatorio.");
  }
  if (!data.paymentDetails.trim()) {
    throw new Error("Los datos de pago son obligatorios.");
  }
  if (data.signatureName.trim().length < 3) {
    throw new Error("La firma tipográfica debe tener al menos 3 caracteres.");
  }
}

export async function signAuthorAgreementAdmin(
  uid: string,
  email: string,
  data: AuthorAgreementData,
): Promise<SignAuthorAgreementResult> {
  validateAuthorAgreementInput(data);

  const adminDb = await getAdminDb();
  if (!adminDb) {
    throw new Error("Firestore Admin no configurado");
  }

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const existing = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;

  if (existing?.agreementSigned === true && existing?.agreementVersion === AUTHOR_TERMS_VERSION) {
    return {
      signed: false,
      alreadySigned: true,
      agreementSignedAt: String(existing.agreementSignedAt ?? ""),
      agreementHash: String(existing.agreementHash ?? ""),
      agreementVersion: String(existing.agreementVersion ?? AUTHOR_TERMS_VERSION),
    };
  }

  const signedAtUtc = formatUtcTimestamp();
  const agreementHash = generateAgreementHashHex(uid, data.legalIdNumber, signedAtUtc);

  const agreementPayload = {
    uid,
    email,
    legalFullName: data.legalFullName.trim(),
    legalIdNumber: data.legalIdNumber.trim(),
    contactPhone: data.contactPhone.trim(),
    paymentDetails: data.paymentDetails.trim(),
    agreementSigned: true,
    agreementSignedAt: signedAtUtc,
    agreementSignatureName: data.signatureName.trim(),
    agreementVersion: AUTHOR_TERMS_VERSION,
    agreementHash,
  };

  await userRef.set(agreementPayload, { merge: true });

  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (appId) {
    await adminDb
      .collection("artifacts")
      .doc(appId)
      .collection("users")
      .doc(uid)
      .collection("legal_agreements")
      .add({
        userId: uid,
        userType: "author",
        termsVersion: AUTHOR_TERMS_VERSION,
        documentId: AUTHOR_TERMS_DOCUMENT_ID,
        legalName: data.legalFullName.trim(),
        legalIdNumber: data.legalIdNumber.trim(),
        contactPhone: data.contactPhone.trim(),
        paymentDetails: data.paymentDetails.trim(),
        signatureName: data.signatureName.trim(),
        signatureHash: agreementHash,
        acceptedAt: new Date().toISOString(),
        scope: "account",
      });
  }

  return {
    signed: true,
    agreementSignedAt: signedAtUtc,
    agreementHash,
    agreementVersion: AUTHOR_TERMS_VERSION,
  };
}
