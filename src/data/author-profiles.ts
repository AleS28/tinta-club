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
      membershipPriceUsd: 6.49,
    },
    upcomingWorks: [
      {
        id: "pedro-el-titere",
        title: "El Títere: La llamada de Nyarl'kthar",
        genre: "Terror psicológico · Horror cósmico",
        status: "published",
        coverUrl: "/authors/pedro-garcia-martinez/el-titere-cover.png",
        coverGradient: "from-slate-950 via-blue-950 to-stone-900",
        coverAccent: "#1E3A5F",
        bookId: "pedro-el-titere",
        firstChapterId: "pedro-el-titere-cap-1",
        freeChaptersCount: 3,
        teaser:
          "Una invitación inocente a una cabaña en la montaña se convierte en pesadilla cuando un títere de madera despierta una sombra antigua. Entre el lago, la medianoche y la llamada de Nyarl'kthar, el terror deja de ser leyenda.",
      },
    ],
  },
  {
    id: "author-will-flechas",
    slug: "will-flechas",
    name: "Will Flechas",
    badge: "✨ Autor Fundador",
    bio: "Autor colombiano de 46 años apasionado por el arte de contar historias. Creyente fiel de que los mejores libros se leen sin prisa, encuentra su inspiración en la serenidad de la naturaleza, una mesa compartida con buena comida y la calma que regala una copa de buen vino. Para Will, escribir es la forma perfecta de maridar la vida con la imaginación.",
    photoUrl: "/authors/will-flechas/profile.png",
    social: {},
    featuredWork: {
      bookId: "will-chica-cafe",
      title: "La chica del café",
      genres: ["Drama urbano", "Romance contemporáneo"],
      synopsis:
        "Un hombre solitario vive hipnotizado por la sonrisa de la barista que le sirve café los sábados. Entre el aroma del espresso, la timidez compartida y las ilusiones que lo mantienen respirando, descubre que a veces el amor —o la idea de amor— puede ser tan intenso como una taza recién servida.",
      coverUrl: "/authors/will-flechas/la-chica-del-cafe-cover.png",
      coverGradient: "from-stone-700 via-amber-900 to-stone-950",
      coverAccent: "#A16207",
      firstChapterId: "will-chica-cafe-cap-1",
      freeChaptersCount: 2,
      membershipPriceUsd: 6.49,
    },
    upcomingWorks: [
      {
        id: "will-whisky-por-favor",
        title: "Un whisky, por favor",
        genre: "Drama urbano",
        status: "published",
        coverUrl: "/authors/will-flechas/un-whisky-por-favor-cover.png",
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
  {
    id: "author-jose-luis-grimaldo",
    slug: "jose-luis-grimaldo",
    name: "José Luis Grimaldo",
    badge: "✨ Autor Fundador",
    bio: "Escritor mexicano nacido en 1993, considerado así mismo como escritor de medio tiempo. Con una narrativa profunda y apasionada con la diversidad de pensamiento, concentra su narrativa en las decisiones individuales y en su efecto en el mundo real. Cada palabra es como una nota, un color y un sabor único.",
    photoUrl: "/authors/jose-luis-grimaldo/profile.png",
    social: {},
    featuredWork: {
      bookId: "jose-odisea-robot-guerra",
      title: "Una odisea a través del tiempo: Un robot para la guerra",
      genres: ["Ciencia ficción", "Drama", "Robótica"],
      synopsis:
        "Satoshi es un niño brillante que crece entre mudanzas, la ausencia de su padre soldado y una amistad con Robert que parece no tener fin. Años después, su genio lo lleva a diseñar Artur, un robot humanoide capaz de rescatar vidas con una precisión casi humana. Pero cuando el gobierno quiere convertir su invento en herramienta de guerra, Satoshi deberá elegir entre el éxito, la seguridad de quienes ama y la convicción de que sus creaciones no deben servir para destruir. Una historia que cruza países, décadas y el límite entre lo que somos y lo que construimos.",
      coverUrl: "/authors/jose-luis-grimaldo/odisea-robot-guerra-cover.png",
      coverGradient: "from-slate-900 via-cyan-950 to-stone-950",
      coverAccent: "#22D3EE",
      firstChapterId: "jose-odisea-robot-guerra-cap-1",
      freeChaptersCount: 3,
      membershipPriceUsd: 6.49,
    },
    upcomingWorks: [],
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
