import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import Decor from "@/components/layout/Decor";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import MapSection from "@/components/home/MapSection";
import PhotoCarousel from "@/components/home/PhotoCarousel";
import FirstAidChat from "@/components/chat/FirstAidChat";
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
      <PageBackground>
        <section id="beranda" className="hero-fit relative flex flex-col pb-8 pt-[5.5rem] sm:pt-[6rem]">
          <Decor src="/images/branches/dry-leaf.png" width={218} height={239} sway="left top" className="bottom-2 left-0 z-[15] w-[6rem] sm:-bottom-6 sm:w-[9.375rem] lg:-bottom-[3.25rem] lg:w-[12.5rem]" />
          <Decor src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="bottom-4 right-0 z-[15] w-[6.875rem] sm:bottom-0 sm:w-[10rem] lg:-bottom-5 lg:w-[13.125rem]" />
          <div className="relative z-20 flex flex-1 flex-col">
            <HeroSection />
            <StatisticsSection />
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
      <FirstAidChat />
    </>
  );
}
