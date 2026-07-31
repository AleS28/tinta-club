"use client";

import type { GlobalFinancialReport } from "@/types/admin-financial";

interface AdminMonthClosurePanelProps {
  report: GlobalFinancialReport;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function AdminMonthClosurePanel({ report }: AdminMonthClosurePanelProps) {
  const isClosed = report.poolStatus === "closed";

  return (
    <section className="rounded-2xl border border-amber-900/10 bg-white/80 p-6 shadow-editorial">
      <h2 className="font-serif text-xl font-bold text-ink">Cierre del período</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Estado</dt>
          <dd className="font-semibold text-ink">
            {isClosed ? "Cerrado" : "Abierto"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Período</dt>
          <dd className="font-semibold text-ink">{report.monthYear}</dd>
        </div>
        {report.consolidatedAt && (
          <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
            <dt className="text-muted">Fecha de cierre</dt>
            <dd className="font-semibold text-ink">
              {new Date(report.consolidatedAt).toLocaleString("es-ES")}
            </dd>
          </div>
        )}
        {report.consolidationId && (
          <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3 sm:col-span-2">
            <dt className="text-muted">Identificador del cierre</dt>
            <dd className="font-mono text-xs font-semibold text-ink">{report.consolidationId}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Pool distribuido</dt>
          <dd className="font-semibold text-terracotta">
            {formatUsd(report.totalPoolDistributed ?? 0)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Pool objetivo (70% subs)</dt>
          <dd className="font-semibold text-ink">
            {formatUsd(report.subscriptionAuthorsPool70)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Ajuste de redondeo</dt>
          <dd className="font-semibold text-ink">
            {report.roundingAdjustmentCents ?? 0} centavos
          </dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-sidebar/30 px-4 py-3">
          <dt className="text-muted">Valor por segundo</dt>
          <dd className="font-semibold text-ink">
            {report.valuePerSecond > 0 ? `$${report.valuePerSecond.toFixed(8)}` : "$0.00"}
          </dd>
        </div>
      </dl>
      {!isClosed && (
        <p className="mt-4 text-xs text-muted">
          El valor por vista y las regalías definitivas se congelan al ejecutar el cierre mensual
          (POST /api/cron/close-month).
        </p>
      )}
    </section>
  );
}
