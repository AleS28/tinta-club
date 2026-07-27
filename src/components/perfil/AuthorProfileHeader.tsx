import Link from "next/link";
import { BookOpen, Calendar, Feather } from "lucide-react";
import type { PublicAuthorProfile } from "@/types/author";
import { FollowAuthorButton } from "@/components/perfil/FollowAuthorButton";

interface AuthorProfileHeaderProps {
  author: PublicAuthorProfile;
  bookCount: number;
}

export function AuthorProfileHeader({ author, bookCount }: AuthorProfileHeaderProps) {
  const initials = author.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="rounded-2xl border border-sidebar bg-white/70 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {author.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.photoURL}
            alt={author.displayName}
            className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-sidebar"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-terracotta text-3xl font-bold text-white shadow-md ring-4 ring-sidebar">
            {initials}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {author.isAuthor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
                <Feather className="h-3.5 w-3.5" />
                Autor del Imperio
              </span>
            )}
          </div>

          <h1 className="mt-3 font-serif text-3xl font-bold text-ink">{author.displayName}</h1>

          {author.joinedAt && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted sm:justify-start">
              <Calendar className="h-4 w-4" />
              En el Imperio desde {author.joinedAt}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/80">
            {author.bio ?? "Autor de narrativa independiente en español."}
          </p>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted sm:justify-start">
            <BookOpen className="h-4 w-4" />
            {bookCount} {bookCount === 1 ? "obra publicada" : "obras publicadas"}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <FollowAuthorButton authorId={author.id} />
            <Link
              href="/"
              className="rounded-full border border-sidebar px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Explorar más historias
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
