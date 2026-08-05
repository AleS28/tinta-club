"use client";

import type { AuthorEarningsDashboard } from "@/types/monetization";

interface AuthorDirectSalesSectionProps {
  data: AuthorEarningsDashboard;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function AuthorDirectSalesSection({ data }: AuthorDirectSalesSectionProps) {
  const { directSales } = data;

  return (
    <section className="rounded-2xl border border-sidebar bg-white/80 p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-ink">
        Ventas directas individuales (70% autor)
      </h3>
      <p className="mt-2 text-sm text-muted">
        Compras de capítulos y libros completos en la tienda. Tu parte es el 70% del neto post-PayPal,
        separado del pool de suscripciones.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-sidebar/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total tu 70%</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
            {formatUsd(directSales.totalAuthorShare)}
          </p>
        </div>
        <div className="rounded-xl bg-sidebar/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Por capítulos</p>
          <p className="mt-1 font-serif text-xl font-bold text-ink">
            {formatUsd(directSales.chapterSalesAuthorShare)}
          </p>
        </div>
        <div className="rounded-xl bg-sidebar/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Por libros completos</p>
          <p className="mt-1 font-serif text-xl font-bold text-ink">
            {formatUsd(directSales.bookSalesAuthorShare)}
          </p>
        </div>
      </div>

      {directSales.byBook.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-sidebar text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-semibold">Obra</th>
                <th className="px-4 py-2 font-semibold text-right">Capítulos (70%)</th>
                <th className="px-4 py-2 font-semibold text-right">Libro (70%)</th>
                <th className="py-2 pl-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {directSales.byBook.map((row) => (
                <tr key={row.bookId} className="border-b border-sidebar/60 last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">{row.title}</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatUsd(row.chapterSalesAuthorShare)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatUsd(row.bookSalesAuthorShare)}
                  </td>
                  <td className="py-3 pl-4 text-right font-semibold text-emerald-700">
                    {formatUsd(row.totalAuthorShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-sidebar bg-sidebar/30 px-4 py-6 text-center text-sm text-muted">
          Aún no hay ventas directas este mes. Cuando un lector compre en la tienda, verás aquí tu
          70% desglosado por obra.
        </p>
      )}
    </section>
  );
}
