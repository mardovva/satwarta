import type { StoredReport } from "@/types/report";
import { dummyTrackingReports } from "@/data/dummyTracking";
import { getStoredReports, getUpdates, withUpdates } from "./reports";

/** Event untuk mengisi dan menjalankan pencarian dari komponen lain (mis. modal sukses). */
export const TRACK_EVENT = "satwarta:track";

/** "swt-2026-1", "SWT20260001" → "SWT-2026-0001". Input lain dikembalikan dalam huruf besar. */
export function normalizeReportId(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^SWT-?(\d{4})-?(\d{1,4})$/);
  return m ? `SWT-${m[1]}-${m[2].padStart(4, "0")}` : s;
}

export interface TrackingLookup { report: StoredReport; source: "local" | "demo" }

/** Cari di localStorage (laporan buatan sendiri) lalu di data dummy. Panggil hanya dari client. */
export function findReport(rawId: string): TrackingLookup | null {
  const id = normalizeReportId(rawId);
  const local = getStoredReports().find((r) => r.id === id);
  if (local) return { report: withUpdates(local), source: "local" };
  const demo = dummyTrackingReports.find((r) => r.id === id);
  return demo ? { report: withUpdates(demo), source: "demo" } : null;
}

const dateTime = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const dateOnly = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

export const formatDateTime = (iso: string) => `${dateTime.format(new Date(iso))} WIB`;
export const formatDate = (iso: string) => dateOnly.format(new Date(iso));

/** Semua laporan yang tampil di peta: laporan yang sudah ada + laporan dari formulir di browser ini. */
export function getAllReports(): StoredReport[] {
  const updates = getUpdates();
  return [...dummyTrackingReports, ...getStoredReports()].map((r) => withUpdates(r, updates));
}

/** Gulir ke bagian Track Laporan dan tampilkan laporan dengan ID tersebut. */
export function goToTracking(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("track")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: id }));
}
