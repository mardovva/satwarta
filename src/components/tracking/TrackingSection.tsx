"use client";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { statusMeta } from "@/data/trackingStatuses";
import { REPORTS_UPDATED_EVENT, getStoredReports } from "@/lib/reports";
import { TRACK_EVENT, findReport, formatDate, type TrackingLookup } from "@/lib/tracking";
import type { StoredReport } from "@/types/report";
import TrackingResult from "./TrackingResult";

type Result =
  | { state: "idle" }
  | { state: "error"; message: string }
  | { state: "notfound"; id: string }
  | { state: "found"; lookup: TrackingLookup };

export default function TrackingSection() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });
  const [recent, setRecent] = useState<StoredReport[]>([]);

  const runSearch = useCallback((raw: string) => {
    if (!raw.trim()) { setResult({ state: "error", message: "Masukkan ID laporan terlebih dahulu." }); return; }
    const lookup = findReport(raw);
    setResult(lookup ? { state: "found", lookup } : { state: "notfound", id: raw.trim() });
  }, []);

  // Riwayat laporan yang dikirim pengguna di browser ini (terbaru di atas)
  useEffect(() => {
    const load = () => setRecent(getStoredReports().slice().reverse().slice(0, 5));
    load();
    window.addEventListener(REPORTS_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Dipicu dari modal sukses dan tombol "Lihat Detail" di peta
  useEffect(() => {
    const onTrack = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setInput(id);
      runSearch(id);
    };
    window.addEventListener(TRACK_EVENT, onTrack);
    return () => window.removeEventListener(TRACK_EVENT, onTrack);
  }, [runSearch]);

  return (
    <section id="track" className="relative z-10 px-4 pb-28 pt-16 sm:pb-36">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Track Laporan</h2>
        <p className="mt-3 text-sm text-ink/70 sm:text-base">Masukkan ID laporan untuk melihat perkembangan penanganannya.</p>

        <form onSubmit={(e) => { e.preventDefault(); runSearch(input); }} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="track-id" className="sr-only">ID laporan</label>
          <input
            id="track-id" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: SWT-2026-0001" autoComplete="off" spellCheck={false}
            className="w-full flex-1 rounded-xl bg-white px-4 py-3 text-[15px] shadow-sm outline-none ring-1 ring-black/5 placeholder:text-ink/40 focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-white shadow-md transition hover:bg-primary-dark">
            <Search size={18} /> Cari Laporan
          </button>
        </form>

        {recent.length > 0 && (
          <div className="mx-auto mt-6 max-w-xl text-left">
            <h3 className="mb-2 text-sm font-semibold text-primary">Riwayat laporan Anda</h3>
            <ul className="space-y-2">
              {recent.map((r) => (
                <li key={r.id}>
                  <button
                    type="button" onClick={() => { setInput(r.id); runSearch(r.id); }}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-black/5 transition hover:ring-primary/40"
                  >
                    <span>
                      <span className="block font-bold">{r.id}</span>
                      <span className="block text-xs text-ink/60">{r.animal.name || r.animal.type} · {formatDate(r.createdAt)}</span>
                    </span>
                    <span className="flex-none rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: statusMeta[r.status].bg, color: statusMeta[r.status].fg }}>{r.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div aria-live="polite" className="text-left">
          {result.state === "error" && <p className="mt-6 text-center text-sm font-medium text-red-600">{result.message}</p>}
          {result.state === "notfound" && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-5 text-center shadow-sm">
              <p className="font-semibold">Laporan <span className="font-bold">{result.id}</span> tidak ditemukan.</p>
              <p className="mt-1 text-sm text-ink/65">Periksa kembali penulisan ID laporan Anda.</p>
            </div>
          )}
          {result.state === "found" && <TrackingResult lookup={result.lookup} />}
        </div>
      </div>
    </section>
  );
}
