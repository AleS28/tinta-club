"use client";

import type { AuthorBookPerformance } from "@/types/monetization";
import { formatReadingDuration } from "@/lib/monetization/format";

interface AuthorBookPerformanceTableProps {
  books: AuthorBookPerformance[];
}

export function AuthorBookPerformanceTable({ books }: AuthorBookPerformanceTableProps) {
  if (books.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-sidebar bg-white/50 p-8 text-center">
        <p className="text-sm text-muted">
          Aún no hay datos de lectura para tus obras este mes. Publica capítulos premium y
          comparte tu trabajo con la comunidad.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-sidebar bg-white/80 shadow-sm">
      <div className="border-b border-sidebar px-6 py-4">
        <h3 className="font-serif text-xl font-bold text-ink">Rendimiento por obra</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-sidebar bg-sidebar/40 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Cap. Premium</th>
              <th className="px-4 py-3 font-semibold">Tiempo leído</th>
              <th className="px-4 py-3 font-semibold">Vistas</th>
              <th className="px-6 py-3 font-semibold text-right">Ganancia est.</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.bookId} className="border-b border-sidebar/60 last:border-0">
                <td className="px-6 py-4 font-medium text-ink">{book.title}</td>
                <td className="px-4 py-4 text-muted">{book.premiumChapterCount}</td>
                <td className="px-4 py-4 text-muted">
                  {formatReadingDuration(book.readingSeconds)}
                </td>
                <td className="px-4 py-4 text-muted">{book.totalViews}</td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                  ${book.estimatedEarnings.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
