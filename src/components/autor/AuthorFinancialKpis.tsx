"use client";

import { Clock, Coins, Eye, Loader2, TrendingUp, Wallet } from "lucide-react";
import type { AuthorEarningsDashboard } from "@/types/monetization";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AuthorFinancialKpisProps {
  data: AuthorEarningsDashboard;
  loading?: boolean;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatValuePerSecond(value: number): string {
  if (value <= 0) return "$0.00";
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toExponential(2)}`;
}

export function AuthorFinancialKpis({ data, loading }: AuthorFinancialKpisProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }

  const isFrozen = data.pool.status === "closed" && !!data.frozenValuePerSecond;
  const valuePerSecondLabel = isFrozen
    ? "Valor por segundo (cerrado)"
    : "Valor estimado por segundo";

  const cards = [
    {
      label: "Balance estimado este mes",
      value: formatUsd(data.estimatedBalance),
      sub: `Pool ${formatUsd(data.subscriptionEarnings)} + directas ${formatUsd(data.directSalesEarnings)}`,
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-700",
      emoji: "💰",
    },
    {
      label: "Tiempo de lectura premium (pool)",
      value: formatReadingDuration(data.accumulatedReadingSeconds),
      sub: "Segundos que participan en el reparto del 70%",
      icon: Clock,
      color: "bg-imperial-dark/10 text-imperial-deep",
      emoji: "⏱️",
    },
    {
      label: valuePerSecondLabel,
      value: formatValuePerSecond(data.estimatedValuePerSecond),
      sub: isFrozen
        ? "Valor definitivo congelado al cierre"
        : "Estimado — cambia mientras llegan suscripciones",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-800",
      emoji: "📊",
    },
    {
      label: "Regalías estimadas por lectura",
      value: formatUsd(data.subscriptionEarnings),
      sub: `${formatReadingDuration(data.accumulatedReadingSeconds)} × ${formatValuePerSecond(data.estimatedValuePerSecond)}/s`,
      icon: Coins,
      color: "bg-gold-cream/80 text-imperial-deep",
      emoji: "🤝",
    },
    {
      label: "Vistas estadísticas del mes",
      value: data.totalViews.toLocaleString("es-ES"),
      sub: "Contador social del libro (no determina regalías)",
      icon: Eye,
      color: "bg-terracotta/10 text-terracotta",
      emoji: "👁️",
    },
    {
      label: "Ventas directas individuales (70%)",
      value: formatUsd(data.directSalesEarnings),
      sub: `Capítulos ${formatUsd(data.directSales.chapterSalesAuthorShare)} + libros ${formatUsd(data.directSales.bookSalesAuthorShare)}`,
      icon: Coins,
      color: "bg-stone-100 text-stone-700",
      emoji: "💎",
    },
    {
      label: "Balance disponible para retiro",
      value: formatUsd(data.availableForWithdrawal),
      sub:
        data.pool.status === "closed"
          ? "Mes cerrado — disponible si supera el umbral"
          : "Disponible tras el cierre mensual",
      icon: Wallet,
      color: "bg-stone-100 text-stone-700",
      emoji: "🏦",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-sidebar bg-white/80 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`inline-flex rounded-full p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <span className="text-lg" aria-hidden>
                {card.emoji}
              </span>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-ink">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.label}</p>
            {card.sub && <p className="mt-1 text-xs text-muted/80">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold-cream/30 px-5 py-4">
        <p className="text-sm text-ink/80">
          Umbral mínimo de retiro:{" "}
          <span className="font-semibold">{formatUsd(data.minPayoutThreshold)}</span>
          {" · "}
          Mes: <span className="font-semibold">{data.monthYear}</span>
          {" · "}
          Pool autores: <span className="font-semibold">{formatUsd(data.pool.authorsPool70)}</span>
        </p>
        <button
          type="button"
          disabled={!data.isPayoutReady}
          className="rounded-full bg-terracotta px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Solicitar Pago
        </button>
      </div>
    </div>
  );
}
