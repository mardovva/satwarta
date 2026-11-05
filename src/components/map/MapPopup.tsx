import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { handlerLabel } from "@/lib/handler";
import { fallbackPhoto } from "@/lib/placeholderPhoto";
import { formatDate } from "@/lib/tracking";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css = "", text?: string) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Dua kolom rata kiri: label di kiri, keterangan di kanan. */
function infoGrid(rows: [string, Node | string][]) {
  const grid = el("div", "display:grid;grid-template-columns:max-content 1fr;column-gap:14px;row-gap:4px;text-align:left;align-items:start");
  for (const [label, value] of rows) {
    grid.append(el("div", "font-weight:700;text-align:left", label));
    const cell = el("div", "text-align:left;overflow-wrap:anywhere");
    if (typeof value === "string") cell.textContent = value;
    else cell.append(value);
    grid.append(cell);
  }
  return grid;
}

/** Isi popup dibangun dengan DOM (textContent), bukan string HTML, agar aman dari XSS. */
export function createReportPopupContent(r: StoredReport, onDetail: () => void): HTMLElement {
  const root = el("div", "width:250px;max-width:100%;font-size:13px;line-height:1.5;color:#171717;text-align:left");
  const title = r.animal.name || `Satwa ${r.animal.type.toLowerCase()}`;

  const photo = el("img", "display:none;width:100%;height:120px;object-fit:cover;border-radius:12px;margin-bottom:8px");
  photo.setAttribute("data-photo", "");
  photo.alt = `Foto laporan ${title}`;
  photo.onerror = () => { photo.onerror = null; photo.src = fallbackPhoto(); };

  const m = statusMeta[r.status];
  const chip = el("span", `display:inline-block;border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600;background:${m.bg};color:${m.fg}`, m.label);

  const btn = el("button", "margin-top:12px;background:#345542;color:#fff;border:0;border-radius:999px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer", "Lihat Detail");
  btn.type = "button";
  btn.addEventListener("click", onDetail);

  root.append(
    photo,
    el("strong", "display:block;font-size:15px;margin-bottom:6px;padding-right:26px", title),
    infoGrid([
      ["Lokasi", `${r.location.city}, ${r.location.province}`],
      ["Kondisi", r.animal.condition],
      ["Tanggal", formatDate(r.createdAt)],
      ["Ditangani oleh", handlerLabel(r)],
      ["Status", chip],
    ]),
    btn
  );
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
  const root = el("div", "min-width:200px;font-size:13px;line-height:1.5;color:#171717;text-align:left");
  root.append(
    el("strong", "display:block;font-size:14px;margin-bottom:6px", "Hotspot NASA FIRMS"),
    infoGrid([
      ["Terdeteksi", `${p.date} ${p.time} UTC`],
      ["Satelit", String(p.satellite)],
      ["Keyakinan", String(p.confidence)],
      ["FRP", `${Number(p.frp).toFixed(1)} MW`],
    ]),
    el("p", "margin:8px 0 0;font-size:11px;color:#666", "Indikasi panas dari satelit, belum tentu kebakaran.")
  );
  return root;
}
