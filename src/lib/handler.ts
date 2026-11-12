import type { OfficerRef, StoredReport } from "@/types/report";

/** Petugas yang pertama kali memproses laporan (menerimanya) menjadi penanggung jawab. */
export function getHandler(report: StoredReport): OfficerRef | null {
  for (const h of report.history) if (h.officer) return h.officer;
  return null;
}

export function handlerLabel(report: StoredReport): string {
  const h = getHandler(report);
  return h ? `${h.name} (${h.agency})` : `Menunggu petugas wilayah ${report.location.province}`;
}
