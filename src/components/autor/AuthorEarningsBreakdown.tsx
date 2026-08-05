"use client";

import type { AuthorEarningsDashboard } from "@/types/monetization";

interface AuthorEarningsBreakdownProps {
  data: AuthorEarningsDashboard;
}

export function AuthorEarningsBreakdown({ data }: AuthorEarningsBreakdownProps) {
  const { subscriptionPercent, directSalesPercent } = data.incomeBreakdown;
  const total = data.estimatedBalance;

  return (
    <section className="rounded-2xl border border-sidebar bg-white/80 p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-ink">
        Desglose de monetización
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Tus ganancias se calculan sobre ingresos netos (después de comisiones de pasarela),
        en función del tiempo de lectura de tus obras y las ventas directas individuales
        (capítulos y libros completos al 70%).
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(
              #D97757 0% ${subscriptionPercent}%,
              #C9A961 ${subscriptionPercent}% ${subscriptionPercent + directSalesPercent}%,
              #F4EFE6 ${subscriptionPercent + directSalesPercent}% 100%
            )`,
          }}
          aria-hidden
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-xs text-muted">Total</span>
            <span className="font-serif text-lg font-bold text-ink">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Fondo de Suscripciones (Pool 70%)</span>
              <span className="font-semibold text-terracotta">{subscriptionPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-sidebar">
              <div
                className="h-full rounded-full bg-terracotta transition-all"
                style={{ width: `${subscriptionPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              ${data.subscriptionEarnings.toFixed(2)} estimados
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Compras directas individuales (70%)</span>
              <span className="font-semibold text-gold">{directSalesPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-sidebar">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${directSalesPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              ${data.directSalesEarnings.toFixed(2)} acumulados
            </p>
          </div>

          <div className="rounded-xl bg-sidebar/60 px-4 py-3 text-xs text-muted">
            Pool neto del mes: ${data.pool.subscriptionNet.toFixed(2)} para autores (70%: $
            {data.pool.authorsPool70.toFixed(2)}) ·{" "}
            {data.pool.totalPlatformReadingSeconds.toLocaleString()} s leídos ·{" "}
            ${data.pool.valuePerSecond.toFixed(6)}/s
            {data.pool.subscriptionGatewayFees > 0 && (
              <>
                {" "}
                · Comisiones PayPal descontadas: ${data.pool.subscriptionGatewayFees.toFixed(2)}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
