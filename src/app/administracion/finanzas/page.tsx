import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminFinancialReportPanel } from "@/components/admin/AdminFinancialReportPanel";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Finanzas — Administración — ${BRAND_NAME}`,
  description: "Reporte financiero global y desglose de ganancias por autor.",
};

export default function AdminFinanzasPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <AdminGuard>
        <Suspense
          fallback={
            <main className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
              Cargando reporte…
            </main>
          }
        >
          <AdminFinancialReportPanel />
        </Suspense>
      </AdminGuard>
      <Footer />
    </>
  );
}
