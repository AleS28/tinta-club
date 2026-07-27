import { Book } from "@/data/mock";
import { BookCard } from "@/components/home/BookCard";

interface BookGridProps {
  books: Book[];
}

export function BookGrid({ books }: BookGridProps) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">Explorar Historias</h2>
      <p className="mt-1 text-sm text-muted">
        Descubre narrativa independiente en español
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
