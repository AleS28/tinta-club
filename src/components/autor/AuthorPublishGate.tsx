"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function AuthorPublishGate() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
      <AlertCircle className="mx-auto h-8 w-8 text-amber-700" />
      <h3 className="mt-3 font-serif text-lg font-bold text-ink">Acuerdo de autor pendiente</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Para publicar obras y capítulos debes completar tu firma digital de autor. Es un trámite único
        por cuenta y aplica a todas tus publicaciones.
      </p>
      <Link
        href="/autor/acuerdo"
        className="mt-5 inline-flex rounded-full bg-terracotta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-orange-700"
      >
        Firmar acuerdo de autor
      </Link>
    </div>
  );
}
