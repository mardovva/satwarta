import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageBackground from "@/components/layout/PageBackground";
import InstitutionsPage from "@/components/lembaga/InstitutionsPage";

export const metadata: Metadata = {
  title: "Lembaga | Satwarta",
  description: "Daftar lembaga, pusat penyelamatan, dan kontak resmi untuk penanganan satwa liar terdampak karhutla.",
};

export default function LembagaPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip">
        <PageBackground burnt>
          <InstitutionsPage />
        </PageBackground>
      </main>
      <Footer />
    </>
  );
}

