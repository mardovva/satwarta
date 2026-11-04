import { dummyStats } from "@/data/dummyReports";
import { getStoredReports, withUpdates } from "./reports";

export interface ReportStats { dead: number; inCare: number; rescued: number }

/**
 * Angka dasar + satwa dari laporan baru yang dikirim lewat formulir (tersimpan di browser):
 * - kondisi "Ditemukan mati"           → satwa mati terbakar
 * - status Selesai                      → satwa terselamatkan
 * - laporan aktif (selain di atas, tidak ditolak) → satwa dalam penanganan
 * Hanya panggil dari client.
 */
export function computeStats(): ReportStats {
  const stats: ReportStats = { dead: dummyStats.dead, inCare: dummyStats.inCare, rescued: dummyStats.rescued };
  for (const raw of getStoredReports()) {
    const r = withUpdates(raw);
    const n = r.animal.count;
    if (r.animal.condition === "Ditemukan mati") stats.dead += n;
    else if (r.status === "Resolved") stats.rescued += n;
    else if (r.status !== "Rejected") stats.inCare += n;
  }
  return stats;
}
