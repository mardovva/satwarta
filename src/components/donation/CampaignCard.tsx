"use client";
import ProgressFill from "@/components/ui/ProgressFill";
import { ShieldCheck } from "lucide-react";
import { handleImgError } from "@/lib/placeholderPhoto";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import { formatRupiah } from "@/lib/donations";
import type { Campaign } from "@/lib/campaigns";

interface Props { campaign: Campaign; onOpen: () => void }

/** Kartu penggalangan: foto, lencana, judul, lokasi, progres, dan tombol donasi. */
export default function CampaignCard({ campaign: c, onOpen }: Props) {
  const { history, reporterPhotos } = useReportPhotos(c.report);
  const photo = reporterPhotos[0]?.url ?? history.find((h) => h.photos?.length)?.photos?.[0]?.url ?? "/images/animals/missing.jpg";
  const badge = c.done
    ? { text: "Selesai", cls: "bg-[#CFE8D7] text-[#1E4D31]" }
    : c.almost
      ? { text: "Hampir tercapai", cls: "bg-[#FDF0D5] text-[#8A5A00]" }
      : c.urgent
        ? { text: "Mendesak", cls: "bg-[#FBE3E3] text-[#9B2C2C]" }
        : null;

  return (
    <article
      onClick={onOpen}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full flex-none overflow-hidden bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={`Foto laporan ${c.id}`} onError={handleImgError} draggable={false} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {badge && <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>{badge.text}</span>}
        {c.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary" title="Laporan sudah diverifikasi petugas">
            <ShieldCheck size={14} /> Terverifikasi
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-lg font-bold text-primary">{c.title}</h3>
        <p className="truncate text-sm text-ink/70">{c.report.animal.count} ekor · {c.report.animal.condition}</p>
        <p className="mt-1 line-clamp-1 text-sm text-ink/70">{c.report.location.city}, {c.report.location.province}</p>
        <p className="text-xs font-semibold tracking-wide text-ink/50">{c.id}</p>

        <div className="mt-4">
          <p className="text-sm">
            <span className="font-bold text-primary">{formatRupiah(c.collected)}</span>
            <span className="text-ink/60"> terkumpul</span>
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={c.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres donasi ${c.title}`}>
            <ProgressFill pct={c.pct} className="h-full rounded-full bg-accent" delay={150} />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-ink/60">
            <span>{c.pct}% dari {formatRupiah(c.target)}</span>
            <span>{c.donors} donatur</span>
          </div>
        </div>

        <button
          type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="mt-5 w-full rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark"
        >
          {c.done ? "Lihat kabar penanganan" : "Donasi sekarang"}
        </button>
      </div>
    </article>
  );
}
