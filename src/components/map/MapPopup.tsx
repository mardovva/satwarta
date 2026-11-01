import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { animalEmoji } from "@/lib/animalEmoji";
import { handlerLabel } from "@/lib/handler";
import { formatDate } from "@/lib/tracking";

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

/** Isi popup dibangun dengan DOM (textContent), bukan string HTML, agar aman dari XSS. */
export function createReportPopupContent(r: StoredReport, onDetail: () => void): HTMLElement {
  const root = el("div", "min-width:220px;font-size:13px;line-height:1.5;color:#171717");
  const title = r.animal.name || `Satwa ${r.animal.type.toLowerCase()}`;

  const photo = el("img", "display:none;width:100%;height:120px;object-fit:cover;border-radius:12px;margin-bottom:8px");
  photo.setAttribute("data-photo", "");
  photo.alt = `Foto laporan ${title}`;

  const head = el("div", "display:flex;align-items:center;gap:10px;margin-bottom:8px");
  head.append(
    el("span", "width:38px;height:38px;border-radius:50%;background:#E6EFE4;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none", animalEmoji(r.animal.name, r.animal.type)),
    el("strong", "font-size:15px", title)
  );
  root.append(photo, head, row("Lokasi", `${r.location.city}, ${r.location.province}`), row("Kondisi", r.animal.condition), row("Tanggal", formatDate(r.createdAt)), row("Ditangani oleh", handlerLabel(r)));

  const m = statusMeta[r.status];
  const status = el("p", "margin:4px 0 0");
  status.append(
    el("b", "", "Status: "),
    el("span", `display:inline-block;border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600;background:${m.bg};color:${m.fg}`, r.status)
  );
  root.append(status);

  const btn = el("button", "margin-top:10px;background:#345542;color:#fff;border:0;border-radius:999px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer", "Lihat Detail");
  btn.type = "button";
  btn.addEventListener("click", onDetail);
  root.append(btn);
  return root;
}

/** Tampilkan foto laporan di bagian atas popup. */
export function setPopupPhoto(root: HTMLElement, url: string) {
  const img = root.querySelector<HTMLImageElement>("img[data-photo]");
  if (!img) return;
  img.src = url;
  img.style.display = "block";
}

/** Popup untuk satu titik hotspot NASA FIRMS. */
export function createHotspotPopupContent(p: Record<string, unknown>): HTMLElement {
  const root = el("div", "min-width:170px;font-size:13px;line-height:1.5;color:#171717");
  root.append(
    el("strong", "font-size:14px;display:block;margin-bottom:4px", "Hotspot NASA FIRMS"),
    row("Terdeteksi", `${p.date} ${p.time} UTC`),
    row("Satelit", String(p.satellite)),
    row("Keyakinan", String(p.confidence)),
    row("FRP", `${Number(p.frp).toFixed(1)} MW`),
    el("p", "margin:6px 0 0;font-size:11px;color:#666", "Indikasi panas dari satelit, belum tentu kebakaran.")
  );
  return root;
}
