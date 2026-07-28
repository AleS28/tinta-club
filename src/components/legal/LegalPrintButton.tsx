"use client";

import { Printer } from "lucide-react";

export function LegalPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-[#2A1810] shadow-sm transition-all duration-300 hover:border-[#D27C5A] hover:text-[#D27C5A]"
    >
      <Printer className="h-4 w-4" />
      Imprimir / Guardar en PDF
    </button>
  );
}
