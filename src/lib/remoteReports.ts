// Salinan laporan dari server (database) di sisi browser. Tampilan lain membacanya lewat getAllReports() (tracking.ts),
// dan memperbarui diri lewat REPORTS_UPDATED_EVENT. Hanya dipakai di client.
import type { StoredReport } from "@/types/report";
import { REPORTS_UPDATED_EVENT } from "./reports";

let remote: StoredReport[] = [];
let state: "idle" | "started" = "idle";

export const getRemoteReports = (): StoredReport[] => remote;

/** Ambil ulang daftar laporan. `fresh` melewati cache CDN (mis. tepat setelah mengirim laporan). */
export async function refreshRemoteReports(fresh = false): Promise<void> {
  try {
    const res = await fetch(`/api/reports${fresh ? `?v=${Date.now()}` : ""}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { reports?: StoredReport[] };
    if (Array.isArray(data.reports)) {
      remote = data.reports;
      window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
    }
  } catch { /* jaringan putus: tetap memakai data terakhir */ }
}

/** Mulai memuat sekali, lalu menyegarkan tiap 60 detik selama tab terlihat. Aman dipanggil berulang. */
export function ensureRemoteReports(): void {
  if (typeof window === "undefined" || state === "started") return;
  state = "started";
  void refreshRemoteReports();
  window.setInterval(() => { if (!document.hidden) void refreshRemoteReports(); }, 60_000);
}

/** Satu laporan menurut ID (untuk Lacak). Disisipkan ke salinan bila belum ada. */
export async function fetchRemoteReport(id: string): Promise<StoredReport | null> {
  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { report?: StoredReport | null };
    const report = data.report ?? null;
    if (report && !remote.some((r) => r.id === report.id)) { remote = [report, ...remote]; window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT)); }
    return report;
  } catch { return null; }
}
