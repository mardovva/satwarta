"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReportStatus, WildlifeReport } from "@/types/report";

export const STATUS_STYLES: Record<ReportStatus, { bg: string; fg: string }> = {
  "Menunggu Verifikasi": { bg: "#FDF0D5", fg: "#8A5A00" },
  Terverifikasi: { bg: "#DDEBFF", fg: "#1F4E8C" },
  "Dalam Penanganan": { bg: "#FBE3D2", fg: "#9A4A12" },
  Selesai: { bg: "#DDF0E3", fg: "#245B38" },
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css = "", text?: string) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text !== undefined) e.textContent = text;
  return e;
}

function row(label: string, value: string) {
  const p = el("p", "margin:0");
  p.append(el("b", "", `${label}: `), document.createTextNode(value));
  return p;
}

/** Isi popup dibangun dengan DOM (textContent), bukan string HTML, agar aman dari XSS saat data asli masuk. */
export function createPopupContent(r: WildlifeReport, onDetail: () => void): HTMLElement {
  const root = el("div", "min-width:210px;font-size:13px;line-height:1.5;color:#171717");

  const head = el("div", "display:flex;align-items:center;gap:10px;margin-bottom:8px");
  head.append(
    el("span", "width:38px;height:38px;border-radius:50%;background:#E6EFE4;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none", r.emoji),
    el("strong", "font-size:15px", r.animal)
  );
  root.append(head, row("Lokasi", r.location), row("Kejadian", r.reportType), row("Tanggal", r.date));

  const status = el("p", "margin:4px 0 0");
  status.append(
    el("b", "", "Status: "),
    el("span", `display:inline-block;border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600;background:${STATUS_STYLES[r.status].bg};color:${STATUS_STYLES[r.status].fg}`, r.status)
  );
  root.append(status);

  const btn = el("button", "margin-top:10px;background:#345542;color:#fff;border:0;border-radius:999px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer", "Lihat Detail");
  btn.type = "button";
  btn.addEventListener("click", onDetail);
  root.append(btn);
  return root;
}

export function ReportDetailDialog({ report, onClose }: { report: WildlifeReport; onClose: () => void }) {
  useEffect(() => {
    // capture + stopImmediatePropagation: Esc menutup dialog dulu, bukan fullscreen.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const s = STATUS_STYLES[report.status];
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Detail laporan ${report.animal}`} className="relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6EFE4] text-2xl">{report.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-primary">{report.animal}</h3>
            <p className="text-sm text-ink/60">{report.location}</p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="font-semibold">Kejadian</dt><dd>{report.reportType}</dd>
          <dt className="font-semibold">Tanggal</dt><dd>{report.date}</dd>
          <dt className="font-semibold">Status</dt>
          <dd><span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>{report.status}</span></dd>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">{report.description}</p>
        <p className="mt-4 rounded-xl bg-cream px-3 py-2 text-xs text-ink/60">Data demonstrasi, bukan laporan aktual.</p>
        <button onClick={onClose} className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Tutup</button>
      </div>
    </div>
  );
}
