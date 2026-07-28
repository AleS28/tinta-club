import { BadgeCheck, Percent, Lock, BookMarked } from "lucide-react";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";
import { LegalHighlightGrid } from "@/components/legal/LegalHighlightGrid";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Acuerdo de Publicación para Autores — ${BRAND_NAME}`,
  description:
    "Condiciones de publicación, reparto de ganancias, titularidad de derechos y exclusividad de contenido premium para autores.",
};

export default function AcuerdoAutoresPage() {
  return (
    <LegalDocLayout
      activeDoc="acuerdo-autores"
      title="Acuerdo de Publicación para Autores"
      subtitle={`Condiciones bajo las cuales los escritores publican en ${BRAND_NAME}. Última actualización: julio de 2026.`}
    >
      <LegalHighlightGrid
        items={[
          {
            icon: BadgeCheck,
            title: "100% titularidad",
            description:
              "Conservas en todo momento la titularidad y los derechos de autor sobre tus obras originales publicadas en la plataforma.",
            tone: "gold",
          },
          {
            icon: Percent,
            title: "Reparto 70% / 30%",
            description:
              "Sobre las ganancias netas de suscripciones atribuibles a tu obra, recibes el 70% como autor; la plataforma retiene el 30% por servicio tecnológico y operación.",
            tone: "terracotta",
          },
          {
            icon: Lock,
            title: "Exclusividad del contenido de pago",
            description:
              "Los capítulos premium (4 en adelante) no deben publicarse gratuitamente en Wattpad, blogs personales ni otras plataformas mientras estén activos en el Imperio.",
            tone: "terracotta",
          },
          {
            icon: BookMarked,
            title: "Libertad editorial externa",
            description:
              "Puedes publicar ediciones impresas y e-Books de pago en tiendas como Amazon KDP u otras, siempre respetando la exclusividad del contenido premium en línea.",
            tone: "gold",
          },
        ]}
      />

      <h2>1. Partes y objeto</h2>
      <p>
        El presente Acuerdo de Publicación regula la relación entre el autor («Autor») y {BRAND_NAME}
        («Plataforma») para la difusión digital de obras literarias originales mediante el modelo de
        lectura por capítulos y suscripción premium.
      </p>

      <h2>2. Titularidad y derechos de autor</h2>
      <p>
        El Autor declara ser titular legítimo de las obras que publica y conserva el{" "}
        <strong>100% de la titularidad y los derechos de autor</strong> sobre su contenido. Este acuerdo
        no implica cesión de propiedad intelectual, sino una licencia limitada otorgada a la Plataforma
        para alojar, mostrar y monetizar el contenido conforme a estas condiciones.
      </p>

      <h2>3. Licencia otorgada a la plataforma</h2>
      <p>
        El Autor otorga a {BRAND_NAME} una licencia no exclusiva, mundial y revocable para alojar,
        formatear, promocionar y distribuir digitalmente las obras dentro del ecosistema del Imperio,
        incluyendo medidas de protección técnica razonables (marca de agua, control de acceso, etc.).
      </p>

      <h2>4. Modelo de monetización y reparto</h2>
      <p>
        La Plataforma opera un modelo de suscripción premium. Sobre las{" "}
        <strong>ganancias netas</strong> atribuibles a la obra del Autor (después de comisiones de
        procesamiento de pago e impuestos aplicables), el reparto será:
      </p>
      <ul>
        <li>
          <strong>70% para el Autor</strong>
        </li>
        <li>
          <strong>30% para la Plataforma</strong>, en concepto de infraestructura, soporte, marketing
          base y operación del servicio
        </li>
      </ul>
      <p>
        Los capítulos 1 al 3 podrán ofrecerse gratuitamente como muestra. A partir del capítulo 4, el
        contenido se considera premium y queda sujeto a suscripción activa del lector.
      </p>

      <h2>5. Exclusividad del contenido de pago</h2>
      <p>
        Mientras una obra permanezca activa en {BRAND_NAME}, el Autor se compromete a no publicar de
        forma gratuita los <strong>capítulos premium (4 en adelante)</strong> en Wattpad, blogs
        personales, redes sociales ni otras plataformas digitales que compitan directamente con el modelo
        de suscripción del Imperio.
      </p>
      <p>
        Los capítulos de muestra (1 al 3) pueden utilizarse con fines promocionales limitados, siempre
        que no sustituyan la experiencia completa de lectura en la plataforma.
      </p>

      <h2>6. Publicaciones externas de pago</h2>
      <p>
        El Autor tiene <strong>libertad total</strong> para comercializar ediciones impresas, e-Books de
        pago y audiolibros en tiendas externas (Amazon KDP, Apple Books, etc.), siempre que:
      </p>
      <ul>
        <li>No publique gratuitamente en línea los capítulos premium mientras mantenga la obra activa aquí.</li>
        <li>Informe a la Plataforma sobre ediciones externas relevantes cuando sea razonablemente posible.</li>
        <li>Respete los derechos de terceros y la legislación aplicable en cada territorio.</li>
      </ul>

      <h2>7. Obligaciones del autor</h2>
      <p>El Autor se compromete a:</p>
      <ul>
        <li>Publicar contenido original o debidamente licenciado.</li>
        <li>Respetar las normas de convivencia y las leyes de propiedad intelectual.</li>
        <li>Mantener actualizados sus datos de contacto y fiscales para liquidaciones.</li>
        <li>No inducir a los lectores a eludir el paywall o compartir contenido premium.</li>
      </ul>

      <h2>8. Pagos al autor</h2>
      <p>
        Las liquidaciones se realizarán según el calendario y umbral mínimo que la Plataforma comunique
        en el panel del autor. El Autor es responsable de sus obligaciones fiscales en su jurisdicción.
      </p>

      <h2>9. Retirada de obras</h2>
      <p>
        El Autor puede solicitar la retirada de una obra conforme al procedimiento del panel de autor.
        La retirada no afectará derechos ya devengados ni obligaciones derivadas de suscripciones
        activas al momento de la solicitud, salvo acuerdo distinto.
      </p>

      <h2>10. Duración y terminación</h2>
      <p>
        Este acuerdo entra en vigor al publicar la primera obra en la Plataforma y permanece vigente
        mientras el Autor mantenga contenido activo. Cualquiera de las partes puede terminar la relación
        conforme a los procedimientos establecidos, sin perjuicio de los derechos adquiridos por
        lectores suscritos.
      </p>

      <h2>11. Modificaciones</h2>
      <p>
        La Plataforma podrá actualizar este acuerdo notificando a los autores con antelación razonable.
        La publicación continuada de contenido tras la entrada en vigor de una nueva versión implica su
        aceptación.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Para dudas sobre este acuerdo, utiliza el panel de autor, la página{" "}
        <a href="/conocenos">Conócenos</a> o los canales oficiales de soporte a autores de{" "}
        {BRAND_NAME}.
      </p>
    </LegalDocLayout>
  );
}
