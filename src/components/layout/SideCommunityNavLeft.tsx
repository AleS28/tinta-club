import Link from "next/link";
import { getPlatformSocialLinks } from "@/lib/social";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcons";

export function SideCommunityNavLeft() {
  const links = getPlatformSocialLinks();

  return (
    <aside
      aria-label="Comunidad independiente"
      className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-row items-center gap-3 xl:flex"
    >
      <div className="flex flex-row items-center gap-3 rounded-2xl border border-[#D27C5A]/30 bg-[#FCF9F5]/80 p-3 shadow-2xl backdrop-blur-md">
        <p
          className="select-none text-xs font-bold uppercase tracking-widest text-[#2A1810] [writing-mode:vertical-lr] rotate-180"
          aria-hidden
        >
          Comunidad Independiente
        </p>

        <nav className="flex flex-col items-center gap-2.5" aria-label="Redes sociales">
          {links.map(({ platform, label, href }) => {
            const isExternal = href.startsWith("http");
            return (
              <Link
                key={platform}
                href={href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={label}
                className="rounded-lg p-1.5 text-[#2A1810]/70 transition-transform duration-300 hover:scale-110 hover:text-[#D27C5A]"
              >
                <SocialPlatformIcon platform={platform} className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
