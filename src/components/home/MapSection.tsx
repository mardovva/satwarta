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

  // "Lihat Detail" pada popup: keluar dari fullscreen lalu buka laporan di bagian Lacak Laporan
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
    <section className="mx-auto mt-6 flex w-[92%] max-w-[83.125rem] flex-1 flex-col md:w-[84%]">
      {/* peta mengisi sisa tinggi layar pertama (min 14 rem, maks 46 rem); inset-0 agar tinggi tidak bergantung persen */}
      <Reveal variant="zoom" className="relative max-h-[46rem] min-h-[14rem] flex-1"><div className="absolute inset-0">
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
          className="inline-flex w-full max-w-[19rem] items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-semibold text-primary shadow-md ring-1 ring-primary/25 transition hover:-translate-y-0.5 hover:bg-cream hover:shadow-lg sm:w-[19rem]"
        >
          <MessageCircle size={20} /> AI Chat Satwarta
        </button>
        <ReportButton />
      </div></Reveal>
    </section>
  );
}
