import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";

const PAW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/>' +
  '<path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>';

/**
 * Marker lingkaran penuh berwarna sesuai status laporan. Elemen luar dipakai MapLibre untuk posisi
 * (jangan di-transform); efek hover diterapkan pada tombol di dalamnya.
 */
export function createMarkerElement(report: StoredReport): HTMLElement {
  const m = statusMeta[report.status];
  const wrapper = document.createElement("div");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", `Laporan ${report.animal.name || report.animal.type} di ${report.location.city}, status ${m.label}`);
  btn.innerHTML = PAW;
  btn.style.cssText =
    `width:42px;height:42px;border-radius:50%;border:3px solid #fff;background:${m.dot};cursor:pointer;` +
    "box-shadow:0 2px 10px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s;";
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.12)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  wrapper.appendChild(btn);
  return wrapper;
}
