import { dummyStats } from "@/data/dummyReports";
import { ensureRemoteReports, getRemoteReports } from "./remoteReports";

export interface ReportStats { dead: number; inCare: number; rescued: number }

/**
 * Angka dasar + satwa dari laporan yang dikirim lewat formulir (tersimpan di database):
 * - kondisi "Ditemukan mati"           → satwa mati terbakar
 * - status Selesai                      → satwa terselamatkan
 * - laporan aktif (selain di atas, tidak ditolak) → satwa dalam penanganan
 * Hanya panggil dari client.
 */
export function computeStats(): ReportStats {
  const stats: ReportStats = { dead: dummyStats.dead, inCare: dummyStats.inCare, rescued: dummyStats.rescued };
  ensureRemoteReports();
  for (const r of getRemoteReports()) {
    const n = r.animal.count;
    if (r.animal.condition === "Ditemukan mati") stats.dead += n;
    else if (r.status === "Resolved") stats.rescued += n;
    else if (r.status !== "Rejected") stats.inCare += n;
  }
  return stats;
}
