"use client";

import Link from "next/link";
import { FollowAuthorButton } from "@/components/perfil/FollowAuthorButton";

interface HomeAuthorCardProps {
  authorId: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  slug?: string;
  bookCount: number;
  initials: string;
  avatarColor: string;
  variant?: "default" | "imperial";
}

export function HomeAuthorCard({
  authorId,
  name,
  bio,
  photoUrl,
  slug,
  bookCount,
  initials,
  avatarColor,
  variant = "default",
}: HomeAuthorCardProps) {
  const isImperial = variant === "imperial";
  const href = slug ? `/autor/${slug}` : `/perfil/${authorId}`;

  return (
    <article
      className={`flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${
        isImperial
          ? "border border-imperial-gold/20 bg-imperial-surface/60 hover:border-imperial-gold/35 hover:shadow-[0_8px_24px_-8px_rgba(212,175,55,0.15)]"
          : "border border-amber-900/10 bg-white shadow-editorial hover:shadow-editorial-lg"
      }`}
    >
      <div className="flex items-start gap-4">
        <Link href={href} className="shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-gold/20"
            />
          ) : (
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-md ${avatarColor}`}
            >
              {initials}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            className={`font-serif text-lg font-bold ${isImperial ? "text-gold-cream hover:text-imperial-gold" : "text-ink hover:text-terracotta"}`}
          >
            {name}
          </Link>
          <p className={`mt-0.5 text-xs ${isImperial ? "text-gold-cream/60" : "text-muted"}`}>
            {bookCount} historias en el Imperio
          </p>
          {bio && (
            <p
              className={`mt-2 text-sm leading-relaxed line-clamp-3 ${isImperial ? "text-gold-cream/75" : "text-muted"}`}
            >
              {bio}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
            isImperial
              ? "border-imperial-gold/40 text-imperial-gold hover:bg-imperial-gold/15"
              : "border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-white"
          }`}
        >
          Ver perfil
        </Link>
        <FollowAuthorButton authorId={authorId} redirectPath={href} />
      </div>
    </article>
  );
}
