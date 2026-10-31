import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import Decor from "@/components/layout/Decor";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import MapSection from "@/components/home/MapSection";
import ReportFormSection from "@/components/report/ReportFormSection";

// Placeholder sederhana untuk section yang dikerjakan di fase berikutnya.
function Placeholder({ id, title, note }: { id?: string; title: string; note: string }) {
  return (
    <section id={id} className="relative z-10 px-4 py-24 text-center sm:py-32">
      <h2 className="text-3xl font-bold text-primary sm:text-5xl">{title}</h2>
      <p className="mt-4 text-ink/60">{note}</p>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative overflow-x-clip bg-cream">
      <Navbar />
      <PageBackground>
        <section id="beranda" className="relative pb-32 pt-10 sm:pt-14">
          <Decor src="/images/branches/dry-leaf.png" width={218} height={239} className="left-0 top-0 w-[96px] sm:w-[150px] lg:w-[200px]" />
          <Decor src="/images/branches/dry-branch.png" width={192} height={140} className="right-0 top-0 w-[110px] sm:w-[160px] lg:w-[210px]" />
          <div className="relative z-20">
            <HeroSection />
            <StatisticsSection />
            <MapSection />
          </div>
          <Decor src="/images/branches/branches-with-animal.png" width={606} height={208} className="-bottom-28 left-0 w-[230px] sm:w-[380px] lg:w-[606px]" />
          <Decor src="/images/branches/dry-leaf-2.png" width={117} height={125} className="-bottom-16 right-0 hidden w-[90px] sm:block lg:w-[117px]" />
        </section>
        <ReportFormSection />
        <Placeholder id="track" title="Track Laporan" note="Fitur tracking hadir di Phase 3." />
      </PageBackground>
      <Placeholder title="News / Data" note="Hadir di Phase 4." />
      <Placeholder id="tentang" title="Tentang Satwarta" note="Hadir di Phase 4." />
      <Placeholder id="faq" title="FAQ" note="Hadir di Phase 4." />
    </main>
  );
}
