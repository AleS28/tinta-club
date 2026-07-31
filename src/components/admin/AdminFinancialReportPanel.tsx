"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Shield } from "lucide-react";
import type { GlobalFinancialReport } from "@/types/admin-financial";
import { useAuth } from "@/context/AuthContext";
import { AdminGlobalFinancialSummary } from "@/components/admin/AdminGlobalFinancialSummary";
import { AdminAuthorsEarningsTable } from "@/components/admin/AdminAuthorsEarningsTable";
import { AdminBooksEarningsTable } from "@/components/admin/AdminBooksEarningsTable";
import { AdminMonthClosurePanel } from "@/components/admin/AdminMonthClosurePanel";
import { formatMonthYearCapitalized } from "@/lib/monetization/month-label";

export function AdminFinancialReportPanel() {
  const { user } = useAuth();
  const [report, setReport] = useState<GlobalFinancialReport | null>(null);
  const [monthYear, setMonthYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [linkingFounders, setLinkingFounders] = useState(false);
  const [linkFoundersMessage, setLinkFoundersMessage] = useState("");
  const [error, setError] = useState("");

  const loadReport = useCallback(
    async (selectedMonth?: string) => {
      if (!user) return;

      setLoading(true);
      setError("");

      try {
        const token = await user.getIdToken();
        const query = selectedMonth ? `?monthYear=${selectedMonth}` : "";
        const response = await fetch(`/api/admin/financial-report${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = (await response.json().catch(() => ({}))) as
          | GlobalFinancialReport
          | { error?: string };

        if (!response.ok) {
          setError("error" in payload ? (payload.error ?? "Error al cargar") : "Error");
          setReport(null);
          return;
        }

        const data = payload as GlobalFinancialReport;
        setReport(data);
        setMonthYear(data.monthYear);
      } catch {
        setError("No se pudo conectar con el servidor.");
        setReport(null);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handleMarkPaid = async (authorId: string) => {
    if (!user || !monthYear) return;

    setMarkingId(authorId);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/financial-report/payout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authorId, monthYear }),
      });

      if (!response.ok) {
        setError("No se pudo marcar el pago.");
        return;
      }

      await loadReport(monthYear);
    } finally {
      setMarkingId(null);
    }
  };

  const handleLinkFounders = async () => {
    if (!user) return;

    setLinkingFounders(true);
    setLinkFoundersMessage("");
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/link-founders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        results?: Array<{ slug: string; email: string; linked: boolean; reason?: string }>;
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "No se pudieron vincular los autores fundadores.");
        return;
      }

      const lines = (payload.results ?? []).map((result) => {
        if (result.linked) {
          return `✓ ${result.slug} (${result.email})`;
        }
        return `✗ ${result.slug}: ${result.reason ?? "error"}`;
      });

      setLinkFoundersMessage(lines.join(" · ") || "Proceso completado.");
      await loadReport(monthYear);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLinkingFounders(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-imperial-dark/10 p-3">
            <Shield className="h-6 w-6 text-imperial-deep" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
              Reporte Financiero Global
            </h1>
            <p className="text-sm text-muted">
              Auditoría de ingresos del Imperio y desglose por autor
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleLinkFounders()}
            disabled={linkingFounders || !user}
            className="rounded-full border border-terracotta/30 bg-terracotta/5 px-4 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/10 disabled:opacity-50"
          >
            {linkingFounders ? "Vinculando…" : "Vincular autores fundadores"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-sidebar px-4 py-2 text-sm font-medium text-ink hover:bg-sidebar/60"
          >
            ← Inicio
          </Link>
        </div>
      </header>

      {linkFoundersMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
          {linkFoundersMessage}
        </div>
      )}

      {report && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-sidebar bg-white/70 px-5 py-4">
          <label htmlFor="month-filter" className="text-sm font-medium text-ink">
            Periodo:
          </label>
          <div className="relative">
            <select
              id="month-filter"
              value={monthYear}
              onChange={(e) => {
                setMonthYear(e.target.value);
                void loadReport(e.target.value);
              }}
              className="appearance-none rounded-full border border-amber-900/15 bg-[#FCF9F5] py-2 pl-4 pr-10 text-sm font-medium text-ink focus:border-terracotta focus:outline-none"
            >
              {report.availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthYearCapitalized(m)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
          <span className="text-xs text-muted">
            Bruto: ${report.subscriptionGross.toFixed(2)} · Comisiones: −$
            {report.subscriptionGatewayFees.toFixed(2)} · Neto subs: $
            {report.subscriptionNet.toFixed(2)} · Directas netas: $
            {report.directSalesNet.toFixed(2)}
          </span>
        </div>
      )}

      {loading && !report ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : error && !report ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
          {error}
        </div>
      ) : report ? (
        <div className="space-y-8">
          <AdminGlobalFinancialSummary report={report} />
          <AdminMonthClosurePanel report={report} />
          <AdminAuthorsEarningsTable
            report={report}
            onMarkPaid={handleMarkPaid}
            markingId={markingId}
          />
          <AdminBooksEarningsTable report={report} />
        </div>
      ) : null}
    </main>
  );
}
