"use client";

import { Building2, Clock, Handshake, TrendingUp } from "lucide-react";
import type { GlobalFinancialReport } from "@/types/admin-financial";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AdminGlobalFinancialSummaryProps {
  report: GlobalFinancialReport;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function AdminGlobalFinancialSummary({ report }: AdminGlobalFinancialSummaryProps) {
  const cards = [
    {
      emoji: "🏦",
      label: "Ingresos totales de la plataforma",
      value: formatUsd(report.grossRevenue),
      sub: "Suscripciones + ventas directas",
      icon: Building2,
      color: "bg-imperial-dark/10 text-imperial-deep",
    },
    {
      emoji: "📈",
      label: "Ganancia neta plataforma (30%)",
      value: formatUsd(report.platformNet30),
      sub: "Participación del Imperio",
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      emoji: "🤝",
      label: "Fondo total para autores (70%)",
      value: formatUsd(report.authorsPool70),
      sub: "Pool suscripciones + ventas directas",
      icon: Handshake,
      color: "bg-gold-cream/80 text-imperial-deep",
    },
    {
      emoji: "⏱️",
      label: "Horas totales leídas en la web",
      value: formatReadingDuration(report.totalPlatformReadingTime),
      sub: `Pool ${report.poolStatus === "closed" ? "cerrado" : "abierto"}`,
      icon: Clock,
      color: "bg-terracotta/10 text-terracotta",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
