import { BookOpen, Feather, Heart, Users } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

const pillars = [
  {
    icon: Users,
    title: "Comunidad justa para autores",
    body: "Los creadores reciben el 70% de las ganancias y conservan el 100% de sus derechos. Creemos que quien escribe las historias debe ser quien más se beneficie de ellas.",
  },
  {
    icon: BookOpen,
    title: "Experiencia premium para lectores",
    body: "Una biblioteca curada, un lector elegante y capítulos que invitan a sumergirse. Cada detalle está pensado para honrar el acto de leer.",
  },
  {
    icon: Heart,
    title: "Narrativa independiente en español",
    body: "Voces nuevas, géneros diversos y historias que no encontrarás en las grandes editoriales. El Imperio es un refugio para quienes escriben y leen con pasión.",
  },
];

export function AboutContent() {
  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-imperial-dark shadow-editorial-lg">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 40%, rgba(139,58,43,0.45) 0%, transparent 55%), radial-gradient(ellipse at 70% 20%, rgba(201,169,97,0.12) 0%, transparent 40%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-imperial-dark via-[#3D2218] to-imperial-dark/90" />

        <div className="relative px-6 py-14 text-center sm:px-10 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <Feather className="h-8 w-8 text-gold-light" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold/80">
              Nuestra historia
            </p>
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-gold-cream sm:text-4xl lg:text-5xl">
              Dos hermanos, una visión:
              <span className="mt-2 block text-terracotta/90">
                El futuro de la narrativa independiente
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {BRAND_NAME} nació de una convicción compartida: las mejores historias merecen un
              hogar donde autores y lectores se encuentren en igualdad de condiciones, lejos de
              intermediarios que absorben el valor del talento.
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-editorial transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10">
              <Icon className="h-5 w-5 text-terracotta" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-amber-900/10 bg-sidebar/60 p-8 sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl font-bold text-ink sm:text-3xl">Nuestra misión</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold/50" />
          <p className="mt-6 font-serif text-lg leading-relaxed text-ink/85">
            Construir el imperio literario más justo del mundo hispanohablante: donde cada autor
            publique con dignidad, cada lector descubra historias extraordinarias y cada suscripción
            impulse directamente a quienes crean cultura.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full border border-gold/30 bg-gold-cream/40 px-4 py-2 text-sm font-semibold text-imperial-deep">
              70% de ganancias para autores
            </span>
            <span className="rounded-full border border-gold/30 bg-gold-cream/40 px-4 py-2 text-sm font-semibold text-imperial-deep">
              100% de derechos conservados
            </span>
            <span className="rounded-full border border-gold/30 bg-gold-cream/40 px-4 py-2 text-sm font-semibold text-imperial-deep">
              Lectura premium sin compromisos
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
