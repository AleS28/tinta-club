import { BookOpen, Ban, CreditCard, XCircle } from "lucide-react";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";
import { LegalHighlightGrid } from "@/components/legal/LegalHighlightGrid";
import { BRAND_NAME } from "@/lib/brand";
import { formatSubscriptionPrice } from "@/lib/subscription";

export const metadata = {
  title: `Términos para Lectores y Suscriptores — ${BRAND_NAME}`,
  description:
    "Condiciones de uso, acceso gratuito, suscripción premium y políticas de lectura en El Imperio de la Tinta.",
};

export default function TerminosLectoresPage() {
  const membershipPrice = formatSubscriptionPrice();

  return (
    <LegalDocLayout
      activeDoc="terminos-lectores"
      title="Términos para Lectores y Suscriptores"
      subtitle={`Condiciones de uso de la plataforma ${BRAND_NAME}. Última actualización: julio de 2026.`}
    >
      <LegalHighlightGrid
        items={[
          {
            icon: BookOpen,
            title: "Acceso gratuito",
            description:
              "Los capítulos 1 al 3 de cada obra participante están disponibles sin costo para que conozcas la historia antes de suscribirte.",
            tone: "gold",
          },
          {
            icon: CreditCard,
            title: "Suscripción Premium",
            description:
              `Desde el capítulo 4 en adelante, el acceso completo requiere una membresía de ${membershipPrice} USD/mes en toda la plataforma.`,
            tone: "terracotta",
          },
          {
            icon: XCircle,
            title: "Cancelación libre",
            description:
              "Puedes cancelar tu suscripción en cualquier momento desde tu perfil, sin penalización ni permanencia mínima.",
            tone: "gold",
          },
          {
            icon: Ban,
            title: "Contenido protegido",
            description:
              "Queda prohibida la copia, descarga no autorizada, redistribución masiva o publicación del contenido fuera de la plataforma.",
            tone: "terracotta",
          },
        ]}
      />

      <h2>1. Aceptación de los términos</h2>
      <p>
        Al registrarte, iniciar sesión o utilizar {BRAND_NAME}, aceptas estos Términos para Lectores y
        Suscriptores. Si no estás de acuerdo, te pedimos no utilizar la plataforma.
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        {BRAND_NAME} es una plataforma digital de narrativa independiente en español que permite a los
        lectores descubrir obras, leer capítulos en línea y, opcionalmente, suscribirse para acceder a
        contenido premium de autores participantes.
      </p>

      <h2>3. Acceso gratuito y contenido premium</h2>
      <p>
        Salvo indicación contraria en la ficha de cada obra, los <strong>capítulos 1 al 3</strong> se
        ofrecen de forma gratuita con el fin de que el lector evalúe la historia. A partir del{" "}
        <strong>capítulo 4</strong>, el acceso al resto de la obra puede requerir una suscripción premium
        activa, cuyo precio referencial es de <strong>{membershipPrice} USD/mes</strong>, sujeto a actualización con
        aviso previo en la plataforma.
      </p>

      <h2>4. Suscripción y pagos</h2>
      <p>
        La suscripción premium se renueva de forma periódica según el plan contratado. Al suscribirte,
        autorizas el cobro recurrente hasta que canceles. Los precios pueden variar; cualquier cambio
        aplicará a periodos de facturación futuros.
      </p>

      <h2>5. Cancelación</h2>
      <p>
        Puedes cancelar tu suscripción en cualquier momento desde la sección de perfil o biblioteca. La
        cancelación surte efecto al final del periodo ya pagado. No hay penalización por cancelación
        anticipada ni cláusulas de permanencia mínima.
      </p>

      <h2>6. Uso permitido del contenido</h2>
      <p>
        El contenido literario publicado en la plataforma está protegido por derechos de autor. Se te
        concede una licencia personal, limitada, no exclusiva e intransferible para leer las obras
        dentro de {BRAND_NAME}.
      </p>
      <p>Queda expresamente prohibido:</p>
      <ul>
        <li>Copiar, reproducir o redistribuir capítulos completos fuera de la plataforma.</li>
        <li>Realizar capturas masivas, scraping o extracción automatizada de textos.</li>
        <li>Compartir credenciales de acceso o el contenido premium con terceros.</li>
        <li>Publicar fragmentos sustanciales en redes, blogs o foros sin autorización del autor.</li>
      </ul>

      <h2>7. Cuenta de usuario</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tu cuenta y de toda actividad realizada bajo
        ella. Debes proporcionar información veraz y notificar cualquier uso no autorizado.
      </p>

      <h2>8. Conducta del lector</h2>
      <p>
        Te comprometes a utilizar la plataforma de forma respetuosa, sin acosar a autores u otros
        usuarios, ni intentar vulnerar medidas técnicas de protección del contenido (marcas de agua,
        paywalls, controles de acceso, etc.).
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        {BRAND_NAME} actúa como intermediario tecnológico entre autores y lectores. No garantizamos
        disponibilidad ininterrumpida del servicio. En la medida permitida por la ley, la plataforma no
        será responsable por daños indirectos derivados del uso o imposibilidad de uso del servicio.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos publicando una nueva versión en esta página. El uso continuado
        de la plataforma tras un cambio implica la aceptación de los términos revisados.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para consultas sobre estos términos, utiliza el formulario en la página{" "}
        <a href="/conocenos">Conócenos</a> o los canales oficiales de {BRAND_NAME}.
      </p>
    </LegalDocLayout>
  );
}
