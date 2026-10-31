import type { TrackingLookup } from "@/lib/tracking";
import { formatDate } from "@/lib/tracking";
import { statusMeta } from "@/data/trackingStatuses";
import TrackingTimeline from "./TrackingTimeline";

export default function TrackingResult({ lookup }: { lookup: TrackingLookup }) {
  const { report, source } = lookup;
  const meta = statusMeta[report.status];
  const rows: [string, string][] = [
    ["Nama satwa", report.animal.name ? `${report.animal.name} (${report.animal.type})` : `Tidak disebutkan (${report.animal.type})`],
    ["Jumlah / kondisi", `${report.animal.count} ekor · ${report.animal.condition}`],
    ["Lokasi", `${report.location.city}, ${report.location.province}`],
    ["Tanggal laporan", formatDate(report.createdAt)],
  ];

  return (
    <article className="mx-auto mt-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink/55">ID laporan</p>
          <h3 className="text-2xl font-bold tracking-wide">{report.id}</h3>
        </div>
        <span className="rounded-full px-4 py-1 text-sm font-semibold" style={{ background: meta.bg, color: meta.fg }}>{report.status}</span>
      </header>

      <p className="mt-2 text-sm text-ink/70">{meta.description}</p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>))}
      </dl>

      <h4 className="mb-4 mt-7 text-lg font-bold text-primary">Riwayat laporan</h4>
      <TrackingTimeline history={report.history} />

      <p className="mt-6 rounded-xl bg-cream px-3 py-2 text-xs leading-relaxed text-ink/65">
        {source === "demo"
          ? "Ini laporan contoh (data dummy) untuk demonstrasi fitur pelacakan."
          : "Ini laporan yang Anda buat di browser ini (mode demo). Belum ada petugas yang memproses laporan ini, jadi statusnya tetap Submitted sampai sistem petugas tersedia."}
      </p>
    </article>
  );
}
