import { redirect } from "next/navigation";

export default function AuthorDashboardPage() {
  redirect("/autor?tab=finanzas");
}
