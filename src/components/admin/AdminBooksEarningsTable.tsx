"use client";

import type { GlobalFinancialReport } from "@/types/admin-financial";

interface AdminBooksEarningsTableProps {
  report: GlobalFinancialReport;
}

export function AdminBooksEarningsTable({ report }: AdminBooksEarningsTableProps) {
  if (report.booksBreakdown.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-sidebar bg-white/50 p-10 text-center">
        <p className="text-sm text-muted">
          No hay vistas premium registradas por obra en {report.monthYear}.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-900/10 bg-white/80 shadow-editorial">
      <div className="border-b border-sidebar px-6 py-4">
        <h2 className="font-serif text-xl font-bold text-ink">Desglose por obra</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-sidebar bg-sidebar/40 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-3 font-semibold">Obra</th>
              <th className="px-4 py-3 font-semibold">Autor</th>
              <th className="px-4 py-3 font-semibold">Vistas premium</th>
              <th className="px-4 py-3 font-semibold">% total</th>
              <th className="px-4 py-3 font-semibold">Regalías pool</th>
            </tr>
          </thead>
          <tbody>
            {report.booksBreakdown.map((book) => (
              <tr key={book.bookId} className="border-b border-sidebar/60 last:border-0">
                <td className="px-6 py-4 font-medium text-ink">{book.title}</td>
                <td className="px-4 py-4 text-muted">{book.authorName}</td>
                <td className="px-4 py-4 text-muted">
                  {book.premiumViews.toLocaleString("es-ES")}
                </td>
                <td className="px-4 py-4 text-muted">{book.viewSharePercent.toFixed(2)}%</td>
                <td className="px-4 py-4 text-terracotta">${book.poolEarnings.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
