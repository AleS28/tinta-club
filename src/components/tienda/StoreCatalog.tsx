"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { StoreBookListing } from "@/types/monetization";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { StoreBookCard } from "@/components/tienda/StoreBookCard";

export function StoreCatalog() {
  const { user, openAuthModal } = useAuth();
  const [catalog, setCatalog] = useState<StoreBookListing[]>([]);
  const [ownedBookIds, setOwnedBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchaseLoadingId, setPurchaseLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const catalogRes = await fetch("/api/store/catalog");
      const catalogPayload = (await catalogRes.json()) as {
        catalog?: StoreBookListing[];
        error?: string;
      };

      if (!catalogRes.ok) {
        setError(catalogPayload.error ?? "No se pudo cargar el catálogo.");
        return;
      }

      setCatalog(catalogPayload.catalog ?? []);

      if (user) {
        const token = await user.getIdToken();
        const purchasesRes = await fetch("/api/library/purchases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (purchasesRes.ok) {
          const purchasesPayload = (await purchasesRes.json()) as { bookIds?: string[] };
          setOwnedBookIds(new Set(purchasesPayload.bookIds ?? []));
        }
      } else {
        setOwnedBookIds(new Set());
      }
    } catch {
      setError("Error de conexión al cargar la tienda.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handlePurchase = async (bookId: string) => {
    if (!user) {
      openAuthModal("/tienda", { intent: "subscribe" });
      return;
    }

    setPurchaseLoadingId(bookId);
    setError("");

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`/api/books/${bookId}/purchase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        const chapterListing = catalog.find((c) => c.bookId === bookId);
        if (chapterListing?.saleMode === "chapter" && chapterListing.firstChapterId) {
          const chapterRes = await fetch(
            `/api/chapters/${chapterListing.firstChapterId}/purchase`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const chapterPayload = (await chapterRes.json()) as { url?: string; error?: string };
          if (chapterRes.ok && chapterPayload.url) {
            window.location.href = chapterPayload.url;
            return;
          }
          setError(chapterPayload.error ?? payload.error ?? "No se pudo iniciar la compra.");
          return;
        }

        setError(payload.error ?? "No se pudo iniciar la compra.");
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("No pudimos conectar con PayPal.");
    } finally {
      setPurchaseLoadingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta">
          <ShoppingBag className="h-3.5 w-3.5" />
          Tienda individual
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink">Catálogo de compra directa</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Compra obras completas o capítulos premium. Todo el contenizado se lee aquí, en nuestro
          visor — licencia digital de por vida, sin descargas.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted">Cargando catálogo…</p>
      ) : catalog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sidebar bg-white/60 px-6 py-12 text-center">
          <p className="font-medium text-ink">No hay obras disponibles para compra individual aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((listing) => (
            <StoreBookCard
              key={listing.bookId}
              listing={listing}
              owned={ownedBookIds.has(listing.bookId)}
              onPurchase={handlePurchase}
              purchaseLoading={purchaseLoadingId === listing.bookId}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export function StoreCatalogPublic() {
  return <StoreCatalog />;
}

export function StoreCatalogAuthed() {
  return (
    <AuthGuard redirectTo="/tienda">
      <StoreCatalog />
    </AuthGuard>
  );
}
