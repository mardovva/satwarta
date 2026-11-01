"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { formatDate } from "@/lib/tracking";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import PhotoLightbox from "@/components/tracking/PhotoLightbox";
import { handlerLabel } from "@/lib/handler";
import type { OfficerSession } from "@/lib/auth";
import OfficerActionForm from "./OfficerActionForm";

export default function ReportDetail({ report, session }: { report: StoredReport | null; session: OfficerSession }) {
  if (!report) {
    return (
      <section id="detail" className="flex min-h-[260px] items-center justify-center rounded-3xl bg-white p-8 text-center text-sm text-ink/60 shadow-sm ring-1 ring-black/5">
        Pilih laporan dari daftar atau dari peta untuk melihat detail dan memprosesnya.
      </section>
    );
  }
  return <Detail key={report.id} report={report} session={session} />;
}

function Detail({ report, session }: { report: StoredReport; session: OfficerSession }) {
  const meta = statusMeta[report.status];
  const { history, reporterPhotos } = useReportPhotos(report);
  const [viewer, setViewer] = useState<number | null>(null);
  const strip = reporterPhotos.length > 0 ? reporterPhotos : history[0]?.photos ?? [];
  const { lat, lng } = report.location;

  const rows: [string, React.ReactNode][] = [
    ["Satwa", report.animal.name || `Tidak disebutkan (${report.animal.type})`],
    ["Jenis", report.animal.type],
    ["Jumlah", `${report.animal.count} ekor`],
    ["Kondisi", report.animal.condition],
    ["Lokasi", `${report.location.city}, ${report.location.province}`],
    ["Koordinat", (
      <a key="c" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline">
        {lat.toFixed(5)}, {lng.toFixed(5)} <ExternalLink size={13} />
      </a>
    )],
    ["Tanggal laporan", formatDate(report.createdAt)],
    ["Ditangani oleh", handlerLabel(report)],
    ["Pelapor", report.reporter.name || "-"],
    ["Telepon", report.reporter.phone ? <a key="p" href={`tel:${report.reporter.phone}`} className="text-primary hover:underline">{report.reporter.phone}</a> : "-"],
    ["Email", report.reporter.email || "-"],
  ];

  return (
    <section id="detail" aria-label={`Detail laporan ${report.id}`} className="space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink/55">ID laporan</p>
          <h2 className="text-2xl font-bold tracking-wide">{report.id}</h2>
        </div>
        <span className="rounded-full px-4 py-1 text-sm font-semibold" style={{ background: meta.bg, color: meta.fg }}>{report.status}</span>
      </header>

      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
        {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd className="break-words">{v}</dd></div>))}
      </dl>

      <div>
        <h3 className="mb-2 text-lg font-bold text-primary">Dokumentasi pelapor</h3>
        {strip.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {strip.map((p, i) => (
              <li key={i}>
                <button type="button" onClick={() => setViewer(i)} aria-label={`Perbesar foto ${i + 1}`} className="block overflow-hidden rounded-xl ring-1 ring-black/10 transition hover:ring-2 hover:ring-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Foto pelapor ${i + 1}`} className="h-24 w-24 object-cover" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/60">Pelapor tidak melampirkan foto.</p>
        )}
      </div>

      <div className="rounded-2xl bg-cream p-4 sm:p-5">
        <h3 className="mb-3 text-lg font-bold text-primary">Tindak lanjut</h3>
        <OfficerActionForm report={report} session={session} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-primary">Riwayat laporan</h3>
        <TrackingTimeline history={history} reporterPhotos={reporterPhotos} />
      </div>

      {viewer !== null && <PhotoLightbox photos={strip} index={viewer} onClose={() => setViewer(null)} />}
    </section>
  );
}
