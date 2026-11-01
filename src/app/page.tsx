import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import Decor from "@/components/layout/Decor";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import MapSection from "@/components/home/MapSection";
import ReportFormSection from "@/components/report/ReportFormSection";
import TrackingSection from "@/components/tracking/TrackingSection";
import NewsSection from "@/components/news/NewsSection";
import AboutSection from "@/components/sections/AboutSection";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      {/* Navbar di luar <main> agar tidak terpengaruh overflow-clip (menghindari header bergeser saat scroll di Safari) */}
      <Navbar />
      <main className="relative overflow-x-clip bg-cream">
      <PageBackground>
        <section id="beranda" className="relative pb-32 pt-[104px] sm:pt-[128px]">
          <Decor src="/images/branches/dry-leaf.png" width={218} height={239} className="left-0 top-16 w-[96px] sm:top-[72px] sm:w-[150px] lg:w-[200px]" />
          <Decor src="/images/branches/dry-branch.png" width={192} height={140} className="right-0 top-16 w-[110px] sm:top-[72px] sm:w-[160px] lg:w-[210px]" />
          <div className="relative z-20">
            <HeroSection />
            <StatisticsSection />
            <MapSection />
          </div>
          <Decor src="/images/branches/branches-with-animal.png" width={606} height={208} className="-bottom-28 left-0 w-[230px] sm:w-[380px] lg:w-[606px]" />
          <Decor src="/images/branches/dry-leaf-2.png" width={117} height={125} className="-bottom-16 right-0 hidden w-[90px] sm:block lg:w-[117px]" />
        </section>
        <ReportFormSection />
        <TrackingSection />
      </PageBackground>
      <NewsSection />
      <AboutSection />
      <FAQSection />
      <Footer />
      </main>
    </>
  );
}
