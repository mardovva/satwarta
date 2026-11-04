import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import Decor from "@/components/layout/Decor";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import MapSection from "@/components/home/MapSection";
import ReportFormSection from "@/components/report/ReportFormSection";
import TrackingSection from "@/components/tracking/TrackingSection";
import NewsSection from "@/components/news/NewsSection";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      {/* Navbar di luar <main> agar tidak terpengaruh overflow-clip (menghindari header bergeser saat scroll di Safari) */}
      <Navbar />
      <main className="relative overflow-x-clip bg-cream">
      <PageBackground>
        <section id="beranda" className="relative pb-32 pt-[6.5rem] sm:pt-[8rem]">
          <Decor src="/images/branches/dry-leaf.png" width={218} height={239} className="left-0 top-16 w-[6rem] sm:top-[4.5rem] sm:w-[9.375rem] lg:w-[12.5rem]" />
          <Decor src="/images/branches/dry-branch.png" width={192} height={140} className="right-0 top-16 w-[6.875rem] sm:top-[4.5rem] sm:w-[10rem] lg:w-[13.125rem]" />
          <div className="relative z-20">
            <HeroSection />
            <StatisticsSection />
            <MapSection />
          </div>
          <Decor src="/images/branches/branches-with-animal.png" width={606} height={208} className="-bottom-28 left-0 w-[14.375rem] sm:w-[23.75rem] lg:w-[37.875rem]" />
          <Decor src="/images/branches/dry-leaf-2.png" width={117} height={125} className="-bottom-16 right-0 hidden w-[5.625rem] sm:block lg:w-[7.3125rem]" />
        </section>
        <ReportFormSection />
        <TrackingSection />
      </PageBackground>
      <NewsSection />
      <FAQSection />
      <Footer />
      </main>
    </>
  );
}
