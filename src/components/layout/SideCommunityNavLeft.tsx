import { COMMUNITY_SOCIAL_ORDER } from "@/lib/social";
import { SocialIconLink } from "@/components/layout/SocialIconLink";

export function SideCommunityNavLeft() {
  return (
    <aside
      className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-row items-center gap-3 xl:flex print:hidden"
      aria-label="Comunidad independiente"
    >
      <div className="flex flex-row items-center gap-3 rounded-2xl border border-[#D27C5A]/30 bg-[#FCF9F5]/80 p-3 shadow-2xl backdrop-blur-md">
        <p
          className="text-xs font-bold uppercase tracking-widest text-[#2A1810] [writing-mode:vertical-lr] rotate-180"
          aria-hidden
        >
          Comunidad Independiente
        </p>

        <nav className="flex flex-col items-center gap-3" aria-label="Redes sociales">
          {COMMUNITY_SOCIAL_ORDER.map((platform) => (
            <SocialIconLink key={platform} platform={platform} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
