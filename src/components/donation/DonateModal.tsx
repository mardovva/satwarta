"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MapPin, X } from "lucide-react";
import { handleImgError } from "@/lib/placeholderPhoto";
import { formatRupiah } from "@/lib/donations";
import type { StoredReport } from "@/types/report";

interface Props { report: StoredReport; photo: string; onClose: () => void }

const MIN_AMOUNT = 10_000;

export default function DonateModal({ report, photo, onClose }: Props) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");
  const timer = useRef<number>();
  const amount = Number(raw || 0);
  const name = report.animal.name || `Satwa ${report.animal.type.toLowerCase()}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phase !== "processing" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, phase]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < MIN_AMOUNT) { setError(`Nominal donasi minimal ${formatRupiah(MIN_AMOUNT)}.`); return; }
    setError("");
    setPhase("processing");
    timer.current = window.setTimeout(() => setPhase("done"), 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={() => phase !== "processing" && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="donate-title" className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-soft" onClick={(e) => e.stopPropagation()}>
        {phase !== "processing" && (
          <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><X size={18} /></button>
        )}

        {phase === "done" ? (
          <div className="space-y-4 px-6 py-10 text-center">
            <div className="relative mx-auto h-24 w-24">
              <span aria-hidden className="pay-ring absolute inset-0 rounded-full bg-primary/30" />
              <svg viewBox="0 0 52 52" className="pay-pop relative h-24 w-24" aria-hidden>
                <circle cx="26" cy="26" r="24" fill="#345542" />
                <path className="pay-check" d="M15 27 l8 8 l15 -16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 id="donate-title" className="text-xl font-bold text-primary">Pembayaran berhasil</h3>
            <p className="text-sm text-ink/75">Terima kasih. Donasi <strong>{formatRupiah(amount)}</strong> untuk {name} ({report.id}) telah diterima.</p>
            <button type="button" onClick={onClose} className="rounded-full bg-primary px-8 py-2.5 font-semibold text-white hover:bg-primary-dark">Tutup</button>
          </div>
        ) : phase === "processing" ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <Loader2 size={44} className="animate-spin text-primary" />
            <p id="donate-title" className="font-semibold text-primary">Memproses pembayaran…</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={`Foto laporan ${report.id}`} onError={handleImgError} draggable={false} className="h-44 w-full object-cover" />
            <div className="space-y-4 p-6">
              <div>
                <h3 id="donate-title" className="text-xl font-bold text-primary">{name}</h3>
                <p className="text-sm text-ink/70">{report.animal.count} ekor · {report.animal.condition}</p>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-ink/70"><MapPin size={15} className="mt-0.5 flex-none" />{report.location.city}, {report.location.province}</p>
                <p className="mt-2 text-xs text-ink/55">Kode laporan <span className="font-semibold tracking-wide text-ink">{report.id}</span></p>
              </div>

              <div>
                <label htmlFor="donate-amount" className="mb-1.5 block text-sm font-semibold">Nominal donasi</label>
                <div className="flex items-center rounded-xl bg-white ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-primary">
                  <span className="pl-4 font-semibold text-ink/60">Rp</span>
                  <input
                    id="donate-amount" inputMode="numeric" autoFocus autoComplete="off" placeholder="0"
                    value={raw ? new Intl.NumberFormat("id-ID").format(Number(raw)) : ""}
                    onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                    aria-invalid={error ? true : undefined}
                    className="w-full rounded-xl bg-transparent px-3 py-2.5 text-lg font-semibold outline-none"
                  />
                </div>
                {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
              </div>

              <button type="submit" className="w-full rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark">Donasi</button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
