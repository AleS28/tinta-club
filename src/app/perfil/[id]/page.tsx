import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorProfileHeader } from "@/components/perfil/AuthorProfileHeader";
import { BookCard } from "@/components/home/BookCard";
import { getBooksByAuthorId } from "@/lib/db";
import { getPublicAuthorProfile } from "@/lib/users";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { id } = await params;
  const author = await getPublicAuthorProfile(id);
  if (!author) return { title: "Autor no encontrado" };

  return {
    title: `${author.displayName} — Tinta Club`,
    description: author.bio,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const author = await getPublicAuthorProfile(id);

  if (!author) notFound();

  const books = await getBooksByAuthorId(id);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <AuthorProfileHeader author={author} bookCount={books.length} />

        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold text-ink">Obras publicadas</h2>
          <p className="mt-1 text-sm text-muted">
            {books.length === 0
              ? "Este autor aún no ha publicado obras."
              : `${books.length} ${books.length === 1 ? "historia disponible" : "historias disponibles"}`}
          </p>

          {books.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-sidebar bg-white/50 px-6 py-10 text-center text-sm text-muted">
              Pronto habrá nuevas historias de {author.displayName}.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
