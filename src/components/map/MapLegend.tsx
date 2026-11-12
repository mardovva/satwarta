export type Basemap = "satelit" | "peta";

interface MapLegendProps { basemap: Basemap; onBasemap: (b: Basemap) => void }

/** Hanya pilihan jenis peta (satelit atau peta jalan). */
export default function MapLegend({ basemap, onBasemap }: MapLegendProps) {
  const idle = basemap === "satelit" ? "text-white hover:bg-white/20" : "text-ink hover:bg-white/40";
  const seg = (on: boolean) => `rounded-full px-3 py-1 text-[0.6875rem] font-semibold transition sm:text-xs ${on ? "bg-white/70 text-primary" : idle}`;
  return (
    <div className="absolute left-3 top-3 z-10 inline-flex gap-0.5 rounded-full border border-white/50 bg-white/25 p-0.5 shadow-nav backdrop-blur-xl backdrop-saturate-150" role="group" aria-label="Jenis peta">
      <button type="button" aria-pressed={basemap === "satelit"} onClick={() => onBasemap("satelit")} className={seg(basemap === "satelit")}>Satelit</button>
      <button type="button" aria-pressed={basemap === "peta"} onClick={() => onBasemap("peta")} className={seg(basemap === "peta")}>Peta</button>
    </div>
  );
}

