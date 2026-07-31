import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/administracion/finanzas", label: "Finanzas" },
  { href: "/administracion/tienda", label: "Precios tienda" },
] as const;

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-sidebar bg-white/70 p-2"
      aria-label="Secciones de administración"
    >
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-imperial-dark text-white"
                : "text-ink hover:bg-sidebar/60"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
