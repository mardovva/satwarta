interface MapLegendProps {
  showReports: boolean;
  showHotspots: boolean;
  onToggleReports: () => void;
  onToggleHotspots: () => void;
}

export default function MapLegend({ showReports, showHotspots, onToggleReports, onToggleHotspots }: MapLegendProps) {
  const item = (on: boolean) => `flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition ${on ? "" : "opacity-45"}`;
  return (
    <div className="absolute left-3 top-3 z-10 max-w-[200px] rounded-2xl bg-white/95 p-2 text-[11px] shadow-md sm:text-xs">
      <button type="button" aria-pressed={showReports} onClick={onToggleReports} className={item(showReports)}>
        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-white bg-[#E6EFE4] text-[10px] shadow ring-1 ring-black/10">🐾</span>
        Laporan satwa
      </button>
      <button type="button" aria-pressed={showHotspots} onClick={onToggleHotspots} className={item(showHotspots)}>
        <span className="relative flex h-5 w-5 flex-none items-center justify-center">
          <span className="absolute h-5 w-5 rounded-full bg-[#FF4D1A]/30" />
          <span className="h-2 w-2 rounded-full border border-[#FFD28A] bg-[#FF6A1A]" />
        </span>
        Hotspot potensial
      </button>
      <p className="mt-1 px-1.5 text-[10px] text-ink/55">Data simulasi, bukan data aktual.</p>
    </div>
  );
}
