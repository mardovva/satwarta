"use client";
import { handleImgError } from "@/lib/placeholderPhoto";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import { formatRupiah, type DonationNeed } from "@/lib/donations";
import type { StoredReport } from "@/types/report";

interface Props { report: StoredReport; need: DonationNeed; onDonate: (photo: string) => void }

/** Urutan: foto, nama hewan, keterangan, lokasi, kode laporan, satu target capaian, tombol donasi. */
export default function DonationCard({ report, need, onDonate }: Props) {
  const { history, reporterPhotos } = useReportPhotos(report);
  const photo = reporterPhotos[0]?.url ?? history[0]?.photos?.[0]?.url ?? "/images/animals/missing.jpg";
  const done = report.status === "Resolved";
  const name = report.animal.name || `Satwa ${report.animal.type.toLowerCase()}`;
  const pct = Math.round((need.collected / need.target) * 100);

  return (
    <article className="flex h-[28.5rem] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={`Foto laporan ${report.id}`} onError={handleImgError} draggable={false} className="h-44 w-full flex-none object-cover" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-lg font-bold text-primary">{name}</h3>
        <p className="truncate text-sm text-ink/70">{report.animal.count} ekor · {report.animal.condition}</p>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-ink/70">{report.location.city}, {report.location.province}</p>
        <p className="text-xs font-semibold tracking-wide text-ink/60">{report.id}</p>

        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">{need.label}</span>
            <span className="text-xs font-semibold text-primary">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={need.label}>
            <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink/60">{formatRupiah(need.collected)} dari {formatRupiah(need.target)}</p>
        </div>

        <button
          type="button" disabled={done} onClick={() => onDonate(photo)}
          className="mt-auto w-full rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          <span className="block pt-0">{done ? "Penanganan selesai" : "Donasi"}</span>
        </button>
      </div>
    </article>
  );
}
