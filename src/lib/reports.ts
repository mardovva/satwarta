import type { StoredReport } from "@/types/report";

const KEY = "satwarta:reports:v1";

/** Dikirim setelah laporan baru tersimpan, agar peta memperbarui marker. */
export const REPORTS_UPDATED_EVENT = "satwarta:reports-updated";

/** Hanya panggil dari client (event handler / useEffect) agar tidak memicu hydration error. */
export function getStoredReports(): StoredReport[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Format SWT-<tahun>-0001, nomor urut melanjutkan yang terbesar pada tahun yang sama. */
export function generateReportId(existing: StoredReport[], year = new Date().getFullYear()): string {
  const prefix = `SWT-${year}-`;
  const max = existing.reduce(
    (m, r) => (r.id.startsWith(prefix) ? Math.max(m, parseInt(r.id.slice(prefix.length), 10) || 0) : m),
    0
  );
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export type NewReportInput = Omit<StoredReport, "id" | "createdAt" | "status" | "history">;

export function saveReport(input: NewReportInput): { report: StoredReport; persisted: boolean } {
  const existing = getStoredReports();
  const now = new Date().toISOString();
  const report: StoredReport = {
    ...input,
    id: generateReportId(existing),
    createdAt: now,
    status: "Submitted",
    history: [{ status: "Submitted", at: now, note: "Laporan berhasil dikirim." }],
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...existing, report]));
    window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
    return { report, persisted: true };
  } catch {
    return { report, persisted: false };
  }
}
