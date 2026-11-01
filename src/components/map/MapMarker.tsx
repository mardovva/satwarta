import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { animalEmoji } from "@/lib/animalEmoji";

/**
 * Marker bulat: warna lingkaran mengikuti status laporan, isinya foto yang dikirim pelapor
 * (atau ikon satwa bila tidak ada foto). Elemen luar dipakai MapLibre untuk posisi (jangan di-transform);
 * efek hover diterapkan pada tombol di dalamnya.
 */
export function createMarkerElement(report: StoredReport): HTMLElement {
  const m = statusMeta[report.status];
  const wrapper = document.createElement("div");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", `Laporan ${report.animal.name || report.animal.type} di ${report.location.city}, status ${report.status}`);
  btn.textContent = animalEmoji(report.animal.name, report.animal.type);
  btn.style.cssText =
    `width:48px;height:48px;border-radius:50%;border:4px solid ${m.dot};background:${m.bg};font-size:22px;line-height:1;cursor:pointer;` +
    "box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s;";
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.12)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  wrapper.appendChild(btn);
  return wrapper;
}

/** Ganti isi marker dengan foto laporan. */
export function setMarkerPhoto(wrapper: HTMLElement, url: string) {
  const btn = wrapper.querySelector("button");
  if (!btn) return;
  btn.textContent = "";
  btn.style.backgroundImage = `url("${url}")`;
  btn.style.backgroundSize = "cover";
  btn.style.backgroundPosition = "center";
}
