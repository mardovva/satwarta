"use client";
import dynamic from "next/dynamic";
import { useState, useLayoutEffect } from "react";
import type { StoredReport } from "@/types/report";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

/** Peta persebaran laporan + hotspot. "Lihat Detail" pada popup membuka laporan di panel petugas. */
export default function OfficerMap({ onSelect, reports }: { onSelect: (id: string) => void; reports: StoredReport[] }) {
  const [fullscreen, setFullscreen] = useState(false);

  // useLayoutEffect: kelas dipasang sebelum frame digambar, sehingga header tidak sempat terlihat di atas peta
  useLayoutEffect(() => {
    if (!fullscreen) return;
    document.body.classList.add("map-fullscreen");
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("map-fullscreen");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const viewDetail = (id: string) => {
    setFullscreen(false);
    window.setTimeout(() => onSelect(id), 80);
  };

  return (
    <div className="h-[75svh] min-h-[24rem] max-h-[52rem]">
      <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-3 sm:p-6" : "h-full overflow-hidden rounded-[1.25rem] shadow-soft"}>
        <div className={fullscreen ? "h-full w-full overflow-hidden rounded-[1.25rem]" : "h-full w-full"}>
          <IndonesiaMap mode="monitoring" fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} onViewDetail={viewDetail} reports={reports} />
        </div>
      </div>
    </div>
  );
}

