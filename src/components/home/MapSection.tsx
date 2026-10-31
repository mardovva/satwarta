"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ReportButton from "./ReportButton";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

export default function MapSection() {
  const [fullscreen, setFullscreen] = useState(false);

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
    <section className="mx-auto mt-8 w-[92%] max-w-[1330px] md:w-[84%]">
      {/* pembungkus tinggi tetap agar halaman tidak melompat saat peta masuk fullscreen */}
      <div className="h-[300px] sm:h-[320px] md:h-[380px]">
        <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-3 sm:p-6" : "h-full overflow-hidden rounded-[20px] shadow-soft"}>
          <div className={fullscreen ? "h-full w-full overflow-hidden rounded-[20px]" : "h-full w-full"}>
            <IndonesiaMap mode="monitoring" fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((v) => !v)} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end"><ReportButton /></div>
    </section>
  );
}
