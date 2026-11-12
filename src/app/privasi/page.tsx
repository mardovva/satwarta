import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageBackground from "@/components/layout/PageBackground";
import PrivacyPage from "@/components/privacy/PrivacyPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Satwarta",
  description: "Data pribadi apa yang dikumpulkan Satwarta, untuk apa digunakan, siapa yang dapat melihatnya, dan hak Anda.",
};

export default function PrivasiPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip">
        <PageBackground burnt>
          <PrivacyPage />
        </PageBackground>
      </main>
      <Footer />
    </>
  );
}

