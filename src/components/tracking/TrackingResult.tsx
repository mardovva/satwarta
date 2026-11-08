"use client";
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { formatDate, type TrackingLookup } from "@/lib/tracking";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import { statusMeta } from "@/data/trackingStatuses";
import { handlerLabel } from "@/lib/handler";
import DeleteReportDialog from "./DeleteReportDialog";
import TrackingTimeline from "./TrackingTimeline";

/** Hasil pelacakan selebar peta dan formulir; foto tiap langkah tampil di sebelah kanan timeline. */
export default function TrackingResult({ lookup, onClose }: { lookup: TrackingLookup; onClose: () => void }) {
  const { report } = lookup;
  const [confirming, setConfirming] = useState(false);
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
    <article className="relative mx-auto mt-10 w-[92%] max-w-[83.125rem] rounded-[1.25rem] bg-white p-6 shadow-soft sm:p-8 md:w-[84%] md:p-10">
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

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm md:grid-cols-[auto_1fr_auto_1fr] md:gap-x-8">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>))}
      </dl>

      <h4 className="mb-6 mt-8 text-lg font-bold text-primary">Riwayat laporan</h4>
      <TrackingTimeline history={history} reporterPhotos={reporterPhotos} split />

      {/* hanya laporan buatan pengguna yang dapat dihapus */}
      {lookup.source === "local" && (
        <div className="mt-8 flex justify-end border-t border-black/5 pt-5">
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-300 transition hover:bg-red-50">
            <Trash2 size={16} /> Hapus laporan
          </button>
        </div>
      )}
      {confirming && <DeleteReportDialog reportId={report.id} onClose={() => setConfirming(false)} onDeleted={onClose} />}
        </article>
  );
}
