"use client";

import { ProtectedContent } from "@/components/ui/ProtectedContent";

interface BookSynopsisProps {
  synopsis: string;
}

export function BookSynopsis({ synopsis }: BookSynopsisProps) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-bold text-ink">Sinopsis</h2>
      <ProtectedContent className="mt-3 text-base leading-relaxed text-ink/85">
        {synopsis}
      </ProtectedContent>
    </section>
  );
}
