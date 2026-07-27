"use client";

import { useMemo, useState } from "react";
import { Book } from "@/data/mock";
import type { BookMeta } from "@/lib/book-meta";
import { BookGrid } from "@/components/home/BookGrid";
import {
  CategoryFilter,
  GenreFilter,
  matchesCategoryFilter,
} from "@/components/home/GenreFilter";

interface HomeCatalogProps {
  books: Book[];
  metaByBookId: Record<string, BookMeta>;
  excludeBookId?: string;
}

export function HomeCatalog({ books, metaByBookId, excludeBookId }: HomeCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("Todas");

  const catalogBooks = useMemo(() => {
    const base = excludeBookId ? books.filter((book) => book.id !== excludeBookId) : books;
    return base.filter((book) => matchesCategoryFilter(book.genre, activeFilter));
  }, [activeFilter, books, excludeBookId]);

  return (
    <div className="space-y-8">
      <GenreFilter active={activeFilter} onChange={setActiveFilter} />
      <BookGrid books={catalogBooks} metaByBookId={metaByBookId} />
    </div>
  );
}
