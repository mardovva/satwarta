export type Basemap = "satelit" | "peta";

interface MapLegendProps { basemap: Basemap; onBasemap: (b: Basemap) => void }

/** Hanya pilihan jenis peta (satelit atau peta jalan). */
export default function MapLegend({ basemap, onBasemap }: MapLegendProps) {
  const seg = (on: boolean) => `rounded-full px-3 py-1 text-[0.6875rem] font-semibold transition sm:text-xs ${on ? "bg-primary text-white" : "text-ink hover:bg-mist"}`;
  return (
    <div className="absolute left-3 top-3 z-10 inline-flex gap-0.5 rounded-full bg-white/95 p-0.5 shadow-md" role="group" aria-label="Jenis peta">
      <button type="button" aria-pressed={basemap === "satelit"} onClick={() => onBasemap("satelit")} className={seg(basemap === "satelit")}>Satelit</button>
      <button type="button" aria-pressed={basemap === "peta"} onClick={() => onBasemap("peta")} className={seg(basemap === "peta")}>Peta</button>
    </div>
  );
}
