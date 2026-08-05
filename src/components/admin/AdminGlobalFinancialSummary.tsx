"use client";

import { Building2, Clock, Eye, Handshake, TrendingUp } from "lucide-react";
import type { GlobalFinancialReport } from "@/types/admin-financial";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AdminGlobalFinancialSummaryProps {
  report: GlobalFinancialReport;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatValuePerSecond(value: number): string {
  if (value <= 0) return "$0.00";
  return `$${value.toFixed(6)}/s`;
}

export function AdminGlobalFinancialSummary({ report }: AdminGlobalFinancialSummaryProps) {
  const cards = [
    {
      emoji: "🏦",
      label: "Ingresos brutos suscripciones",
      value: formatUsd(report.subscriptionGross),
      sub: `Neto: ${formatUsd(report.subscriptionNet)} · Comisiones: ${formatUsd(report.subscriptionGatewayFees)}`,
      icon: Building2,
      color: "bg-imperial-dark/10 text-imperial-deep",
    },
    {
      emoji: "💳",
      label: "Comisiones pasarela (PayPal)",
      value: formatUsd(report.gatewayFees),
      sub: "Suscripciones + ventas directas",
      icon: TrendingUp,
      color: "bg-stone-100 text-stone-700",
    },
    {
      emoji: "📈",
      label: "Ganancia neta plataforma (30%)",
      value: formatUsd(report.platformNet30),
      sub: `Subs 30%: ${formatUsd(report.subscriptionPlatformPool30)}`,
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      emoji: "🤝",
      label: "Pool autores suscripciones (70%)",
      value: formatUsd(report.subscriptionAuthorsPool70),
      sub: `+ ventas directas autores: ${formatUsd(report.authorsPool70 - report.subscriptionAuthorsPool70)}`,
      icon: Handshake,
      color: "bg-gold-cream/80 text-imperial-deep",
    },
    {
      emoji: "⏱️",
      label: "Tiempo de lectura premium (pool)",
      value: formatReadingDuration(report.totalPlatformReadingTime),
      sub: `${formatValuePerSecond(report.valuePerSecond)} · Pool ${report.poolStatus === "closed" ? "cerrado" : "abierto"}`,
      icon: Clock,
      color: "bg-amber-100 text-amber-800",
    },
    {
      emoji: "👁️",
      label: "Vistas estadísticas",
      value: report.totalPlatformPremiumViews.toLocaleString("es-ES"),
      sub: "Contador social — no determina regalías",
      icon: Eye,
      color: "bg-terracotta/10 text-terracotta",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-amber-900/10 bg-white/80 p-5 shadow-editorial"
        >
          <div className="flex items-start justify-between gap-2">
            <div className={`rounded-full p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <span className="text-lg" aria-hidden>
              {card.emoji}
            </span>
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-ink">{card.value}</p>
          <p className="mt-1 text-sm font-medium text-ink/80">{card.label}</p>
          <p className="mt-1 text-xs text-muted">{card.sub}</p>
        </article>
      ))}
    </div>
  );
}
