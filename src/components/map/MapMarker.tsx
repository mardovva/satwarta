import type { WildlifeReport } from "@/types/report";

/**
 * Marker bulat bergaris putih. Elemen luar dipakai MapLibre untuk posisi (jangan di-transform),
 * efek hover diterapkan pada tombol di dalamnya.
 * Nanti ganti emoji dengan <img> foto dari /public/images/animals.
 */
export function createMarkerElement(report: WildlifeReport): HTMLElement {
  const wrapper = document.createElement("div");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", `Laporan ${report.animal} di ${report.location}`);
  btn.textContent = report.emoji;
  btn.style.cssText =
    "width:44px;height:44px;border-radius:50%;border:3px solid #fff;background:#E6EFE4;font-size:22px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s;";
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.12)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  wrapper.appendChild(btn);
  return wrapper;
}
