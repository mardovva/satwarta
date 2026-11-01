import type { StatusHistoryEntry, StoredReport } from "@/types/report";

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

// ---------- Pembaruan oleh petugas ----------
const UPDATES_KEY = "satwarta:officer-updates:v1";
type UpdatesMap = Record<string, StatusHistoryEntry[]>;

export function getUpdates(): UpdatesMap {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(UPDATES_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Gabungkan pembaruan petugas ke riwayat laporan; status mengikuti pembaruan terakhir. */
export function withUpdates(report: StoredReport, updates: UpdatesMap = getUpdates()): StoredReport {
  const extra = updates[report.id];
  if (!extra?.length) return report;
  const history = [...report.history, ...extra];
  return { ...report, history, status: history[history.length - 1].status };
}

export function addStatusUpdate(reportId: string, entry: StatusHistoryEntry): boolean {
  const all = getUpdates();
  all[reportId] = [...(all[reportId] ?? []), entry];
  try {
    window.localStorage.setItem(UPDATES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}
