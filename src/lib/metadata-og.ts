import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { absoluteAssetUrl, absoluteUrl, getAppUrl } from "@/lib/app-url";
import type { Book } from "@/data/mock";

export function buildSiteOpenGraph(): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "es_ES",
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    url: getAppUrl(),
  };
}

export function buildBookMetadata(book: Book): Metadata {
  const title = `${book.title} — ${BRAND_NAME}`;
  const description = book.synopsis.slice(0, 200).trim();
  const url = absoluteUrl(`/libro/${book.id}`);
  const images = book.coverUrl
    ? [{ url: absoluteAssetUrl(book.coverUrl), alt: book.title }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}

export function buildChapterMetadata(
  chapterTitle: string,
  book: Book,
  chapterId: string,
): Metadata {
  const title = `${chapterTitle} — ${book.title} | ${BRAND_NAME}`;
  const description = `Lee «${chapterTitle}» de ${book.author} en ${BRAND_NAME}.`;
  const url = absoluteUrl(`/leer/${chapterId}`);
  const images = book.coverUrl
    ? [{ url: absoluteAssetUrl(book.coverUrl), alt: book.title }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}
