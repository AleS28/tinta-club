import type { ReactNode } from "react";
import { Send } from "lucide-react";
import { TELEGRAM_INVITE_URL, isTelegramConfigured } from "@/lib/telegram";

interface TelegramInviteLinkProps {
  className?: string;
  showIcon?: boolean;
  children: ReactNode;
}

export function TelegramInviteLink({
  className = "",
  showIcon = true,
  children,
}: TelegramInviteLinkProps) {
  if (!isTelegramConfigured()) {
    return (
      <span className={`inline-flex items-center gap-2 text-muted ${className}`} aria-disabled>
        {showIcon && <Send className="h-5 w-5 opacity-50" aria-hidden />}
        {children}
      </span>
    );
  }

  return (
    <a
      href={TELEGRAM_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {showIcon && <Send className="h-5 w-5" aria-hidden />}
      {children}
    </a>
  );
}
