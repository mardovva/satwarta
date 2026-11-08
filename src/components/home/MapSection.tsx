"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { goToTracking } from "@/lib/tracking";
import { MessageCircle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { openFirstAid } from "@/lib/firstAid";
import ReportButton from "./ReportButton";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

export default function MapSection() {
  const [fullscreen, setFullscreen] = useState(false);

  // "Lihat Detail" pada popup: keluar dari fullscreen lalu buka laporan di bagian Track Laporan
  const viewDetail = (id: string) => {
    setFullscreen(false);
    window.setTimeout(() => goToTracking(id), 80);
  };

  useEffect(() => {
    if (!fullscreen) return;
    document.body.classList.add("map-fullscreen"); // menyembunyikan navbar (lihat globals.css)
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("map-fullscreen");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  return (
    <section className="mx-auto mt-8 w-[92%] max-w-[83.125rem] md:w-[84%]">
      {/* pembungkus tinggi tetap agar halaman tidak melompat saat peta masuk fullscreen */}
      <Reveal variant="zoom"><div className="h-[23rem] sm:h-[27rem] md:h-[33rem]">
        <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-3 sm:p-6" : "h-full overflow-hidden rounded-[1.25rem] shadow-soft"}>
          <div className={fullscreen ? "h-full w-full overflow-hidden rounded-[1.25rem]" : "h-full w-full"}>
            <IndonesiaMap mode="monitoring" fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} onViewDetail={viewDetail} />
          </div>
        </div>
      </div></Reveal>
      <Reveal delay={0.1}>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button" onClick={() => openFirstAid()}
          className="inline-flex w-full max-w-[21.5rem] items-center justify-center gap-2 rounded-full bg-white px-7 py-3 sm:w-[21.5rem] text-base font-semibold text-primary shadow-md ring-1 ring-primary/25 transition hover:-translate-y-0.5 hover:bg-cream hover:shadow-lg sm:text-lg"
        >
          <MessageCircle size={20} /> AI Chat Satwarta
        </button>
        <ReportButton />
      </div></Reveal>
    </section>
  );
}
