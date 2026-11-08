import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import Decor from "@/components/layout/Decor";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import MapSection, { CtaRow } from "@/components/home/MapSection";
import PhotoCarousel from "@/components/home/PhotoCarousel";
import ReportFormSection from "@/components/report/ReportFormSection";
import TrackingSection from "@/components/tracking/TrackingSection";
import DonationSection from "@/components/donation/DonationSection";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      {/* Navbar di luar <main> agar tidak terpengaruh overflow-clip (menghindari header bergeser saat scroll di Safari) */}
      <Navbar />
      <main className="relative overflow-x-clip">
      <PageBackground morph>
        <section id="beranda" className="relative flex flex-col pt-[4.5rem] sm:pt-[5rem]">
          <div className="relative z-20 flex flex-col">
            {/* bagian atas: judul, statistik, dua tombol CTA (di atas peta) */}
            <div className="flex min-h-[calc(50svh-4.5rem)] items-center justify-center py-6">
              <div className="relative w-full">
                <Decor src="/images/branches/dry-leaf.png" width={218} height={239} sway="left top" className="-bottom-[1.625rem] left-0 z-[15] w-[6rem] sm:-bottom-14 sm:w-[9.375rem] lg:-bottom-[5.25rem] lg:w-[12.5rem]" />
                <Decor src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-bottom-3.5 right-0 z-[15] w-[6.875rem] sm:-bottom-8 sm:w-[10rem] lg:-bottom-[3.2rem] lg:w-[13.125rem]" />
                <HeroSection />
                <StatisticsSection />
                <CtaRow />
              </div>
            </div>
            {/* bagian bawah: peta setinggi satu layar, dimulai dari separuh bawah layar pertama */}
            <MapSection />
          </div>
        </section>
        <PhotoCarousel />
        <ReportFormSection />
        <TrackingSection />
        <DonationSection />
        <FAQSection />
      </PageBackground>
      <Footer />
      </main>
    </>
  );
}
