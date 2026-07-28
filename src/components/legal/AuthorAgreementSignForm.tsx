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
import { allBooks } from "@/data/mock";
import {
  formatUtcTimestamp,
  generateCertificateToken,
  generateSha256Hex,
} from "@/lib/certificate";
import {
  AUTHOR_TERMS_VERSION,
  getDefaultTermsAppId,
  recordAuthorSignature,
  TermsServiceError,
} from "@/lib/termsService";

interface CertificateData {
  token: string;
  hash: string;
  signedAtUtc: string;
  legalName: string;
  workTitle: string;
}

function resolveBookId(workTitle: string): string | undefined {
  const normalized = workTitle.trim().toLowerCase();
  return allBooks.find((book) => book.title.toLowerCase() === normalized)?.id;
}

export function AuthorAgreementSignForm() {
  const { user, userProfile } = useAuth();

  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [workTitle, setWorkTitle] = useState("Amor con aroma a café");
  const [signatureText, setSignatureText] = useState("");

  const [ownsRights, setOwnsRights] = useState(false);
  const [acceptsSplit, setAcceptsSplit] = useState(false);
  const [acceptsExclusivity, setAcceptsExclusivity] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (userProfile?.displayName && !legalName) {
      setLegalName(userProfile.displayName);
    }
  }, [user, userProfile, legalName]);

  const allClausesAccepted = ownsRights && acceptsSplit && acceptsExclusivity;

  const canSubmit = useMemo(() => {
    return (
      legalName.trim().length > 2 &&
      taxId.trim().length > 3 &&
      email.trim().includes("@") &&
      workTitle.trim().length > 1 &&
      signatureText.trim().length > 2 &&
      allClausesAccepted &&
      !loading &&
      !!user
    );
  }, [legalName, taxId, email, workTitle, signatureText, allClausesAccepted, loading, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !user) return;

    setError("");
    setLoading(true);

    try {
      const token = generateCertificateToken();
      const signedAtUtc = formatUtcTimestamp();
      const bookId = resolveBookId(workTitle);

      const hashPayload = JSON.stringify({
        certificateToken: token,
        legalName: legalName.trim(),
        taxId: taxId.trim(),
        email: email.trim(),
        workTitle: workTitle.trim(),
        signatureText: signatureText.trim(),
        termsVersion: AUTHOR_TERMS_VERSION,
        signedAtUtc,
        userId: user.uid,
      });

      const hash = await generateSha256Hex(hashPayload);
      const appId = getDefaultTermsAppId();

      await recordAuthorSignature(appId, user.uid, {
        termsVersion: AUTHOR_TERMS_VERSION,
        legalName: legalName.trim(),
        bookId,
        signatureHash: hash,
        subscriptionIntent: token,
      });

      setCertificate({
        token,
        hash,
        signedAtUtc,
        legalName: legalName.trim(),
        workTitle: workTitle.trim(),
      });
    } catch (err) {
      setError(
        err instanceof TermsServiceError
          ? err.message
          : "No se pudo emitir el certificado. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (certificate) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#D4A359]/40 bg-gradient-to-br from-[#2A1810] via-[#3B2519] to-[#2A1810] p-8 shadow-editorial-lg sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Firma validada
            </span>
            <h2 className="mt-3 font-serif text-2xl font-bold text-[#F5E6C8] sm:text-3xl">
              Certificado Digital Emitido
            </h2>
            <p className="mt-2 text-sm text-[#FCF9F5]/75">
              Acuerdo de Publicación firmado por{" "}
              <span className="font-medium text-[#FCF9F5]">{certificate.legalName}</span>
            </p>
          </div>
        </div>

        <dl className="mt-8 space-y-4 rounded-2xl border border-[#D27C5A]/20 bg-black/20 p-6 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
              Token de certificado
            </dt>
            <dd className="mt-1 font-mono text-base font-bold text-[#D4A359]">{certificate.token}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
              Obra registrada
            </dt>
            <dd className="mt-1 font-serif text-lg text-[#FCF9F5]">{certificate.workTitle}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
              Hash SHA-256
            </dt>
            <dd className="mt-1 break-all font-mono text-xs leading-relaxed text-[#FCF9F5]/85">
              {certificate.hash}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
              Marca de tiempo (UTC)
            </dt>
            <dd className="mt-1 font-mono text-[#FCF9F5]/90">{certificate.signedAtUtc}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#FCF9F5]/50">
              Versión del acuerdo
            </dt>
            <dd className="mt-1 text-[#FCF9F5]/90">{AUTHOR_TERMS_VERSION}</dd>
          </div>
        </dl>

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
              Completa tu información antes de publicar en el modelo 70/30 del Imperio.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#2A1810]">Nombre completo legal</span>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Pedro García Martínez"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#2A1810]">
              Documento de identidad / Tax ID / RFC
            </span>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="RFC, DNI o Tax ID"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#2A1810]">Correo electrónico registrado</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-[#2A1810]">Nombre de la obra</span>
            <input
              type="text"
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              placeholder="Amor con aroma a café"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#2A1810]">Cláusulas del acuerdo</h2>
        <p className="mt-1 text-sm text-muted">
          Debes aceptar todas las cláusulas para firmar digitalmente.{" "}
          <Link href="/acuerdo-autores" className="font-medium text-[#D27C5A] hover:underline">
            Leer acuerdo completo
          </Link>
        </p>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-[#FCF9F5] p-4">
            <input
              type="checkbox"
              checked={ownsRights}
              onChange={(e) => setOwnsRights(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#D27C5A]"
            />
            <span className="text-sm leading-relaxed text-[#2A1810]/90">
              Confirmo que poseo el 100% de la titularidad de los derechos de mi obra.
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
              Acepto el reparto del 70% de ganancias netas para el autor y 30% para la plataforma.
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
              Me comprometo a mantener los capítulos de pago libres de distribución gratuita pública.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-bold text-[#2A1810]">Firma tipográfica digital</h2>
        <p className="mt-1 text-sm text-muted">
          Escribe tu nombre tal como deseas que aparezca en el certificado de firma.
        </p>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-[#2A1810]">Nombre como firma</span>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            placeholder={legalName || "Tu nombre completo"}
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FCF9F5] px-4 py-3 text-sm outline-none transition-colors focus:border-[#D27C5A]"
            required
          />
        </label>

        <div className="mt-5 rounded-xl border border-dashed border-[#D27C5A]/40 bg-[#FCF9F5] px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Previsualización de firma
          </p>
          <p
            className="mt-4 font-serif text-3xl italic text-[#2A1810] sm:text-4xl"
            style={{ fontFamily: "var(--font-merriweather), Georgia, serif" }}
          >
            {signatureText.trim() || "Tu firma aparecerá aquí"}
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
            Emitiendo certificado…
          </>
        ) : (
          <>
            <BadgeCheck className="h-4 w-4" />
            Firmar acuerdo y emitir certificado
          </>
        )}
      </button>
    </form>
  );
}
