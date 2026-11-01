import { statusMeta, statusOrder } from "@/data/trackingStatuses";

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
      <div className="rounded-xl bg-black/50 px-3 py-1.5 text-white backdrop-blur-sm">
        <p className="mb-1 font-semibold">Status laporan</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] sm:text-[11px]">
          {statusOrder.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 flex-none rounded-full border border-white" style={{ background: statusMeta[s].dot }} />{s}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 flex items-center gap-1.5 border-t border-white/25 pt-1.5 text-[10px] sm:text-[11px]">
          <span className="h-2.5 w-2.5 flex-none rounded-full border border-[#FFD28A] bg-[#FF6A1A]" />{hotspotLabel(hotspot)}
        </p>
      </div>
    </div>
  );
}
