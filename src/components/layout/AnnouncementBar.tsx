import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-[#D27C5A] via-[#C06240] to-[#D27C5A] py-2.5 text-center text-xs font-bold text-white sm:text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 sm:gap-x-3">
        <Link
          href="/leer/pedro-amor-cafe-cap-1"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FCF9F5] sm:text-xs">
            Cap. 1-3 Gratis
          </span>
          <span>Amor con aroma a café — Pedro García Martínez</span>
        </Link>
        <span className="hidden text-white/50 sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden sm:inline">
          Suscripción desde <span className="text-[#FCF9F5]">$4.99/mes</span>
        </span>
      </div>
    </div>
  );
}
