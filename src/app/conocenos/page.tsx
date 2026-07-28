import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AboutContent } from "@/components/conocenos/AboutContent";
import { DiscordCommunityCard } from "@/components/conocenos/DiscordCommunityCard";
import { FeedbackForm } from "@/components/conocenos/FeedbackForm";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Conócenos — ${BRAND_NAME}`,
  description:
    "Conoce la historia, misión y visión de El Imperio de la Tinta. Comparte tus sugerencias y ayúdanos a construir la plataforma de narrativa independiente del futuro.",
};

export default function ConocenosPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <AboutContent />
        <FeedbackForm />
        <DiscordCommunityCard />
      </main>

      <Footer />
    </>
  );
}
