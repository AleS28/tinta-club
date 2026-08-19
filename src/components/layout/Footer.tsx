import Link from "next/link";
import { Facebook, Instagram, Send } from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { isLaunchMode } from "@/lib/launch";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import {
  getCommunitySocialUrl,
  type CommunitySocialKey,
} from "@/lib/social";

const FOOTER_NAV_COLUMNS = [
  [
    { href: "/conocenos", label: "Comunidad y normas" },
    { href: "/buscar", label: "Explorar obras" },
    { href: "/terminos-lectores", label: "Términos para lectores" },
  ],
  [
    { href: "/acuerdo-autores", label: "Normas de publicación" },
    { href: "/autor/acuerdo", label: "El Imperio impulsa" },
    { href: "/conocenos", label: "Soporte" },
  ],
  [
    { href: "/buscar", label: "Catálogo de obras" },
    { href: "/biblioteca", label: "Mi biblioteca" },
    { href: "/tienda", label: "Tienda" },
  ],
] as const;

const LEGAL_LINKS = [
  { href: "/terminos-lectores", label: "Aviso legal" },
  { href: "/terminos-lectores", label: "Política de privacidad" },
  { href: "/terminos-lectores", label: "Términos y condiciones" },
] as const;

const FOOTER_SOCIAL_ORDER: CommunitySocialKey[] = [
  "facebook",
  "instagram",
  "telegram",
  "discord",
];

function FooterSocialIcon({ platform }: { platform: CommunitySocialKey }) {
  const href = getCommunitySocialUrl(platform);
  if (!href) return null;

  const baseClass =
    "flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5E6C8]/95 text-[#2A1810] shadow-sm transition-all hover:scale-105 hover:bg-white";

  const label =
    platform === "facebook"
      ? "Facebook"
      : platform === "instagram"
        ? "Instagram"
        : platform === "telegram"
          ? "Telegram"
          : "Discord";

  const inner =
    platform === "discord" ? (
      <DiscordIcon className="h-5 w-5 fill-current" />
    ) : platform === "telegram" ? (
      <Send className="h-5 w-5" aria-hidden />
    ) : platform === "instagram" ? (
      <Instagram className="h-5 w-5" aria-hidden />
    ) : (
      <Facebook className="h-5 w-5" aria-hidden />
    );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
      aria-label={label}
      title={label}
    >
      {inner}
    </a>
  );
}

export function Footer() {
  const launchMode = isLaunchMode();
  const visibleSocials = FOOTER_SOCIAL_ORDER.filter((key) => getCommunitySocialUrl(key));

  return (
    <footer className="relative mt-16 overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-[1px]"
        style={{ backgroundImage: "url('/textures/literary-pattern.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1810]/94 via-[#1F1510]/96 to-[#12100E]/98" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_auto] lg:items-start lg:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
                {BRAND_NAME}
              </p>
              {launchMode && (
                <span className="rounded-md bg-[#E07A3A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  lanzamiento
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xs text-sm text-white/75">{BRAND_TAGLINE}</p>
            <p className="mt-1 text-sm text-white/55">El universo de historias.</p>
          </div>

          <nav
            className="grid gap-8 sm:grid-cols-3 sm:gap-6"
            aria-label="Enlaces del sitio"
          >
            {FOOTER_NAV_COLUMNS.map((column, colIndex) => (
              <ul key={colIndex} className="space-y-2.5">
                {column.map((link) => (
                  <li key={`${colIndex}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/85 transition-colors hover:text-imperial-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </nav>

          {visibleSocials.length > 0 && (
            <div className="flex flex-row gap-2 lg:flex-col lg:items-end">
              {visibleSocials.map((platform) => (
                <FooterSocialIcon key={platform} platform={platform} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-white/70 transition-colors hover:text-white sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/50 sm:text-xs">
          © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
