export type HotspotStatus =
  | { state: "loading" }
  | { state: "live"; count: number; dayRange: number; source: string }
  | { state: "simulated" };

export type Basemap = "satelit" | "peta";

interface MapLegendProps {
  showReports: boolean;
  showHotspots: boolean;
  hotspot: HotspotStatus;
  basemap: Basemap;
  onToggleReports: () => void;
  onToggleHotspots: () => void;
  onBasemap: (b: Basemap) => void;
}

function hotspotText(h: HotspotStatus) {
  if (h.state === "loading") return { title: "Memuat hotspot NASA…", sub: "" };
  if (h.state === "simulated") return { title: "Hotspot simulasi", sub: "NASA FIRMS belum tersambung" };
  return {
    title: "Hotspot NASA FIRMS",
    sub: h.count === 0 ? `Tidak ada deteksi · ${h.dayRange} hari terakhir` : `${h.source.split("_").slice(0, 2).join(" ")} · ${h.dayRange} hari terakhir · ${h.count} titik`,
  };
}

export default function MapLegend({ showReports, showHotspots, hotspot, basemap, onToggleReports, onToggleHotspots, onBasemap }: MapLegendProps) {
  const item = (on: boolean) => `flex w-full items-start gap-2 rounded-lg px-1.5 py-1 text-left transition ${on ? "" : "opacity-45"}`;
  const t = hotspotText(hotspot);
  const seg = (on: boolean) => `flex-1 rounded-full px-2 py-0.5 font-semibold transition ${on ? "bg-primary text-white" : "text-ink hover:bg-mist"}`;

  return (
    <div className="absolute left-3 top-3 z-10 max-w-[230px] rounded-2xl bg-white/95 p-2 text-[11px] shadow-md sm:text-xs">
      <button type="button" aria-pressed={showReports} onClick={onToggleReports} className={item(showReports)}>
        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-white bg-[#E6EFE4] text-[10px] shadow ring-1 ring-black/10">🐾</span>
        <span className="leading-5">Laporan satwa</span>
      </button>
      <button type="button" aria-pressed={showHotspots} onClick={onToggleHotspots} className={item(showHotspots)}>
        <span className="relative mt-0.5 flex h-5 w-5 flex-none items-center justify-center">
          <span className="absolute h-5 w-5 rounded-full bg-[#FF4D1A]/30" />
          <span className="h-2 w-2 rounded-full border border-[#FFD28A] bg-[#FF6A1A]" />
        </span>
        <span>
          <span className="block leading-5">{t.title}</span>
          {t.sub && <span className="block text-[10px] text-ink/55">{t.sub}</span>}
        </span>
      </button>

      <div className="mt-1 flex gap-1 rounded-full bg-mist p-0.5" role="group" aria-label="Jenis peta">
        <button type="button" aria-pressed={basemap === "satelit"} onClick={() => onBasemap("satelit")} className={seg(basemap === "satelit")}>Satelit</button>
        <button type="button" aria-pressed={basemap === "peta"} onClick={() => onBasemap("peta")} className={seg(basemap === "peta")}>Peta</button>
      </div>

      <p className="mt-1 px-1.5 text-[10px] leading-snug text-ink/55">
        {hotspot.state === "live"
          ? "Hotspot = indikasi panas dari satelit, belum tentu kebakaran. Laporan satwa: data contoh."
          : "Data pada peta ini simulasi, bukan data aktual."}
      </p>
    </div>
  );
}
