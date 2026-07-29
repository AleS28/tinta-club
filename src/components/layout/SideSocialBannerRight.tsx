import { SIDE_BANNER_SOCIAL_ORDER, type SideBannerSocialKey } from "@/lib/social";
import { SideBannerSocialButton } from "@/components/layout/SocialIconLink";

const BANNER_GRADIENTS: Record<SideBannerSocialKey, string> = {
  discord: "from-[#5865F2] to-[#2A1810]",
  telegram: "from-[#229ED9] to-[#2A1810]",
  instagram: "from-[#D27C5A] to-[#C06240]",
  tiktok: "from-[#D4A359] to-[#2A1810]",
};

export function SideSocialBannerRight() {
  return (
    <aside
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-stretch shadow-2xl xl:flex print:hidden"
      aria-label="Únete a nuestras redes"
    >
      <div className="flex items-stretch">
        <div className="flex flex-col items-center justify-center gap-4 rounded-l-3xl border-y-2 border-l-2 border-[#D27C5A]/40 bg-[#2A1810] p-4">
          {SIDE_BANNER_SOCIAL_ORDER.map((platform) => (
            <SideBannerSocialButton
              key={platform}
              platform={platform}
              gradientClass={BANNER_GRADIENTS[platform]}
            />
          ))}
        </div>

        <div className="flex w-8 items-center justify-center bg-[#FCF9F5]/90 px-1">
          <p
            className="text-[10px] font-bold uppercase tracking-widest text-[#2A1810] [writing-mode:vertical-lr]"
            aria-hidden
          >
            Únete a nuestras Redes
          </p>
        </div>
      </div>
    </aside>
  );
}
