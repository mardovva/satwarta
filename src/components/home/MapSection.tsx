"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { goToTracking } from "@/lib/tracking";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { INTRO } from "@/lib/intro";
import ReportButton from "./ReportButton";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

/** Dua tombol CTA di atas peta. */
export function CtaRow() {
  return (
    <Reveal initialDelay={INTRO.nextDelay}>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-4">
        <Link href="/chat" className="inline-flex w-full max-w-[19rem] items-center justify-center gap-2 rounded-full border border-white/50 bg-white/40 px-7 py-3 text-base font-semibold text-primary shadow-nav backdrop-blur-xl backdrop-saturate-150 transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-lg sm:w-[19rem]">
          <MessageCircle size={20} /> Tanya Satwarta AI
        </Link>
        <ReportButton />
      </div>
    </Reveal>
  );
}

/** Peta setinggi 75% layar: separuh atasnya terlihat di layar pertama, sisanya muncul saat digulir (seperti Cluely). */
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
    <section className="mx-auto mt-4 w-[92%] max-w-[83.125rem] md:w-[84%]">
      {/* tinggi = 75% layar (svh); inset-0 agar tinggi peta tidak bergantung persen */}
      <Reveal variant="stick" initialDelay={INTRO.nextDelay} className="relative h-[75svh] min-h-[24rem] max-h-[52rem]">
        <div className="absolute inset-0">
          <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-3 sm:p-6" : "h-full overflow-hidden rounded-[1.25rem] shadow-[0_30px_80px_-12px_rgba(10,30,20,0.40)]"}>
            <div className={fullscreen ? "h-full w-full overflow-hidden rounded-[1.25rem]" : "h-full w-full"}>
              <IndonesiaMap mode="monitoring" fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} onViewDetail={viewDetail} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
