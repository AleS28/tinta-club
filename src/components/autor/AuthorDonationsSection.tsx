"use client";

import type { AuthorEarningsDashboard } from "@/types/monetization";
import { Coffee } from "lucide-react";

interface AuthorDonationsSectionProps {
  data: AuthorEarningsDashboard;
}

export function AuthorDonationsSection({ data }: AuthorDonationsSectionProps) {
  const donations = data.donations;

  return (
    <section className="rounded-2xl border border-sidebar bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Coffee className="h-5 w-5 text-amber-700" />
        <h2 className="font-serif text-xl font-bold text-ink">Apoyos recibidos</h2>
      </div>
      <p className="text-sm text-muted">
        Solo ves tu parte neta (70%). Los montos brutos y comisiones los audita administración.
      </p>

      <p className="mt-4 text-2xl font-bold text-ink">
        +${donations.totalAuthorShare.toFixed(2)} USD
        <span className="ml-2 text-sm font-normal text-muted">este mes</span>
      </p>

      {donations.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Aún no has recibido donaciones este mes.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {donations.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-sidebar px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{item.donorDisplayName}</p>
                <p className="text-xs text-muted">
                  {new Date(item.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm font-bold text-emerald-700">
                +${item.authorShare.toFixed(2)} USD
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
