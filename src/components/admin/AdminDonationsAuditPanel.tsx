"use client";

import type { GlobalFinancialReport } from "@/types/admin-financial";

interface AdminDonationsAuditPanelProps {
  report: GlobalFinancialReport;
}

export function AdminDonationsAuditPanel({ report }: AdminDonationsAuditPanelProps) {
  return (
    <section className="rounded-2xl border border-sidebar bg-white/80 p-6 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-ink">Auditoría de donaciones</h2>
      <p className="mt-1 text-sm text-muted">
        Reparto 70% autor / 30% plataforma sobre el neto post-PayPal.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Bruto" value={report.donationsGross} />
        <Stat label="Comisiones PayPal" value={report.donationsGatewayFees} negative />
        <Stat label="Neto" value={report.donationsNet} />
        <Stat label="Plataforma 30%" value={report.donationsPlatformShare} />
        <Stat label="Autores 70%" value={report.donationsAuthorShare} highlight />
      </div>

      {report.donationsAudit.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No hay donaciones registradas en este periodo.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sidebar text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Donante</th>
                <th className="px-3 py-2">Autor</th>
                <th className="px-3 py-2">Bruto</th>
                <th className="px-3 py-2">Plataforma 30%</th>
                <th className="px-3 py-2">Autor 70%</th>
              </tr>
            </thead>
            <tbody>
              {report.donationsAudit.map((row) => (
                <tr key={row.id} className="border-b border-sidebar/60">
                  <td className="px-3 py-3 text-muted">
                    {new Date(row.createdAt).toLocaleDateString("es")}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{row.donorDisplayName}</p>
                    <p className="text-xs text-muted">{row.donorUserId}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{row.authorName}</p>
                    <p className="text-xs text-muted">{row.authorId}</p>
                  </td>
                  <td className="px-3 py-3">${row.amountPaid.toFixed(2)}</td>
                  <td className="px-3 py-3">${row.platformShare.toFixed(2)}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-700">
                    ${row.authorShare.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-sidebar bg-[#FCF9F5] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          highlight ? "text-emerald-700" : negative ? "text-red-700" : "text-ink"
        }`}
      >
        ${value.toFixed(2)}
      </p>
    </div>
  );
}
