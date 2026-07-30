"use client";

import { Clock, Coins, Loader2, Wallet } from "lucide-react";
import type { AuthorEarningsDashboard } from "@/types/monetization";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AuthorFinancialKpisProps {
  data: AuthorEarningsDashboard;
  loading?: boolean;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function AuthorFinancialKpis({ data, loading }: AuthorFinancialKpisProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
      </div>
    );
  }

  const cards = [
    {
      label: "Balance estimado este mes",
      value: formatUsd(data.estimatedBalance),
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-700",
      emoji: "💰",
    },
    {
      label: "Tiempo total de lectura",
      value: formatReadingDuration(data.totalReadingSeconds),
      icon: Clock,
      color: "bg-amber-100 text-amber-800",
      emoji: "🕒",
    },
    {
      label: "Ventas directas de capítulos",
      value: formatUsd(data.directSalesEarnings),
      icon: Coins,
      color: "bg-gold-cream/80 text-imperial-deep",
      emoji: "💎",
    },
    {
      label: "Balance disponible para retiro",
      value: formatUsd(data.availableForWithdrawal),
      icon: Wallet,
      color: "bg-terracotta/10 text-terracotta",
      emoji: "🏦",
    },
  ];

  return (
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
        </div>
      ))}

      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold-cream/30 px-5 py-4">
        <p className="text-sm text-ink/80">
          Umbral mínimo de retiro:{" "}
          <span className="font-semibold">{formatUsd(data.minPayoutThreshold)}</span>
          {" · "}
          Mes: <span className="font-semibold">{data.monthYear}</span>
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
