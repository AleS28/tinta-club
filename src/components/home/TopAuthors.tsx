import Link from "next/link";
import { Crown } from "lucide-react";
import { Author } from "@/data/mock";

interface TopAuthorsProps {
  authors: Author[];
}

function getAuthorHref(author: Author): string {
  return author.slug ? `/autor/${author.slug}` : `/perfil/${author.id}`;
}

export function TopAuthors({ authors }: TopAuthorsProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-900/10 bg-white p-5 shadow-editorial">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-gold" />
        <h2 className="font-serif text-lg font-bold text-ink">Top Autores del Imperio</h2>
      </div>

      <ul className="mt-4 space-y-3">
        {authors.map((author, index) => (
          <li
            key={author.id}
            className="flex items-center gap-3 rounded-xl border border-amber-900/5 bg-sidebar/50 p-2.5 shadow-inset transition-all duration-300 hover:border-gold/25 hover:bg-gold-cream/20"
          >
            <span className="w-4 text-xs font-bold text-gold">{index + 1}</span>
            <Link
              href={getAuthorHref(author)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm transition-transform duration-300 hover:scale-105 ${author.avatarColor}`}
            >
              {author.initials}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={getAuthorHref(author)} className="block truncate text-sm font-medium text-ink hover:text-terracotta">
                {author.name}
              </Link>
              <p className="text-xs text-muted">{author.bookCount} historias</p>
            </div>
            <Link
              href={getAuthorHref(author)}
              className="shrink-0 rounded-full border border-terracotta/30 px-2.5 py-1 text-xs font-medium text-terracotta transition-all duration-300 hover:scale-105 hover:border-terracotta hover:bg-terracotta hover:text-white"
            >
              Perfil
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
