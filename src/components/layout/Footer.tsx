import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sidebar bg-paper py-10">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="font-serif text-xl font-bold text-ink">{BRAND_NAME}</p>
        <p className="mt-1 text-sm text-muted">{BRAND_TAGLINE}</p>
        <p className="mt-4 text-xs text-muted/80">
          © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
