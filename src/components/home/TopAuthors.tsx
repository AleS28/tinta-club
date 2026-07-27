import Link from "next/link";
import { Author } from "@/data/mock";

interface TopAuthorsProps {
  authors: Author[];
}

export function TopAuthors({ authors }: TopAuthorsProps) {
  return (
    <section className="rounded-2xl bg-sidebar p-5">
      <h2 className="font-serif text-lg font-bold text-ink">Top Autores del Imperio</h2>
      <ul className="mt-4 space-y-3">
        {authors.map((author, index) => (
          <li key={author.id} className="flex items-center gap-3">
            <span className="w-4 text-xs font-bold text-muted">{index + 1}</span>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${author.avatarColor}`}
            >
              {author.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{author.name}</p>
              <p className="text-xs text-muted">{author.bookCount} historias</p>
            </div>
            <Link
              href={`/perfil/${author.id}`}
              className="shrink-0 rounded-full border border-terracotta/30 px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-white"
            >
              Perfil
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
