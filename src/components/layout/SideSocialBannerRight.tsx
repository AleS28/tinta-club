import Link from "next/link";
import { getSideBannerSocialLinks } from "@/lib/social";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcons";

export function SideSocialBannerRight() {
  const links = getSideBannerSocialLinks();

  return (
    <aside
      aria-label="Únete a nuestras redes"
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-stretch shadow-2xl xl:flex"
    >
      <div className="flex items-center rounded-l-3xl border-y-2 border-l-2 border-[#D27C5A]/40 bg-[#2A1810] p-4">
        <nav className="flex flex-col items-center gap-3" aria-label="Redes destacadas">
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#D27C5A] to-[#2A1810] text-[#FCF9F5] shadow-lg transition-transform duration-300 hover:scale-110 hover:from-[#D4A359] hover:to-[#D27C5A]"
              >
                <SocialPlatformIcon platform={platform} className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex w-9 items-center justify-center rounded-l-none bg-[#FCF9F5]/95 px-1 py-4">
        <p
          className="select-none text-[10px] font-bold uppercase tracking-widest text-[#2A1810] [writing-mode:vertical-lr] rotate-180"
          aria-hidden
        >
          Únete a nuestras Redes y Discord
        </p>
      </div>
    </aside>
  );
}
