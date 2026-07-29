import { pedroAmorCafeChapters } from "./pedro-amor-cafe-chapters";

export type Genre = "Romance" | "Fantasía" | "Terror" | "Ciencia Ficción";

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId: string;
  genre: Genre;
  rating: number;
  coverGradient: string;
  coverAccent: string;
  synopsis: string;
  coverUrl?: string;
  membershipPrice?: number;
}

export interface Author {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  bookCount: number;
  slug?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  isPremium: boolean;
  content: string[];
}

export const pedroAmorCafeBook: Book = {
  id: "pedro-amor-cafe",
  title: "Amor con aroma a café",
  author: "Pedro García Martínez",
  authorId: "author-pedro-garcia",
  genre: "Romance",
  rating: 4.8,
  coverGradient: "from-amber-700 via-orange-500 to-amber-900",
  coverAccent: "#D27C5A",
  coverUrl: "/authors/pedro-garcia-martinez/amor-aroma-cafe-cover.png",
  synopsis:
    "Pedro y Kaori intentan sostener una relación construida sobre pequeños gestos y la ternura de lo cotidiano. Sin embargo, su refugio doméstico se ve amenazado por la realidad: mientras él lidia con la precariedad laboral, ella enfrenta en secreto el acoso de un jefe depredador.",
  membershipPrice: 5,
};

/** Obra en primera plana del home */
export const featuredBook = pedroAmorCafeBook;

export const sideBooks: Book[] = [
  {
    id: "side-1",
    title: "Susurros del Mar",
    author: "L. Mendoza",
    authorId: "author-2",
    genre: "Romance",
    rating: 4.6,
    coverGradient: "from-rose-400 via-pink-500 to-red-400",
    coverAccent: "#E11D48",
    synopsis:
      "Una cartógrafa solitaria y un marinero en busca de redención se cruzan en un puerto olvidado por el tiempo. Entre mareas impredecibles y promesas a medias, descubrirán que algunos mapas no trazan rutas, sino corazones.",
  },
  {
    id: "side-2",
    title: "Nébula Oscura",
    author: "R. Vega",
    authorId: "author-5",
    genre: "Ciencia Ficción",
    rating: 4.7,
    coverGradient: "from-indigo-600 via-purple-600 to-violet-800",
    coverAccent: "#6366F1",
    synopsis:
      "A bordo de la nave exploradora Nébula, la comandante Solís y su tripulación reciben una señal desde el borde del sistema. Lo que encuentran allí desafía las leyes de la física y la lealtad de quienes creyeron conocer el universo.",
  },
];

export const genres: { id: Genre; icon: string; color: string }[] = [
  { id: "Romance", icon: "heart", color: "bg-rose-100 text-rose-600 hover:bg-rose-200" },
  { id: "Fantasía", icon: "sparkles", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" },
  { id: "Terror", icon: "ghost", color: "bg-slate-200 text-slate-700 hover:bg-slate-300" },
  { id: "Ciencia Ficción", icon: "rocket", color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200" },
];

export const books: Book[] = [
  {
    id: "book-1",
    title: "Cartas desde el Olvido",
    author: "Ana Beltrán",
    authorId: "author-2",
    genre: "Romance",
    rating: 4.8,
    coverGradient: "from-rose-300 via-rose-400 to-pink-500",
    coverAccent: "#FB7185",
    synopsis:
      "Cada semana, una carta anónima llega al café de Clara. Sin remitente, sin explicación, solo palabras que parecen conocer sus miedos mejor que ella misma. Cuando decide responder, abre una puerta hacia un pasado que creía enterrado.",
  },
  {
    id: "book-2",
    title: "El Último Dragón",
    author: "Carlos Ruiz",
    authorId: "author-3",
    genre: "Fantasía",
    rating: 4.9,
    coverGradient: "from-emerald-600 via-teal-600 to-cyan-700",
    coverAccent: "#14B8A6",
    synopsis:
      "Dicen que el último dragón duerme bajo la montaña de Kael. Cuando la guerra vuelve a cruzar las fronteras del reino, un escudero sin nombre emprende la misión imposible de despertarlo antes de que sea demasiado tarde.",
  },
  {
    id: "book-3",
    title: "La Casa Vacía",
    author: "Elena Morales",
    authorId: "author-4",
    genre: "Terror",
    rating: 4.5,
    coverGradient: "from-gray-700 via-gray-800 to-black",
    coverAccent: "#374151",
    synopsis:
      "La herencia incluía una casa en el pueblo donde nadie habla del invierno de 1987. Al entrar por primera vez, Martín encuentra muebles cubiertos, relojes detenidos y huellas que no deberían existir en el polvo.",
  },
  {
    id: "book-4",
    title: "Horizonte 2087",
    author: "Diego Fuentes",
    authorId: "author-5",
    genre: "Ciencia Ficción",
    rating: 4.7,
    coverGradient: "from-blue-600 via-indigo-700 to-purple-800",
    coverAccent: "#4F46E5",
    synopsis:
      "En una ciudad flotante sobre un océano tóxico, la ingeniera Noa descubre que el sistema que mantiene a flote a millones de personas está fallando. Tiene setenta y dos horas para convencer a quienes mandan de que el cielo también puede caerse.",
  },
  {
    id: "book-5",
    title: "Verano en Lisboa",
    author: "María Solís",
    authorId: "author-2",
    genre: "Romance",
    rating: 4.6,
    coverGradient: "from-orange-300 via-amber-400 to-yellow-500",
    coverAccent: "#F59E0B",
    synopsis:
      "Un intercambio de verano, un apartamento compartido y dos personas que juraron no volver a enamorarse. Lisboa huele a azulejos calientes y decisiones que no se pueden deshacer.",
  },
  {
    id: "book-6",
    title: "Reino de Cenizas",
    author: "Javier Ortiz",
    authorId: "author-3",
    genre: "Fantasía",
    rating: 4.8,
    coverGradient: "from-red-700 via-orange-800 to-amber-900",
    coverAccent: "#DC2626",
    synopsis:
      "Tras la caída del trono de obsidiana, los seis reinos sobrevivientes negocian paz sobre un mapa hecho de cenizas. Una princesa exiliada, un general sin ejército y una profecía incompleta son lo único que queda entre el equilibrio y la guerra total.",
  },
];

export const topAuthors: Author[] = [
  { id: "author-1", name: "M. García", initials: "MG", avatarColor: "bg-terracotta", bookCount: 12 },
  { id: "author-pedro-garcia", name: "Pedro García Martínez", initials: "PG", avatarColor: "bg-amber-700", bookCount: 1, slug: "pedro-garcia-martinez" },
  { id: "author-2", name: "Ana Beltrán", initials: "AB", avatarColor: "bg-rose-400", bookCount: 8 },
  { id: "author-3", name: "Carlos Ruiz", initials: "CR", avatarColor: "bg-emerald-500", bookCount: 6 },
  { id: "author-4", name: "Elena Morales", initials: "EM", avatarColor: "bg-slate-600", bookCount: 5 },
  { id: "author-5", name: "Diego Fuentes", initials: "DF", avatarColor: "bg-indigo-500", bookCount: 4 },
];

export const chapters: Chapter[] = [
  {
    id: "featured-1-cap-1",
    bookId: "featured-1",
    number: 1,
    title: "El manuscrito prohibido",
    isPremium: false,
    content: [
      "El polvo de los estantes antiguos se levantaba con cada paso de Elara, como si la biblioteca misma respirara a su paso. Llevaba doce años entre esos muros de piedra gris, catalogando volúmenes que nadie pedía y devolviendo silencio a los rincones donde el imperio prefería que la memoria se durmiera.",
      "Esa mañana, sin embargo, algo era distinto. Un cajón sin etiqueta había aparecido en el sótano, escondido detrás de estanterías que nadie movía desde la Gran Prohibición. El candado estaba oxidado, pero la cerradura cedió con un susurro que le erizó la nuca.",
      "Dentro no había libros encuadernados, sino hojas sueltas escritas con tinta azul que brillaba tenuemente bajo la luz de la lámpara. La primera línea decía: <em>«Cuando la última vela del reino se apague, la rebeldía no nacerá con espada, sino con palabra.»</em>",
      "Elara cerró el cajón de golpe, con el corazón martilleando. Sabía lo que significaba encontrar algo así: la pena de muerte, o peor, el olvido forzado en las minas de sal del norte. Aun así, guardó una hoja en el dobladillo de su vestido. Algo en esas palabras la llamaba más fuerte que el miedo.",
    ],
  },
  {
    id: "featured-1-cap-2",
    bookId: "featured-1",
    number: 2,
    title: "Sombras en el palacio",
    isPremium: false,
    content: [
      "Valdris despertaba con el repique de las campanas del templo imperial. Desde la ventana de su habitación en la casa de huéspedes, Elara veía las torres doradas brillar bajo un sol pálido, hermosas y mentirosas como todo lo que el régimen construía.",
      "Había ido al palacio bajo el pretexto de entregar un inventario de textos recuperados. En realidad, buscaba al archivero mayor, el único hombre que, según rumores, recordaba la era anterior a la prohibición de la magia.",
      "Lo encontró en una sala lateral, rodeado de pergaminos que olían a cera y secretos. No levantó la vista de inmediato. «Sabía que alguien vendría por el manuscrito», murmuró. «Llevaba esperando veinte años.»",
      "Elara no respondió. No hacía falta. El archivero deslizó un sobre hacia ella con un sello que no pertenecía al imperio. «Lee esto esta noche. Mañana quizá ya sea tarde.» Cuando salió del palacio, sintió por primera vez que no estaba sola en la rebelión que aún no tenía nombre.",
    ],
  },
  {
    id: "featured-1-cap-3",
    bookId: "featured-1",
    number: 3,
    title: "La chispa del amanecer",
    isPremium: true,
    content: [
      "El sobre contenía un mapa de túneles bajo la ciudad y una lista de nombres: bibliotecarios, herreros, estudiantes, una curandera del barrio bajo. Gente común. Gente invisible. Gente peligrosa para un imperio que sobrevivía controlando lo que se podía leer y lo que se podía soñar.",
      "Elara pasó la noche sin dormir, repasando cada nombre, cada calle, cada posibilidad. Al amanecer, tomó una decisión que no podía deshacer: encendería la primera vela no en un templo, sino en la plaza del mercado, frente a todos.",
      "La multitud llegó sin ser convocada, como si el aire mismo hubiera susurrado la hora. Elara leyó en voz alta la primera página del manuscrito. Las palabras resonaron entre puestos de especias y telas, y por un instante el imperio pareció más pequeño que una voz levantándose contra el silencio.",
      "Entonces sonaron los cuernos de la guardia. Las puertas de la plaza se cerraron. El amanecer de la rebeldía había comenzado, y con él, la cuenta atrás hacia todo lo que Elara amaba y temía perder.",
    ],
  },
  {
    id: "featured-1-cap-4",
    bookId: "featured-1",
    number: 4,
    title: "El precio del silencio",
    isPremium: true,
    content: [
      "La prisión de Valdris no tenía ventanas, pero tenía ecos. Elara los escuchaba en la oscuridad: pasos, llaves, susurros de otros prisioneros que habían creído, como ella, que las palabras podían cambiar un reino.",
      "El archivero no había sido tan afortunado. Lo encontraron muerto en su estudio, con el sello del sobre aún en la mano. El mensaje era claro: nadie que tocara el manuscrito quedaría impune.",
      "Una guardia joven, demasiado joven para la crueldad que llevaba en el uniforme, se detuvo frente a su celda. «Mi abuela estuvo en la plaza», dijo sin mirarla. «Leyó contigo.» Deslizó un trozo de pan y, con él, una llave oxidada que no debería existir.",
      "Elara comprendió entonces que la rebeldía no era un manuscrito ni un discurso. Era una red de manos invisibles que seguían eligiendo, una y otra vez, no callar.",
    ],
  },
  {
    id: "featured-1-cap-5",
    bookId: "featured-1",
    number: 5,
    title: "Fuego bajo las murallas",
    isPremium: true,
    content: [
      "La fuga la llevó por túneles que olían a humedad y memoria. Emergió en el barrio bajo justo cuando la ciudad ardía en dos mitades: la que obedecía y la que ya no podía fingir obediencia.",
      "Los nombres de la lista se convirtieron en rostros, en martillos, en antorchas. No era un ejército. Era algo más difícil de aplastar: una comunidad que había recordado cómo leer entre líneas y cómo resistir sin espada.",
      "En lo alto de la muralla norte, Elara alzó el manuscrito completo por fin reunido. El viento pasó las páginas como si quisiera leerlas antes que nadie. Detrás de ella, Valdris ardía. Delante, el amanecer.",
      "Y en ese amanecer, por primera vez en tres generaciones, la magia —o lo que el imperio llamaba magia— volvió a ser simplemente verdad.",
    ],
  },
  {
    id: "book-1-cap-1",
    bookId: "book-1",
    number: 1,
    title: "La primera carta",
    isPremium: false,
    content: [
      "Clara encontró la carta bajo la puerta del café antes de abrir. No tenía sello ni dirección, solo su nombre escrito con una caligrafía que le resultó extrañamente familiar.",
      "«Sé que aún te cuesta confiar en los martes», decía la primera línea. Martes. Hacía años que no oía esa palabra con tanta precisión.",
      "Pasó el día sirviendo espressos y sonrisas prestadas, pero la carta no dejó de quemarle el bolsillo del delantal. Al cerrar, la leyó de nuevo bajo la luz amarilla del letrero de neón.",
      "Al final, una frase: «Si quieres respuestas, deja tu respuesta en el buzón azul del muelle.» Clara miró la calle vacía y pensó que tal vez, por primera vez en mucho tiempo, no estaba sola.",
    ],
  },
  {
    id: "book-1-cap-2",
    bookId: "book-1",
    number: 2,
    title: "El buzón azul",
    isPremium: false,
    content: [
      "El muelle olía a sal y a diesel. El buzón azul estaba oxidado en las esquinas, pero aún tenía la cerradura intacta. Clara dejó su respuesta con manos temblorosas.",
      "«No sé quién eres», escribió, «pero sé que me conoces mejor de lo que debería.»",
      "Esperó tres días. La segunda carta llegó un jueves, como si quien escribía conociera su horario mejor que ella misma.",
      "Esta vez, la caligrafía temblaba levemente. «Perdóname por el miedo. Creí que el tiempo bastaba para olvidar. Me equivoqué.»",
    ],
  },
  {
    id: "book-1-cap-3",
    bookId: "book-1",
    number: 3,
    title: "Quien escribe",
    isPremium: true,
    content: [
      "Clara siguió el rastro de las cartas hasta un taller de reparación de relojes en la calle posterior. Detrás del mostrador, entre engranajes y cristales rotos, estaba él.",
      "No lo reconoció de inmediato. El tiempo había dibujado líneas nuevas en un rostro que una vez guardó en cada detalle.",
      "«Pensé que nunca volverías a leerme», dijo él. Y Clara supo, con una mezcla de alivio y rabia, que las cartas no eran un juego romántico. Eran una segunda oportunidad disfrazada de misterio.",
      "El silencio entre ellos pesó como un reloj detenido. Finalmente, Clara habló: «Entonces empieza de nuevo. Sin secretos.»",
    ],
  },
  ...pedroAmorCafeChapters,
];

export const allBooks: Book[] = [featuredBook, ...sideBooks, ...books];

export function getBookById(id: string): Book | undefined {
  return allBooks.find((book) => book.id === id);
}

export function getAuthorById(id: string): Author | undefined {
  return topAuthors.find((author) => author.id === id);
}

export function getChaptersByBookId(bookId: string): Chapter[] {
  return chapters
    .filter((chapter) => chapter.bookId === bookId)
    .sort((a, b) => a.number - b.number);
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

export function getAdjacentChapters(chapterId: string): {
  prev: Chapter | null;
  next: Chapter | null;
} {
  const current = getChapterById(chapterId);
  if (!current) return { prev: null, next: null };

  const bookChapters = getChaptersByBookId(current.bookId);
  const index = bookChapters.findIndex((c) => c.id === chapterId);

  return {
    prev: index > 0 ? bookChapters[index - 1] : null,
    next: index < bookChapters.length - 1 ? bookChapters[index + 1] : null,
  };
}

export function getFirstChapter(bookId: string): Chapter | undefined {
  return getChaptersByBookId(bookId)[0];
}
