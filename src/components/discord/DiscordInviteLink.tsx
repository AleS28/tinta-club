import type { ReactNode } from "react";
import { DISCORD_INVITE_URL, isDiscordConfigured } from "@/lib/discord";
import { DiscordIcon } from "@/components/ui/DiscordIcon";

interface DiscordInviteLinkProps {
  className?: string;
  showIcon?: boolean;
  children: ReactNode;
}

export function DiscordInviteLink({
  className = "",
  showIcon = true,
  children,
}: DiscordInviteLinkProps) {
  if (!isDiscordConfigured()) {
    return (
      <span className={`inline-flex items-center gap-2 text-muted ${className}`} aria-disabled>
        {showIcon && <DiscordIcon className="h-5 w-5 fill-current opacity-50" />}
        {children}
      </span>
    );
  }

  return (
    <a
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {showIcon && <DiscordIcon className="h-5 w-5 fill-current" />}
      {children}
    </a>
  );
}
