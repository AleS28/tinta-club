"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Save, Shield, ShoppingBag } from "lucide-react";
import type { AdminStorePricingItem } from "@/types/admin-store-pricing";
import type { StoreSaleMode } from "@/types/monetization";
import { useAuth } from "@/context/AuthContext";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { getDefaultStorePriceForMode } from "@/lib/monetization/constants";

interface PricingDraft {
  saleMode: StoreSaleMode;
  directBookPriceUsd: string;
  directChapterPriceUsd: string;
}

function toDraft(item: AdminStorePricingItem): PricingDraft {
  return {
    saleMode: item.saleMode ?? "book",
    directBookPriceUsd:
      item.directBookPriceUsd != null
        ? item.directBookPriceUsd.toFixed(2)
        : getDefaultStorePriceForMode("book").toFixed(2),
    directChapterPriceUsd:
      item.directChapterPriceUsd != null
        ? item.directChapterPriceUsd.toFixed(2)
        : getDefaultStorePriceForMode("chapter").toFixed(2),
  };
}

function sourceLabel(source: AdminStorePricingItem["pricingSource"]): string {
  if (source === "firestore") return "Guardado en Firestore";
  if (source === "catalog") return "Valor del catálogo local";
  return "Precio por defecto";
}

export function AdminStorePricingPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<AdminStorePricingItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PricingDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/store-pricing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as {
        items?: AdminStorePricingItem[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "No se pudieron cargar los precios.");
        setItems([]);
        return;
      }

      const nextItems = payload.items ?? [];
      setItems(nextItems);
      setDrafts(Object.fromEntries(nextItems.map((item) => [item.bookId, toDraft(item)])));
    } catch {
      setError("No se pudo conectar con el servidor.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const updateDraft = (bookId: string, patch: Partial<PricingDraft>) => {
    setDrafts((current) => ({
      ...current,
      [bookId]: { ...current[bookId], ...patch },
    }));
  };

  const handleSave = async (bookId: string) => {
    if (!user) return;

    const draft = drafts[bookId];
    if (!draft) return;

    setSavingId(bookId);
    setError("");
    setMessage("");

    try {
      const token = await user.getIdToken();
      const body =
        draft.saleMode === "book"
          ? {
              saleMode: "book" as const,
              directBookPriceUsd: Number(draft.directBookPriceUsd),
            }
          : {
              saleMode: "chapter" as const,
              directChapterPriceUsd: Number(draft.directChapterPriceUsd),
            };

      const response = await fetch(`/api/admin/store-pricing/${bookId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as {
        item?: AdminStorePricingItem;
        error?: string;
      };

      if (!response.ok || !payload.item) {
        setError(payload.error ?? "No se pudo guardar el precio.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.bookId === bookId ? payload.item! : item)),
      );
      setDrafts((current) => ({
        ...current,
        [bookId]: toDraft(payload.item!),
      }));
      setMessage(`Precio actualizado para «${payload.item.title}». Ya se refleja en la tienda.`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSavingId(null);
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
              Precios de la tienda
            </h1>
            <p className="text-sm text-muted">
              Solo administración. Los cambios se aplican al catálogo público al instante.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-full border border-sidebar px-4 py-2 text-sm font-medium text-ink hover:bg-sidebar/60"
          >
            <ExternalLink className="h-4 w-4" />
            Ver tienda
          </Link>
          <Link
            href="/"
            className="rounded-full border border-sidebar px-4 py-2 text-sm font-medium text-ink hover:bg-sidebar/60"
          >
            ← Inicio
          </Link>
        </div>
      </header>

      <AdminSectionNav />

      {message && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const draft = drafts[item.bookId];
            if (!draft) return null;

            const displayPrice =
              draft.saleMode === "book"
                ? Number(draft.directBookPriceUsd)
                : Number(draft.directChapterPriceUsd);

            return (
              <article
                key={item.bookId}
                className="rounded-2xl border border-sidebar bg-white/80 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {item.inStore ? "En tienda" : "Sin capítulos premium"}
                    </div>
                    <h2 className="font-serif text-xl font-bold text-ink">{item.title}</h2>
                    <p className="text-sm text-muted">{item.author}</p>
                    <p className="mt-2 text-xs text-muted">
                      Precio actual en tienda:{" "}
                      <strong className="text-ink">${item.effectivePriceUsd.toFixed(2)} USD</strong>
                      {" · "}
                      {sourceLabel(item.pricingSource)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSave(item.bookId)}
                    disabled={savingId === item.bookId || !item.inStore}
                    className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingId === item.bookId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar
                  </button>
                </div>

                {!item.inStore ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Esta obra no aparece en la tienda porque no tiene capítulos premium.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                        Modo de venta
                      </span>
                      <select
                        value={draft.saleMode}
                        onChange={(e) =>
                          updateDraft(item.bookId, {
                            saleMode: e.target.value as StoreSaleMode,
                          })
                        }
                        className="w-full rounded-xl border border-sidebar bg-[#FCF9F5] px-3 py-2.5 text-sm text-ink focus:border-terracotta focus:outline-none"
                      >
                        <option value="book">Libro completo</option>
                        <option value="chapter">Capítulo a capítulo</option>
                      </select>
                    </label>

                    {draft.saleMode === "book" ? (
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                          Precio libro completo (USD)
                        </span>
                        <input
                          type="number"
                          min="0.5"
                          max="999"
                          step="0.01"
                          value={draft.directBookPriceUsd}
                          onChange={(e) =>
                            updateDraft(item.bookId, { directBookPriceUsd: e.target.value })
                          }
                          className="w-full rounded-xl border border-sidebar bg-[#FCF9F5] px-3 py-2.5 text-sm text-ink focus:border-terracotta focus:outline-none"
                        />
                      </label>
                    ) : (
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                          Precio por capítulo premium (USD)
                        </span>
                        <input
                          type="number"
                          min="0.5"
                          max="999"
                          step="0.01"
                          value={draft.directChapterPriceUsd}
                          onChange={(e) =>
                            updateDraft(item.bookId, { directChapterPriceUsd: e.target.value })
                          }
                          className="w-full rounded-xl border border-sidebar bg-[#FCF9F5] px-3 py-2.5 text-sm text-ink focus:border-terracotta focus:outline-none"
                        />
                      </label>
                    )}
                  </div>
                )}

                {item.inStore && Number.isFinite(displayPrice) && (
                  <p className="mt-3 text-xs text-muted">
                    Vista previa: los lectores verán{" "}
                    <strong className="text-ink">
                      ${displayPrice.toFixed(2)} USD
                      {draft.saleMode === "chapter" ? " por capítulo" : " por libro completo"}
                    </strong>
                    .
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
