import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminStorePricingPanel } from "@/components/admin/AdminStorePricingPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Precios tienda — Administración — ${BRAND_NAME}`,
  description: "Gestión de precios de compra directa en la tienda del Imperio.",
};

export default function AdminTiendaPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <AdminGuard>
        <Suspense
          fallback={
            <main className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
              Cargando precios…
            </main>
          }
        >
          <AdminStorePricingPanel />
        </Suspense>
      </AdminGuard>
      <Footer />
    </>
  );
}
