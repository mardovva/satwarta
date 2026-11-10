"use client";
import { ExternalLink } from "lucide-react";
import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { formatDate } from "@/lib/tracking";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import { handlerLabel } from "@/lib/handler";
import type { OfficerSession } from "@/lib/auth";
import OfficerActionForm from "./OfficerActionForm";

export default function ReportDetail({ report, session, onChanged }: { report: StoredReport | null; session: OfficerSession; onChanged: () => void }) {
  if (!report) {
    return (
      <section id="detail" className="flex min-h-[16.25rem] items-center justify-center rounded-[1.25rem] bg-white p-8 text-center text-sm text-ink/60 shadow-soft">
        Pilih laporan dari daftar atau dari peta untuk melihat detail dan memprosesnya.
      </section>
    );
  }
  return <Detail key={report.id} report={report} session={session} onChanged={onChanged} />;
}

function Detail({ report, session, onChanged }: { report: StoredReport; session: OfficerSession; onChanged: () => void }) {
  const meta = statusMeta[report.status];
  const { history, reporterPhotos } = useReportPhotos(report);
  const { lat, lng } = report.location;

  // Baris informasi sama dengan hasil Lacak, ditambah data khusus petugas (koordinat dan kontak pelapor)
  const rows: [string, React.ReactNode][] = [
    ["Nama satwa", report.animal.name ? `${report.animal.name} (${report.animal.type})` : `Tidak disebutkan (${report.animal.type})`],
    ["Jumlah", `${report.animal.count} ekor`],
    ["Kondisi", report.animal.condition],
    ["Lokasi", `${report.location.city}, ${report.location.province}`],
    ...(report.location.detail ? [["Detail lokasi", report.location.detail] as [string, React.ReactNode]] : []),
    ["Tanggal laporan", formatDate(report.createdAt)],
    ["Ditangani oleh", handlerLabel(report)],
    ["Koordinat", (
      <a key="c" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline">
        {lat.toFixed(5)}, {lng.toFixed(5)} <ExternalLink size={13} />
      </a>
    )],
    ["Pelapor", report.reporter.name || "-"],
    ["Telepon", report.reporter.phone ? <a key="p" href={`tel:${report.reporter.phone}`} className="text-primary hover:underline">{report.reporter.phone}</a> : "-"],
    ["Email", report.reporter.email || "-"],
  ];

  return (
    <section id="detail" aria-label={`Detail laporan ${report.id}`} className="rounded-[1.25rem] bg-white p-6 shadow-soft sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink/55">ID laporan</p>
          <h3 className="text-2xl font-bold tracking-wide">{report.id}</h3>
        </div>
        <span className="rounded-full px-4 py-1 text-sm font-semibold" style={{ background: meta.bg, color: meta.fg }}>{meta.label}</span>
      </header>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm md:grid-cols-[auto_1fr_auto_1fr] md:gap-x-8">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd className="break-words">{v}</dd></div>))}
      </dl>

      <div className="mt-8 rounded-2xl bg-cream p-4 sm:p-5">
        <h4 className="mb-3 text-lg font-bold text-primary">Tindak lanjut</h4>
        <OfficerActionForm report={report} session={session} onDone={onChanged} />
      </div>

      {/* foto pelapor dan foto tiap tindakan tampil di sebelah kanan riwayat, seperti di halaman Lacak */}
      <h4 className="mb-6 mt-8 text-lg font-bold text-primary">Riwayat laporan</h4>
      <TrackingTimeline history={history} reporterPhotos={reporterPhotos} split />
    </section>
  );
}
