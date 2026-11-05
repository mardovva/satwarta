"use client";
import { X } from "lucide-react";
import { formatDate, type TrackingLookup } from "@/lib/tracking";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import { statusMeta } from "@/data/trackingStatuses";
import { handlerLabel } from "@/lib/handler";
import TrackingTimeline from "./TrackingTimeline";

export default function TrackingResult({ lookup, onClose }: { lookup: TrackingLookup; onClose: () => void }) {
  const { report } = lookup;
  const meta = statusMeta[report.status];
  const { history, reporterPhotos } = useReportPhotos(report);

  const rows: [string, string][] = [
    ["Nama satwa", report.animal.name ? `${report.animal.name} (${report.animal.type})` : `Tidak disebutkan (${report.animal.type})`],
    ["Jumlah / kondisi", `${report.animal.count} ekor · ${report.animal.condition}`],
    ["Lokasi", `${report.location.city}, ${report.location.province}`],
    ["Tanggal laporan", formatDate(report.createdAt)],
    ["Ditangani oleh", handlerLabel(report)],
  ];

  return (
    <article className="relative mx-auto mt-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft sm:p-8">
      <button type="button" onClick={onClose} aria-label="Tutup hasil pelacakan" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink/70 transition hover:bg-black/10 hover:text-ink sm:right-5 sm:top-5">
        <X size={18} />
      </button>
      <header className="flex flex-wrap items-start justify-between gap-3 pr-12">
        <div>
          <p className="text-xs text-ink/55">ID laporan</p>
          <h3 className="text-2xl font-bold tracking-wide">{report.id}</h3>
        </div>
        <span className="rounded-full px-4 py-1 text-sm font-semibold" style={{ background: meta.bg, color: meta.fg }}>{meta.label}</span>
      </header>

      <p className="mt-2 text-sm text-ink/70">{meta.description}</p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>))}
      </dl>

      <h4 className="mb-1 mt-7 text-lg font-bold text-primary">Riwayat laporan</h4>
      <p className="mb-4 text-xs text-ink/55">Klik langkah yang memiliki foto untuk melihat dokumentasinya.</p>
      <TrackingTimeline history={history} reporterPhotos={reporterPhotos} />
    </article>
  );
}
