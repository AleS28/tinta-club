"use client";

interface ReaderWatermarkProps {
  identifier: string;
}

export function ReaderWatermark({ identifier }: ReaderWatermarkProps) {
  const line = `${identifier} · El Imperio de la Tinta — Copia Protegida`;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 w-[220%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg]">
        {Array.from({ length: 8 }).map((_, index) => (
          <p
            key={index}
            className="whitespace-nowrap py-12 text-center font-serif text-[11px] tracking-wide text-ink/[0.045] sm:text-xs"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
