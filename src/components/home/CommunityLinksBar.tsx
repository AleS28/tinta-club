import Link from "next/link";
import { Users } from "lucide-react";
import { DiscordInviteLink } from "@/components/discord/DiscordInviteLink";
import { TelegramInviteLink } from "@/components/telegram/TelegramInviteLink";
import { isDiscordConfigured } from "@/lib/discord";
import { isFacebookConfigured } from "@/lib/facebook";
import { isTelegramConfigured } from "@/lib/telegram";
import { getCommunitySocialUrl, type CommunitySocialKey } from "@/lib/social";

const EXTRA_LINKS: { key: CommunitySocialKey; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
];

export function CommunityLinksBar({ variant = "home" }: { variant?: "home" | "footer" }) {
  const hasDiscord = isDiscordConfigured();
  const hasTelegram = isTelegramConfigured();
  const hasFacebook = isFacebookConfigured();
  const extras = EXTRA_LINKS.filter(
    (item) => item.key !== "facebook" && getCommunitySocialUrl(item.key),
  );

  if (!hasDiscord && !hasTelegram && !hasFacebook && extras.length === 0) return null;

  const shellClass =
    variant === "home"
      ? "rounded-2xl border border-[#5865F2]/15 bg-gradient-to-r from-[#5865F2]/5 via-white to-[#229ED9]/5 p-5 shadow-editorial sm:p-6"
      : "";

  return (
    <section className={variant === "home" ? "px-4 pb-4 sm:px-6" : ""}>
      <div className={variant === "home" ? "mx-auto max-w-7xl" : ""}>
        <div className={shellClass}>
          {variant === "home" && (
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-terracotta" />
              <h2 className="font-serif text-lg font-bold text-ink">Únete a la comunidad</h2>
            </div>
          )}
          {variant === "home" && (
            <p className="mb-4 text-sm text-muted">
              Avisos de capítulos nuevos, charla con autores y fundadores del Imperio.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasDiscord && (
              <DiscordInviteLink
                className="inline-flex items-center gap-2 rounded-full bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4752C4]"
              >
                Discord
              </DiscordInviteLink>
            )}
            {hasTelegram && (
              <TelegramInviteLink
                className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d8bc4]"
              >
                Telegram
              </TelegramInviteLink>
            )}
            {hasFacebook && (
              <a
                href={getCommunitySocialUrl("facebook") ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166fe0]"
              >
                Facebook
              </a>
            )}
            {extras.map((item) => {
              const href = getCommunitySocialUrl(item.key);
              if (!href) return null;
              return (
                <a
                  key={item.key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-sidebar bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-terracotta/40 hover:text-terracotta"
                >
                  {item.label}
                </a>
              );
            })}
            {variant === "footer" && (
              <Link
                href="/conocenos"
                className="inline-flex items-center gap-2 rounded-full border border-sidebar bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-terracotta/40 hover:text-terracotta"
              >
                Conócenos
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
