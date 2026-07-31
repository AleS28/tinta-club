import Image from "next/image";
import { Facebook, Globe, Instagram } from "lucide-react";
import type { AuthorPublicProfile } from "@/types/author-profile";
import { FollowAuthorButton } from "@/components/perfil/FollowAuthorButton";
import { AuthorFollowerCount } from "@/components/social/AuthorFollowerCount";
import { SupportAuthorButton } from "@/components/social/SupportAuthorButton";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";

interface AuthorPublicHeroProps {
  profile: AuthorPublicProfile;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

const socialConfig = [
  { key: "instagram" as const, label: "Instagram", icon: Instagram },
  { key: "facebook" as const, label: "Facebook", icon: Facebook },
  { key: "tiktok" as const, label: "TikTok", icon: TikTokIcon },
  { key: "website" as const, label: "Sitio Web", icon: Globe },
];

export function AuthorPublicHero({ profile }: AuthorPublicHeroProps) {
  const activeSocials = socialConfig.filter(({ key }) => profile.social[key]);

  return (
    <header className="relative overflow-hidden rounded-3xl bg-[#3B2519] shadow-editorial-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 30%, rgba(210,124,90,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(201,169,97,0.15) 0%, transparent 45%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-6 py-10 sm:flex-row sm:items-start sm:px-10 sm:py-12">
        <div className="relative shrink-0">
          <div className="rounded-full p-1.5 ring-2 ring-[#D27C5A] ring-offset-4 ring-offset-[#3B2519]">
            {profile.photoUrl ? (
              <Image
                src={profile.photoUrl}
                alt={profile.name}
                width={140}
                height={140}
                className="h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36"
                priority
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#D27C5A] text-2xl font-bold text-white sm:h-36 sm:w-36">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="inline-flex items-center rounded-full border border-[#D27C5A]/40 bg-[#D27C5A]/15 px-4 py-1.5 text-sm font-semibold text-[#F5E6C8]">
            {profile.badge}
          </span>

          <h1 className="mt-4 font-serif text-3xl font-bold text-[#D27C5A] sm:text-4xl lg:text-5xl">
            {profile.name}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#FCF9F5]/90">{profile.bio}</p>

          <AuthorFollowerCount authorId={profile.id} className="mt-4 text-[#FCF9F5]/80" />

          {activeSocials.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {activeSocials.map(({ key, label, icon: Icon }) => (
                <a
                  key={key}
                  href={profile.social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#FCF9F5]/20 bg-[#FCF9F5]/5 text-[#FCF9F5] transition-all duration-300 hover:border-[#D27C5A] hover:bg-[#D27C5A]/20 hover:text-[#F5E6C8]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <FollowAuthorButton
              authorId={profile.id}
              redirectPath={`/autor/${profile.slug}`}
              className="bg-[#D27C5A] hover:bg-[#c06a48]"
            />

            <SupportAuthorButton
              authorId={profile.id}
              authorName={profile.name}
              redirectTo={`/autor/${profile.slug}`}
              className="border-[#FCF9F5]/30 bg-[#FCF9F5]/10 text-[#FCF9F5] hover:bg-[#FCF9F5]/20"
            />

            {isDiscordConfigured() && (
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#5865F2]/50 bg-[#5865F2]/20 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-[#FCF9F5] transition-all duration-300 hover:bg-[#5865F2]/40"
              >
                <DiscordIcon className="h-4 w-4 fill-current" />
                Unirse al Discord del Autor
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
