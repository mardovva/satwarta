"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { statusMeta } from "@/data/trackingStatuses";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { getMyReports } from "@/lib/myReports";
import { TRACK_EVENT, formatDate, lookupReport, type TrackingLookup } from "@/lib/tracking";
import type { StoredReport } from "@/types/report";
import Decor from "@/components/layout/Decor";
import Reveal from "@/components/ui/Reveal";
import TrackingResult from "./TrackingResult";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "notfound"; id: string }
  | { state: "found"; lookup: TrackingLookup };

export default function TrackingSection() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });
  const [recent, setRecent] = useState<StoredReport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const clear = () => { setInput(""); setResult({ state: "idle" }); inputRef.current?.focus(); };

  const runSearch = useCallback(async (raw: string) => {
    if (!raw.trim()) { setResult({ state: "error", message: "Masukkan ID laporan terlebih dahulu." }); return; }
    setResult({ state: "loading" });
    const lookup = await lookupReport(raw); // salinan lokal dulu, lalu bertanya ke server
    setResult(lookup ? { state: "found", lookup } : { state: "notfound", id: raw.trim() });
  }, []);

  // Riwayat laporan yang dikirim pengguna di browser ini (terbaru di atas)
  useEffect(() => {
    const load = () => setRecent(getMyReports(5));
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
    <section id="track" className="relative z-10 px-4 pb-4 pt-16">
      {/* branch-leaf sejajar dengan judul "Lacak Laporan" */}
      <Decor src="/images/branches/branch-leaf.png" width={505} height={262} sway="left center" className="-left-4 hidden w-[14rem] sm:top-7 sm:block lg:-left-8 lg:-top-5 lg:w-[26.25rem]" />
      <Decor src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-right-3 top-24 hidden w-[8rem] md:block lg:-right-5 lg:w-[13.125rem]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal><h2 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">Lacak Laporan</h2></Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={(e) => { e.preventDefault(); runSearch(input); }} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label htmlFor="track-id" className="sr-only">ID laporan</label>
            <div className="relative flex-1">
              <input
                id="track-id" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Masukkan ID laporan SWT-2026-0000" autoComplete="off" spellCheck={false}
                className="w-full rounded-xl bg-white py-3 pl-4 pr-10 text-[0.9375rem] shadow-sm outline-none ring-1 ring-black/5 placeholder:text-ink/40 focus:ring-2 focus:ring-primary"
              />
              {input && (
                <button type="button" onClick={clear} aria-label="Hapus pencarian" className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/50 transition hover:bg-mist hover:text-ink">
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-white shadow-md transition hover:bg-primary-dark">
              <Search size={18} /> Lacak laporan
            </button>
          </form>
        </Reveal>

        {recent.length > 0 && (
          <Reveal delay={0.15}>
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
                      <span className="flex-none rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: statusMeta[r.status].bg, color: statusMeta[r.status].fg }}>{statusMeta[r.status].label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <div aria-live="polite" className="text-left">
          {result.state === "loading" && <p className="mt-6 text-center text-sm font-medium text-ink/60">Mencari laporan…</p>}
          {result.state === "error" && <p className="mt-6 text-center text-sm font-medium text-red-600">{result.message}</p>}
          {result.state === "notfound" && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-5 text-center shadow-sm">
              <p className="font-semibold">Laporan <span className="font-bold">{result.id}</span> tidak ditemukan.</p>
              <p className="mt-1 text-sm text-ink/65">Periksa kembali penulisan ID laporan Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* hasil selebar peta dan formulir */}
      <div className="relative z-10">
        {result.state === "found" && <Reveal key={result.lookup.report.id}><TrackingResult lookup={result.lookup} onClose={() => { setInput(""); setResult({ state: "idle" }); }} /></Reveal>}
      </div>
    </section>
  );
}
