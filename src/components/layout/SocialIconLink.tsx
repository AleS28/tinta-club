import type { ComponentType } from "react";
import { Facebook, Instagram, Send } from "lucide-react";
import type { CommunitySocialKey } from "@/lib/social";
import { getCommunitySocialUrl } from "@/lib/social";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { XIcon } from "@/components/ui/XIcon";

type IconComponent = ComponentType<{ className?: string }>;

const SOCIAL_META: Record<CommunitySocialKey, { label: string; Icon: IconComponent }> = {
  discord: { label: "Discord", Icon: DiscordIcon },
  instagram: { label: "Instagram", Icon: Instagram },
  telegram: { label: "Telegram", Icon: Send },
  tiktok: { label: "TikTok", Icon: TikTokIcon },
  x: { label: "X (Twitter)", Icon: XIcon },
  facebook: { label: "Facebook", Icon: Facebook },
};

interface SocialIconLinkProps {
  platform: CommunitySocialKey;
  className?: string;
  iconClassName?: string;
}

export function SocialIconLink({ platform, className = "", iconClassName = "h-5 w-5" }: SocialIconLinkProps) {
  const { label, Icon } = SOCIAL_META[platform];
  const href = getCommunitySocialUrl(platform);

  const content =
    platform === "discord" ? (
      <DiscordIcon className={`${iconClassName} fill-current`} />
    ) : (
      <Icon className={iconClassName} aria-hidden />
    );

  if (!href) {
    return (
      <span
        className={`inline-flex cursor-not-allowed items-center justify-center text-[#D27C5A]/40 ${className}`}
        title={`${label} — próximamente`}
        aria-label={`${label} — próximamente`}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center text-[#2A1810] transition-transform duration-300 hover:scale-110 hover:text-[#D27C5A] ${className}`}
      aria-label={label}
      title={label}
    >
      {content}
    </a>
  );
}

export function SideBannerSocialButton({
  platform,
  gradientClass,
}: {
  platform: CommunitySocialKey;
  gradientClass: string;
}) {
  const { label } = SOCIAL_META[platform];
  const href = getCommunitySocialUrl(platform);

  const inner =
    platform === "discord" ? (
      <DiscordIcon className="h-6 w-6 fill-white" />
    ) : platform === "telegram" ? (
      <Send className="h-6 w-6 text-white" aria-hidden />
    ) : platform === "instagram" ? (
      <Instagram className="h-6 w-6 text-white" aria-hidden />
    ) : (
      <TikTokIcon className="h-6 w-6 text-white" />
    );

  const baseClass = `flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg transition-transform duration-300 hover:scale-110 ${gradientClass}`;

  if (!href) {
    return (
      <span
        className={`${baseClass} cursor-not-allowed opacity-50`}
        title={`${label} — próximamente`}
        aria-label={`${label} — próximamente`}
      >
        {inner}
      </span>
    );
  }

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
