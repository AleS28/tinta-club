import { redirect } from "next/navigation";

/** Ruta legacy → acuerdo de autor a nivel de cuenta */
export default function FirmarAcuerdoAutorRedirectPage() {
  redirect("/autor/acuerdo");
}
