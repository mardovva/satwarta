export type HotspotStatus = { state: "loading" } | { state: "live"; count: number; dayRange: number } | { state: "unavailable" };
export type Basemap = "satelit" | "peta";

interface MapLegendProps { hotspot: HotspotStatus; basemap: Basemap; onBasemap: (b: Basemap) => void }

function hotspotLabel(h: HotspotStatus) {
  if (h.state === "live") return `Hotspot NASA FIRMS · ${h.dayRange} hari terakhir · ${h.count} titik`;
  if (h.state === "unavailable") return "Hotspot NASA FIRMS (tidak tersedia)";
  return "Hotspot NASA FIRMS";
}

export default function MapLegend({ hotspot, basemap, onBasemap }: MapLegendProps) {
  const seg = (on: boolean) => `rounded-full px-3 py-1 font-semibold transition ${on ? "bg-primary text-white" : "text-ink hover:bg-mist"}`;
  return (
    <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-70px)] flex-col items-start gap-1.5 text-[11px] sm:text-xs">
      <div className="inline-flex gap-0.5 rounded-full bg-white/95 p-0.5 shadow-md" role="group" aria-label="Jenis peta">
        <button type="button" aria-pressed={basemap === "satelit"} onClick={() => onBasemap("satelit")} className={seg(basemap === "satelit")}>Satelit</button>
        <button type="button" aria-pressed={basemap === "peta"} onClick={() => onBasemap("peta")} className={seg(basemap === "peta")}>Peta</button>
      </div>
      <ul className="flex flex-col gap-0.5 rounded-xl bg-black/45 px-3 py-1.5 text-white backdrop-blur-sm">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 flex-none rounded-full border-2 border-white bg-[#6B8F71]" />Laporan satwa
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 flex-none rounded-full border border-[#FFD28A] bg-[#FF6A1A]" />{hotspotLabel(hotspot)}
        </li>
      </ul>
    </div>
  );
}
