"use client";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { statusMeta, statusOrder } from "@/data/trackingStatuses";
import { TRACK_EVENT, findReport, type TrackingLookup } from "@/lib/tracking";
import TrackingResult from "./TrackingResult";

type Result =
  | { state: "idle" }
  | { state: "error"; message: string }
  | { state: "notfound"; id: string }
  | { state: "found"; lookup: TrackingLookup };

const exampleIds = ["SWT-2026-0901", "SWT-2026-0902", "SWT-2026-0903", "SWT-2026-0904"];

export default function TrackingSection() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });

  const runSearch = useCallback((raw: string) => {
    if (!raw.trim()) { setResult({ state: "error", message: "Masukkan ID laporan terlebih dahulu." }); return; }
    const lookup = findReport(raw);
    setResult(lookup ? { state: "found", lookup } : { state: "notfound", id: raw.trim() });
  }, []);

  // Dipicu dari modal sukses ("Lacak laporan")
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

        <p className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs text-ink/65">
          <span>Coba ID contoh:</span>
          {exampleIds.map((id) => (
            <button key={id} type="button" onClick={() => { setInput(id); runSearch(id); }} className="rounded-full bg-white px-3 py-1 font-medium text-primary shadow-sm ring-1 ring-primary/25 hover:bg-primary hover:text-white">
              {id}
            </button>
          ))}
        </p>

        <div aria-live="polite" className="text-left">
          {result.state === "error" && <p className="mt-6 text-center text-sm font-medium text-red-600">{result.message}</p>}
          {result.state === "notfound" && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-5 text-center shadow-sm">
              <p className="font-semibold">Laporan <span className="font-bold">{result.id}</span> tidak ditemukan.</p>
              <p className="mt-1 text-sm text-ink/65">Periksa kembali penulisan ID. Pada mode demo, hanya laporan yang dibuat di browser ini dan ID contoh di atas yang dapat dicari.</p>
            </div>
          )}
          {result.state === "found" && <TrackingResult lookup={result.lookup} />}
        </div>

        <details className="mx-auto mt-8 max-w-xl rounded-2xl bg-white/85 p-4 text-left text-sm shadow-sm">
          <summary className="cursor-pointer font-semibold text-primary">Arti setiap status laporan</summary>
          <ul className="mt-3 space-y-2">
            {statusOrder.map((s) => (
              <li key={s} className="flex flex-wrap items-baseline gap-x-2">
                <span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: statusMeta[s].bg, color: statusMeta[s].fg }}>{s}</span>
                <span className="text-ink/70">{statusMeta[s].description}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
