import type { AuthorPublicProfile } from "@/types/author-profile";

export const authorProfiles: AuthorPublicProfile[] = [
  {
    id: "author-pedro-garcia",
    slug: "pedro-garcia-martinez",
    name: "Pedro García Martínez",
    badge: "✨ Autor Fundador",
    bio: "Nacido en México (1988), pedagogo y apasionado de las letras desde los 16 años. Su narrativa explora la ternura cotidiana, la precariedad laboral y los silencios que sostienen — o amenazan — el amor contemporáneo.",
    photoUrl: "/authors/pedro-garcia-martinez/profile.png",
    social: {
      instagram: "https://www.instagram.com/pedrogarciamartinez16?igsh=emJ5dHFqeTF6ZWR0",
    },
    featuredWork: {
      bookId: "pedro-amor-cafe",
      title: "Amor con aroma a café",
      genres: ["Drama urbano", "Romance contemporáneo"],
      isbn: "978-607-948347",
      synopsis:
        "Pedro y Kaori intentan sostener una relación construida sobre pequeños gestos y la ternura de lo cotidiano. Sin embargo, su refugio doméstico se ve amenazado por la realidad: mientras él lidia con la precariedad laboral, ella enfrenta en secreto el acoso de un jefe depredador. Entre silencios y «cenas tregua», la pareja lucha por mantener a flote su amor antes de que el agotamiento y las verdades no dichas terminen por romper su equilibrio.",
      coverUrl: "/authors/pedro-garcia-martinez/amor-aroma-cafe-cover.png",
      firstChapterId: "pedro-amor-cafe-cap-1",
      freeChaptersCount: 3,
      membershipPriceUsd: 5,
    },
    upcomingWorks: [
      {
        id: "pedro-otros-mundos",
        title: "Los otros mundos",
        genre: "Fantasía cósmica",
        status: "in-progress",
        coverGradient: "from-indigo-900 via-violet-800 to-purple-950",
        coverAccent: "#6366F1",
        teaser: "Una odisea entre dimensiones donde la memoria es el último mapa del universo.",
      },
    ],
  },
];

export function getAuthorProfileBySlug(slug: string): AuthorPublicProfile | undefined {
  return authorProfiles.find((profile) => profile.slug === slug);
}

export function getAuthorProfileById(id: string): AuthorPublicProfile | undefined {
  return authorProfiles.find((profile) => profile.id === id);
}

export function getAllAuthorSlugs(): string[] {
  return authorProfiles.map((profile) => profile.slug);
}
