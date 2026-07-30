"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AUTHOR_TERMS_VERSION } from "@/types/terms";
import { hasAuthorAgreementSigned } from "@/types/user";

interface CertificateData {
  hash: string;
  signedAtUtc: string;
  legalName: string;
  signatureName: string;
}

function AgreementSummary() {
  return (
    <div className="rounded-xl border border-[#D27C5A]/20 bg-[#FCF9F5] p-5 text-sm leading-relaxed text-[#2A1810]/90">
      <p className="font-semibold text-[#2A1810]">
        Acuerdo General de Distribución y Monetización para Autores
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Licencia no exclusiva mundial</strong> a la plataforma para alojar, formatear,
          promocionar y monetizar tus obras dentro del Imperio de la Tinta.
        </li>
        <li>
          <strong>Titularidad:</strong> conservas el 100% de los derechos de autor sobre todo el
          contenido que publiques en tu cuenta.
        </li>
        <li>
          <strong>Muestra gratuita:</strong> puedes ofrecer capítulos de muestra sin suscripción.
        </li>
        <li>
          <strong>Monetización 70/30:</strong> sobre ganancias netas atribuibles a tu contenido de
          pago, recibes el 70% como autor y la plataforma retiene el 30%.
        </li>
        <li>
          <strong>Exclusividad premium:</strong> los capítulos marcados como premium no deben
          publicarse gratis en otras plataformas mientras estén activos aquí.
        </li>
        <li>
          Este acuerdo aplica a <strong>todas tus obras presentes y futuras</strong> en esta cuenta
          de autor.
        </li>
      </ul>
      <p className="mt-4 text-xs text-muted">
        Versión {AUTHOR_TERMS_VERSION}.{" "}
        <Link href="/acuerdo-autores" className="font-medium text-[#D27C5A] hover:underline">
          Leer acuerdo completo
        </Link>
      </p>
    </div>
  );
}

export function AuthorAgreementSignForm() {
  const { user, userProfile, refreshUserProfile } = useAuth();

  const [legalFullName, setLegalFullName] = useState("");
  const [legalIdNumber, setLegalIdNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const [ownsRights, setOwnsRights] = useState(false);
  const [acceptsSplit, setAcceptsSplit] = useState(false);
  const [acceptsExclusivity, setAcceptsExclusivity] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  const alreadySigned = hasAuthorAgreementSigned(userProfile);

  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.legalFullName) setLegalFullName(userProfile.legalFullName);
    if (userProfile.displayName && !legalFullName) setLegalFullName(userProfile.displayName);
    if (userProfile.legalIdNumber) setLegalIdNumber(userProfile.legalIdNumber);
    if (userProfile.contactPhone) setContactPhone(userProfile.contactPhone);
    if (userProfile.paymentDetails) setPaymentDetails(userProfile.paymentDetails);
    if (userProfile.agreementSignatureName) setSignatureName(userProfile.agreementSignatureName);
  }, [userProfile, legalFullName]);

  useEffect(() => {
    if (alreadySigned && userProfile?.agreementHash && userProfile.agreementSignedAt) {
      setCertificate({
        hash: userProfile.agreementHash,
        signedAtUtc: userProfile.agreementSignedAt,
        legalName: userProfile.legalFullName ?? userProfile.displayName,
        signatureName: userProfile.agreementSignatureName ?? userProfile.legalFullName ?? "",
      });
    }
  }, [alreadySigned, userProfile]);

  const allClausesAccepted = ownsRights && acceptsSplit && acceptsExclusivity;

  const canSubmit = useMemo(() => {
    return (
      legalFullName.trim().length > 2 &&
      legalIdNumber.trim().length > 3 &&
      contactPhone.trim().length > 0 &&
      paymentDetails.trim().length > 0 &&
      signatureName.trim().length > 2 &&
      allClausesAccepted &&
      !loading &&
      !!user &&
      !alreadySigned
    );
  }, [
    legalFullName,
    legalIdNumber,
    contactPhone,
    paymentDetails,
    signatureName,
    allClausesAccepted,
    loading,
    user,
    alreadySigned,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !user) return;

    setError("");
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/author/agreement/sign", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legalFullName: legalFullName.trim(),
          legalIdNumber: legalIdNumber.trim(),
          contactPhone: contactPhone.trim(),
          paymentDetails: paymentDetails.trim(),
          signatureName: signatureName.trim(),
          ownsRights,
          acceptsSplit,
          acceptsExclusivity,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        agreementHash?: string;
        agreementSignedAt?: string;
        signed?: boolean;
        alreadySigned?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo firmar el acuerdo.");
      }

      await refreshUserProfile();

      setCertificate({
        hash: payload.agreementHash ?? "",
        signedAtUtc: payload.agreementSignedAt ?? "",
        legalName: legalFullName.trim(),
        signatureName: signatureName.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo emitir el certificado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (certificate || alreadySigned) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#D4A359]/40 bg-gradient-to-br from-[#2A1810] via-[#3B2519] to-[#2A1810] p-8 shadow-editorial-lg sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Acuerdo de cuenta activo
            </span>
            <h2 className="mt-3 font-serif text-2xl font-bold text-[#F5E6C8] sm:text-3xl">
              Firma digital registrada
            </h2>
            <p className="mt-2 text-sm text-[#FCF9F5]/75">
              Tu acuerdo cubre todas las obras de esta cuenta. Ya puedes publicar capítulos premium.
            </p>
          </div>
        </div>

        {certificate && (
          <dl className="mt-8 space-y-4 rounded-2xl border border-[#D27C5A]/20 bg-black/20 p-6 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
                Autor
              </dt>
              <dd className="mt-1 font-serif text-lg text-[#FCF9F5]">{certificate.legalName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
                Firma tipográfica
              </dt>
              <dd className="mt-1 font-serif italic text-[#FCF9F5]">{certificate.signatureName}</dd>
            </div>
            {certificate.hash && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
                  Hash SHA-256
                </dt>
                <dd className="mt-1 break-all font-mono text-xs leading-relaxed text-[#FCF9F5]/85">
                  {certificate.hash}
                </dd>
              </div>
            )}
            {certificate.signedAtUtc && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
                  Fecha (UTC)
                </dt>
                <dd className="mt-1 font-mono text-[#FCF9F5]/90">{certificate.signedAtUtc}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
                Versión
              </dt>
              <dd className="mt-1 text-[#FCF9F5]/90">{AUTHOR_TERMS_VERSION}</dd>
            </div>
          </dl>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/autor"
            className="inline-flex items-center justify-center rounded-full bg-[#D27C5A] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#c06a48]"
          >
            Ir al Panel del Autor
          </Link>
          <Link
            href="/acuerdo-autores"
            className="inline-flex items-center justify-center rounded-full border border-[#FCF9F5]/25 px-6 py-3 text-sm font-medium text-[#FCF9F5]/90 transition-colors hover:border-[#D27C5A]/50 hover:text-[#D27C5A]"
          >
            Ver acuerdo completo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D27C5A]/10 text-[#D27C5A]">
            <FileSignature className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2A1810]">Datos legales del autor</h2>
            <p className="mt-1 text-sm text-muted">
              Firma una sola vez. Este acuerdo aplica a todas tus obras presentes y futuras en esta
              cuenta.
            </p>
            {user?.email && (
              <p className="mt-2 text-xs text-muted">
                Cuenta: <span className="font-medium text-[#2A1810]">{user.email}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#2A1810]">Nombre completo legal</span>
            <input
              type="text"
              value={legalFullName}
              onChange={(e) => setLegalFullName(e.target.value)}
              placeholder="Nombre como aparece en tu identificación"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#2A1810]">
              Documento de identificación / Tax ID / RFC
            </span>
            <input
              type="text"
              value={legalIdNumber}
              onChange={(e) => setLegalIdNumber(e.target.value)}
              placeholder="RFC, DNI o Tax ID"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#2A1810]">Teléfono de contacto</span>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+52 55 1234 5678"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#2A1810]">
              Datos de pago / cuenta para recibir regalías
            </span>
            <textarea
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              rows={3}
              placeholder="Banco, CLABE, PayPal, titular de cuenta, etc."
              className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#2A1810]">Resumen del acuerdo</h2>
        <div className="mt-4">
          <AgreementSummary />
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#2A1810]">Cláusulas obligatorias</h2>
        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-[#FCF9F5] p-4">
            <input
              type="checkbox"
              checked={ownsRights}
              onChange={(e) => setOwnsRights(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#D27C5A]"
            />
            <span className="text-sm leading-relaxed text-[#2A1810]/90">
              <strong>Titularidad general:</strong> Confirmo que poseo el 100% de los derechos de
              autor de todas las obras y capítulos que publique en mi cuenta.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-[#FCF9F5] p-4">
            <input
              type="checkbox"
              checked={acceptsSplit}
              onChange={(e) => setAcceptsSplit(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#D27C5A]"
            />
            <span className="text-sm leading-relaxed text-[#2A1810]/90">
              <strong>Reparto 70/30:</strong> Acepto la distribución de ganancias (70% Autor / 30%
              Plataforma) sobre el contenido de pago.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-[#FCF9F5] p-4">
            <input
              type="checkbox"
              checked={acceptsExclusivity}
              onChange={(e) => setAcceptsExclusivity(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#D27C5A]"
            />
            <span className="text-sm leading-relaxed text-[#2A1810]/90">
              <strong>Exclusividad premium:</strong> Me comprometo a no publicar de forma gratuita
              en otros sitios los capítulos que configure como premium.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#2A1810]">Firma tipográfica digital</h2>
        <label className="mt-5 block">
          <span className="text-sm font-medium text-[#2A1810]">Nombre como firma</span>
          <input
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder={legalFullName || "Tu nombre completo"}
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
            required
          />
        </label>

        <div className="mt-5 rounded-xl border border-dashed border-[#D27C5A]/40 bg-[#FCF9F5] px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Previsualización de firma
          </p>
          <p className="mt-4 font-serif text-3xl italic text-[#2A1810] sm:text-4xl">
            {signatureName.trim() || "Tu firma aparecerá aquí"}
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D27C5A] py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-[#c06a48] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Registrando firma…
          </>
        ) : (
          <>
            <BadgeCheck className="h-4 w-4" />
            Firmar y confirmar acuerdo
          </>
        )}
      </button>
    </form>
  );
}
