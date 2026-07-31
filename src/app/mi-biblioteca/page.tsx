import { redirect } from "next/navigation";

export default function MiBibliotecaPage() {
  redirect("/biblioteca?section=compras");
}
