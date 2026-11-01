"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Copy } from "lucide-react";
import type { StoredReport } from "@/types/report";
import { goToTracking } from "@/lib/tracking";

interface Props { report: StoredReport; persisted: boolean; onClose: () => void }

export default function SubmissionSuccess({ report, persisted, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyId = async () => {
    try { await navigator.clipboard.writeText(report.id); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* abaikan */ }
  };
  const goTrack = () => {
    onClose();
    goToTracking(report.id);
  };

  const { animal, location, reporter } = report;
  const rows: [string, string][] = [
    ["Satwa", `${animal.name || "Tidak disebutkan"} (${animal.type})`],
    ["Jumlah", String(animal.count)],
    ["Kondisi", animal.condition],
    ["Lokasi", `${location.city}, ${location.province}`],
    ["Koordinat", `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`],
    ["Foto", `${report.photos.length} file`],
    ["Pelapor", reporter.name],
  ];

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="success-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 size={26} />
          <h3 id="success-title" className="text-xl font-bold">Laporan berhasil dikirim</h3>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
          <div>
            <p className="text-xs text-ink/60">ID laporan</p>
            <p className="text-xl font-bold tracking-wide">{report.id}</p>
          </div>
          <button type="button" onClick={copyId} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/30 hover:bg-primary hover:text-white">
            <Copy size={14} /> {copied ? "Tersalin" : "Salin"}
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>))}
        </dl>

        {!persisted && (
          <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-xs leading-relaxed text-ink/75">Laporan tidak dapat disimpan di perangkat ini. Silakan coba lagi.</p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={goTrack} className="rounded-full px-5 py-2 text-sm font-semibold text-primary ring-1 ring-primary/40 hover:bg-primary/5">Lacak laporan</button>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Tutup</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
