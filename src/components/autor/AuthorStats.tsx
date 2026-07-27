"use client";

import { BookOpen, DollarSign, Layers } from "lucide-react";

interface AuthorStatsProps {
  bookCount: number;
  chapterCount: number;
  totalEarnings: number;
}

export function AuthorStats({ bookCount, chapterCount, totalEarnings }: AuthorStatsProps) {
  const stats = [
    {
      label: "Libros publicados",
      value: bookCount,
      icon: BookOpen,
      color: "bg-terracotta/10 text-terracotta",
    },
    {
      label: "Capítulos totales",
      value: chapterCount,
      icon: Layers,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Ingresos acumulados",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-sidebar bg-white/70 p-5 shadow-sm"
        >
          <div className={`inline-flex rounded-full p-2.5 ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <p className="mt-3 font-serif text-2xl font-bold text-ink">{stat.value}</p>
          <p className="mt-1 text-sm text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
