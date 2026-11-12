// Daftar ID laporan yang dikirim dari browser ini (untuk "Riwayat laporan Anda" dan AI Chat). Hanya ID yang disimpan;
// isi laporan selalu diambil dari server.
import type { StoredReport } from "@/types/report";
import { getAllReports } from "./tracking";

const KEY = "satwarta:my-reports:v1";

export function getMyReportIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}

export function rememberMyReport(id: string): void {
  try {
    const ids = [id, ...getMyReportIds().filter((x) => x !== id)].slice(0, 50);
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch { /* penyimpanan penuh atau dimatikan: abaikan */ }
}

/** Laporan milik browser ini, terbaru di atas. */
export function getMyReports(limit = 5): StoredReport[] {
  const all = getAllReports();
  return getMyReportIds().map((id) => all.find((r) => r.id === id)).filter((r): r is StoredReport => !!r).slice(0, limit);
}
