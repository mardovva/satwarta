"use client";
import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { Basemap } from "./MapLegend";

interface Props { basemap: Basemap; reports: number; hotspots: number | null; days: number | null }

/** Keterangan simbol peta (kaca buram seperti kontrol lain): arti lingkaran foto dan titik panas. Dapat dilipat. */
export default function MapKey({ basemap, reports, hotspots, days }: Props) {
  const [open, setOpen] = useState(true);
  const text = basemap === "satelit" ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]" : "text-ink";
  const sub = basemap === "satelit" ? "text-white/80" : "text-ink/65";

  return (
    <div className={`absolute right-3 top-14 z-10 w-[min(15.5rem,calc(100%-1.5rem))] rounded-2xl border border-white/50 bg-white/25 shadow-nav backdrop-blur-xl backdrop-saturate-150 ${text}`}>
      <button
        type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="map-key-panel"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold"
      >
        <span className="inline-flex items-center gap-1.5"><Info size={14} /> Keterangan peta</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul id="map-key-panel" className="space-y-2.5 border-t border-white/40 px-3 pb-3 pt-2.5 text-xs leading-snug">
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="mt-0.5 h-6 w-6 flex-none rounded-full border-2 border-white bg-gradient-to-br from-[#9DB3A5] to-[#345542] shadow" />
            <span>
              <span className="block font-semibold">Laporan satwa ({reports})</span>
              <span className={`block ${sub}`}>Lingkaran berfoto. Klik untuk melihat foto, status, dan detail laporan.</span>
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="relative mt-0.5 flex h-6 w-6 flex-none items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#FF6A2B]/40" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#FF8A4C] ring-1 ring-white/70" />
            </span>
            <span>
              <span className="block font-semibold">Titik panas NASA FIRMS{hotspots !== null ? ` (${new Intl.NumberFormat("id-ID").format(hotspots)})` : ""}</span>
              <span className={`block ${sub}`}>{hotspots === null ? "Memuat data satelit…" : `Deteksi satelit${days ? ` ${days} hari terakhir` : ""}. Klik titik untuk waktu dan tingkat keyakinan.`}</span>
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

