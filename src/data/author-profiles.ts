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
  {
    id: "author-will-flechas",
    slug: "will-flechas",
    name: "WillFlechas",
    badge: "✨ Autor Fundador",
    bio: "Escritor mexicano apasionado por narrar lo íntimo con crudeza y ternura. Su prosa explora la soledad urbana, la timidez compartida y esos pequeños instantes —como una sonrisa tras el mostrador— que pueden sostener o quebrar una vida.",
    photoUrl: "",
    social: {},
    featuredWork: {
      bookId: "will-chica-cafe",
      title: "La chica del café",
      genres: ["Drama urbano", "Romance contemporáneo"],
      synopsis:
        "Un hombre solitario vive hipnotizado por la sonrisa de la barista que le sirve café los sábados. Entre el aroma del espresso, la timidez compartida y las ilusiones que lo mantienen respirando, descubre que a veces el amor —o la idea de amor— puede ser tan intenso como una taza recién servida.",
      coverGradient: "from-stone-700 via-amber-900 to-stone-950",
      coverAccent: "#A16207",
      firstChapterId: "will-chica-cafe-cap-1",
      freeChaptersCount: 2,
      membershipPriceUsd: 5,
    },
    upcomingWorks: [
      {
        id: "will-whisky-por-favor",
        title: "Un whisky, por favor",
        genre: "Drama urbano",
        status: "published",
        coverGradient: "from-slate-800 via-amber-950 to-stone-900",
        coverAccent: "#92400E",
        bookId: "will-whisky-por-favor",
        firstChapterId: "will-whisky-cap-1",
        freeChaptersCount: 2,
        teaser:
          "Un muchacho escapa de las preguntas de su madre rumbo a un bar, arrastrando el recuerdo de su padre y una infancia que regresa en el último sorbo.",
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
