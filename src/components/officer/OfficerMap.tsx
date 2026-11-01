"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

/** Peta persebaran laporan + hotspot. "Lihat Detail" pada popup membuka laporan di panel petugas. */
export default function OfficerMap({ onSelect, regions }: { onSelect: (id: string) => void; regions: string[] }) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
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
    <div className="h-[340px] sm:h-[420px]">
      <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-3 sm:p-6" : "h-full overflow-hidden rounded-[20px] shadow-soft"}>
        <div className={fullscreen ? "h-full w-full overflow-hidden rounded-[20px]" : "h-full w-full"}>
          <IndonesiaMap mode="monitoring" fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} onViewDetail={viewDetail} regions={regions} />
        </div>
      </div>
    </div>
  );
}
