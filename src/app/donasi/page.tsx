import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageBackground from "@/components/layout/PageBackground";
import DonationPage from "@/components/donation/DonationPage";

export const metadata: Metadata = {
  title: "Donasi | Satwarta",
  description: "Bantu penanganan satwa liar korban karhutla. Terbuka untuk publik.",
};

export default function DonasiPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip">
        <PageBackground burnt>
          <DonationPage />
        </PageBackground>
      </main>
      <Footer />
    </>
  );
}
