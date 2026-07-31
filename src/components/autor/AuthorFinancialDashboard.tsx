"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AuthorEarningsDashboard } from "@/types/monetization";
import { useAuth } from "@/context/AuthContext";
import { AuthorFinancialKpis } from "@/components/autor/AuthorFinancialKpis";
import { AuthorEarningsBreakdown } from "@/components/autor/AuthorEarningsBreakdown";
import { AuthorDirectSalesSection } from "@/components/autor/AuthorDirectSalesSection";
import { AuthorDonationsSection } from "@/components/autor/AuthorDonationsSection";
import { AuthorBookPerformanceTable } from "@/components/autor/AuthorBookPerformanceTable";

export function AuthorFinancialDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AuthorEarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEarnings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/author/earnings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json().catch(() => ({}))) as
        | AuthorEarningsDashboard
        | { error?: string };

      if (!response.ok) {
        setError("error" in payload ? (payload.error ?? "Error al cargar ganancias") : "Error");
        setData(null);
        return;
      }

      setData(payload as AuthorEarningsDashboard);
    } catch {
      setError("No se pudo conectar con el servidor de ganancias.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadEarnings();
  }, [loadEarnings]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-terracotta" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <p className="text-sm text-amber-900">{error}</p>
        <button
          type="button"
          onClick={() => void loadEarnings()}
          className="mt-4 rounded-full bg-terracotta px-5 py-2 text-sm font-bold text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <AuthorFinancialKpis data={data} loading={loading} />
      <AuthorDonationsSection data={data} />
      <AuthorDirectSalesSection data={data} />
      <AuthorEarningsBreakdown data={data} />
      <AuthorBookPerformanceTable books={data.bookPerformance} />
    </div>
  );
}
