import type { StoredReport } from "@/types/report";
import { dummyTrackingReports } from "@/data/dummyTracking";
import { ensureRemoteReports, fetchRemoteReport, getRemoteReports } from "./remoteReports";

/** Event untuk mengisi dan menjalankan pencarian dari komponen lain (mis. modal sukses). */
export const TRACK_EVENT = "satwarta:track";

/** "swt-2026-1", "SWT20260001" → "SWT-2026-0001". Input lain dikembalikan dalam huruf besar. */
export function normalizeReportId(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^SWT-?(\d{4})-?(\d{1,4})$/);
  return m ? `SWT-${m[1]}-${m[2].padStart(4, "0")}` : s;
}

export interface TrackingLookup { report: StoredReport; source: "server" | "demo" | "local" }

/** Cari di data contoh dan salinan laporan dari server. Sinkron: hanya yang sudah dimuat. Panggil hanya dari client. */
export function findReport(rawId: string): TrackingLookup | null {
  const id = normalizeReportId(rawId);
  const live = getRemoteReports().find((r) => r.id === id);
  if (live) return { report: live, source: "server" };
  const demo = dummyTrackingReports.find((r) => r.id === id);
  return demo ? { report: demo, source: "demo" } : null;
}

/** Seperti findReport, tetapi bila belum ada di salinan, bertanya ke server. */
export async function lookupReport(rawId: string): Promise<TrackingLookup | null> {
  const known = findReport(rawId);
  if (known) return known;
  const fetched = await fetchRemoteReport(normalizeReportId(rawId));
  return fetched ? { report: fetched, source: "server" } : null;
}

const dateTime = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const dateOnly = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

export const formatDateTime = (iso: string) => `${dateTime.format(new Date(iso))} WIB`;
export const formatDate = (iso: string) => dateOnly.format(new Date(iso));

/** Semua laporan yang tampil di peta: data contoh + laporan dari server (database). Memulai pemuatan dari server bila belum. */
export function getAllReports(): StoredReport[] {
  ensureRemoteReports();
  return [...dummyTrackingReports, ...getRemoteReports()];
}

/** Gulir ke bagian Lacak Laporan dan tampilkan laporan dengan ID tersebut. */
export function goToTracking(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("track")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: id }));
}
