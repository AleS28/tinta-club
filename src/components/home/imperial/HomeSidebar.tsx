import Link from "next/link";
import { Book } from "@/data/mock";
import { BookCover } from "@/components/ui/BookCover";
import { topAuthors } from "@/data/mock";
import { getAuthorProfileBySlug } from "@/data/author-profiles";

const COMMUNITY_POSTS = [
  {
    author: "Lectores del Imperio",
    snippet: "¡Nueva reseña de Amor con aroma a café!",
    posts: 12,
    avatar: "/authors/pedro-garcia-martinez/profile.png",
  },
  {
    author: "Will Flechas",
    snippet: "Capítulo nuevo de La Chica del Café disponible.",
    posts: 8,
    avatar: "/authors/will-flechas/profile.png",
  },
  {
    author: "Comunidad Discord",
    snippet: "Charla de terror psicológico este viernes.",
    posts: 24,
    avatar: "/authors/pedro-garcia-martinez/profile.png",
  },
] as const;

interface HomeSidebarProps {
  books: Book[];
}

export function HomeSidebar({ books }: HomeSidebarProps) {
  const recommended = [...books].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-imperial-gold/20 bg-imperial-surface/60 p-4 backdrop-blur-sm">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-imperial-gold">
          Recomendado por el Imperio
        </h2>
        <div className="home-scroll-snap-x mt-4 flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {recommended.map((book) => (
            <Link
              key={book.id}
              href={`/libro/${book.id}`}
              className="group flex w-[88px] shrink-0 flex-col items-center gap-2 lg:w-full lg:flex-row lg:items-center"
            >
              <BookCover
                book={book}
                className="aspect-[2/3] w-[72px] shrink-0 shadow-md ring-1 ring-imperial-gold/20 transition-transform group-hover:scale-105 lg:w-14"
              />
              <div className="hidden min-w-0 lg:block">
                <p className="font-display text-sm font-bold leading-snug text-gold-cream line-clamp-2 group-hover:text-imperial-gold">
                  {book.title}
                </p>
                <p className="text-[11px] text-gold-cream/60">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-imperial-gold/20 bg-imperial-surface/60 p-4 backdrop-blur-sm">
        <div
          className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-[0.04]"
          style={{
            backgroundImage: "url('/textures/literary-pattern.png')",
            backgroundSize: "120px auto",
          }}
          aria-hidden
        />
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-imperial-gold">
          Comunidad
        </h2>
        <ul className="mt-4 space-y-3">
          {COMMUNITY_POSTS.map((post) => (
            <li key={post.snippet} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.avatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-imperial-gold/25"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gold-cream">{post.author}</p>
                <p className="text-[11px] text-gold-cream/65 line-clamp-2">{post.snippet}</p>
                <p className="mt-0.5 text-[10px] text-imperial-gold/70">{post.posts} publicaciones</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/conocenos"
          className="mt-4 inline-flex text-xs font-semibold text-imperial-gold hover:text-gold-light"
        >
          Ver comunidad →
        </Link>
      </div>

      <div className="rounded-2xl border border-imperial-gold/20 bg-imperial-surface/60 p-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-imperial-gold">
          Autores destacados
        </h2>
        <ul className="mt-3 space-y-2">
          {topAuthors.slice(0, 3).map((author) => {
            const profile = author.slug ? getAuthorProfileBySlug(author.slug) : undefined;
            const href = author.slug ? `/autor/${author.slug}` : `/perfil/${author.id}`;
            return (
              <li key={author.id}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-imperial-gold/10"
                >
                  {profile?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photoUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-imperial-gold/25"
                    />
                  ) : (
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${author.avatarColor}`}
                    >
                      {author.initials}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gold-cream">
                    {profile?.name ?? author.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
