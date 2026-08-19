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
}: HomeAuthorCardProps) {
  const href = slug ? `/autor/${slug}` : `/perfil/${authorId}`;

  return (
    <article className="flex flex-col rounded-2xl border border-amber-900/10 bg-white p-5 shadow-editorial transition-all hover:-translate-y-0.5 hover:shadow-editorial-lg">
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
          <Link href={href} className="font-serif text-lg font-bold text-ink hover:text-terracotta">
            {name}
          </Link>
          <p className="mt-0.5 text-xs text-muted">{bookCount} historias en el Imperio</p>
          {bio && (
            <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">{bio}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="inline-flex rounded-full border border-terracotta/30 px-4 py-2 text-xs font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-white"
        >
          Ver perfil
        </Link>
        <FollowAuthorButton authorId={authorId} redirectPath={href} />
      </div>
    </article>
  );
}
