import { BookOpen, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export function SubscriptionCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-terracotta to-orange-700 p-6 text-white shadow-lg">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative">
        <Sparkles className="h-6 w-6 text-amber-200" />
        <h2 className="mt-3 font-serif text-xl font-bold leading-tight">
          Únete al {BRAND_NAME}
        </h2>
        <p className="mt-2 text-sm text-white/85">
          Acceso ilimitado a toda la biblioteca, apoya a autores independientes y descubre nuevos
          capítulos cada semana.
        </p>

        <ul className="mt-4 space-y-1.5 text-sm text-white/90">
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0" />
            Acceso a toda la biblioteca
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0" />
            Nuevos capítulos semanales
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0" />
            Apoya directamente a los autores
          </li>
        </ul>

        <button className="mt-5 w-full rounded-full bg-white py-2.5 text-sm font-bold uppercase tracking-wide text-terracotta transition-transform hover:scale-[1.02] active:scale-[0.98]">
          Comenzar por $4.99/mes
        </button>
      </div>
    </section>
  );
}
