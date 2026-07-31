"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Loader2 } from "lucide-react";
import type { AuthorFinancialBreakdown, GlobalFinancialReport } from "@/types/admin-financial";
import type { PayoutStatus } from "@/types/monetization";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AdminAuthorsEarningsTableProps {
  report: GlobalFinancialReport;
  onMarkPaid: (authorId: string) => Promise<void>;
  markingId: string | null;
}

const STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "Pendiente",
  ready_for_payout: "Listo para pago",
  paid: "Pagado",
};

const STATUS_STYLES: Record<PayoutStatus, string> = {
  pending: "bg-stone-100 text-stone-600",
  ready_for_payout: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

function AuthorAvatar({ name, photoURL }: { name: string; photoURL?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoURL} alt={name} className="h-10 w-10 rounded-full border border-sidebar object-cover" />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sidebar bg-terracotta/15 text-xs font-bold text-terracotta">
      {initials}
    </div>
  );
}

function AuthorDetailModal({
  author,
  onClose,
}: {
  author: AuthorFinancialBreakdown;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-sidebar bg-[#FCF9F5] p-6 shadow-editorial-lg">
        <div className="flex items-center gap-3">
          <AuthorAvatar name={author.authorName} photoURL={author.photoURL} />
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">{author.authorName}</h3>
            <p className="text-sm text-muted">{author.email}</p>
            <p className="text-xs text-muted">UID: {author.authorId}</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Obras activas</dt>
            <dd className="font-medium text-ink">{author.activeBooksCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Vistas estadísticas</dt>
            <dd className="font-medium text-ink">{author.premiumViews.toLocaleString("es-ES")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Tiempo lectura pool</dt>
            <dd className="font-medium text-ink">
              {formatReadingDuration(author.readingTimeSeconds)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">% del pool por tiempo</dt>
            <dd className="font-medium text-ink">{author.viewSharePercent.toFixed(2)}%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Ganancia pool</dt>
            <dd className="font-medium text-terracotta">${author.poolEarnings.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Ventas directas</dt>
            <dd className="font-medium text-gold">${author.directSalesEarnings.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between border-t border-sidebar pt-3">
            <dt className="font-semibold text-ink">Total autor</dt>
            <dd className="font-bold text-emerald-700">
              ${author.totalAuthorEarnings.toFixed(2)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-sidebar py-2.5 text-sm font-medium text-ink hover:bg-sidebar/60"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export function AdminAuthorsEarningsTable({
  report,
  onMarkPaid,
  markingId,
}: AdminAuthorsEarningsTableProps) {
  const [detailAuthor, setDetailAuthor] = useState<AuthorFinancialBreakdown | null>(null);

  if (report.authorsBreakdown.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-sidebar bg-white/50 p-10 text-center">
        <p className="text-sm text-muted">
          No hay actividad financiera registrada para{" "}
          {report.monthYear}. Los datos aparecerán cuando haya suscripciones y vistas premium.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-amber-900/10 bg-white/80 shadow-editorial">
        <div className="border-b border-sidebar px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-ink">
            Desglose de ganancias por autor
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-sidebar bg-sidebar/40 text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-semibold">Autor</th>
                <th className="px-4 py-3 font-semibold">Obras</th>
                <th className="px-4 py-3 font-semibold">Vistas stats</th>
                <th className="px-4 py-3 font-semibold">Tiempo pool</th>
                <th className="px-4 py-3 font-semibold">% pool</th>
                <th className="px-4 py-3 font-semibold">Pool</th>
                <th className="px-4 py-3 font-semibold">Directas</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {report.authorsBreakdown.map((author) => (
                <tr key={author.authorId} className="border-b border-sidebar/60 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AuthorAvatar name={author.authorName} photoURL={author.photoURL} />
                      <div>
                        <p className="font-medium text-ink">{author.authorName}</p>
                        <p className="text-xs text-muted">{author.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted">{author.activeBooksCount}</td>
                  <td className="px-4 py-4 text-muted">
                    {author.premiumViews.toLocaleString("es-ES")}
                  </td>
                  <td className="px-4 py-4 text-muted">
                    {formatReadingDuration(author.readingTimeSeconds)}
                  </td>
                  <td className="px-4 py-4 text-muted">{author.viewSharePercent.toFixed(2)}%</td>
                  <td className="px-4 py-4 text-terracotta">
                    ${author.poolEarnings.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-gold">
                    ${author.directSalesEarnings.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-emerald-700">
                    ${author.totalAuthorEarnings.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[author.payoutStatus]}`}
                    >
                      {STATUS_LABELS[author.payoutStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailAuthor(author)}
                        className="inline-flex items-center gap-1 rounded-full border border-sidebar px-3 py-1.5 text-xs font-medium text-ink hover:bg-sidebar/60"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detalle
                      </button>
                      {author.payoutStatus !== "paid" && (
                        <button
                          type="button"
                          disabled={markingId === author.authorId}
                          onClick={() => void onMarkPaid(author.authorId)}
                          className="inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-60"
                        >
                          {markingId === author.authorId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Marcar pagado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detailAuthor && (
        <AuthorDetailModal author={detailAuthor} onClose={() => setDetailAuthor(null)} />
      )}
    </>
  );
}
