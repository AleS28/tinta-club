"use client";

import { useState } from "react";
import { Coffee, Gift, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PRESET_AMOUNTS = [2, 5, 10, 20];

interface SupportAuthorModalProps {
  authorId: string;
  authorName: string;
  redirectTo?: string;
  onClose: () => void;
}

export function SupportAuthorModal({
  authorId,
  authorName,
  redirectTo,
  onClose,
}: SupportAuthorModalProps) {
  const { user, openAuthModal } = useAuth();
  const [amount, setAmount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async () => {
    const amountUsd = Number(amount);
    if (!Number.isFinite(amountUsd) || amountUsd < 1) {
      setError("El mínimo es $1.00 USD.");
      return;
    }

    if (!user) {
      openAuthModal(redirectTo ?? `/perfil/${authorId}`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/authors/${authorId}/donate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountUsd,
          redirectTo: redirectTo ?? `/perfil/${authorId}?donated=true`,
        }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "No se pudo iniciar la donación.");
        return;
      }
      window.location.href = payload.url;
    } catch {
      setError("No pudimos conectar con PayPal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-sidebar bg-paper p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-sidebar/60"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
          <Gift className="h-3.5 w-3.5" />
          Invita un café al autor
        </div>

        <h2 className="font-serif text-2xl font-bold text-ink">Invita un café a {authorName}</h2>
        <p className="mt-2 text-sm text-muted">
          Un gesto directo en USD. El autor recibe el 70% neto; el resto cubre comisiones y la
          plataforma.
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`rounded-xl border px-2 py-2 text-sm font-semibold ${
                Number(amount) === preset
                  ? "border-terracotta bg-terracotta/10 text-terracotta"
                  : "border-sidebar text-ink hover:border-terracotta/40"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Otra cantidad (USD)
          </span>
          <input
            type="number"
            min="1"
            max="500"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-sidebar bg-white px-3 py-2.5 text-sm focus:border-terracotta focus:outline-none"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={() => void handleDonate()}
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coffee className="h-4 w-4" />}
          Invitar café — ${Number(amount || 0).toFixed(2)} USD
        </button>
      </div>
    </div>
  );
}
