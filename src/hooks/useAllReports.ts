"use client";
import { useEffect, useState } from "react";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { getAllReports } from "@/lib/tracking";
import type { StoredReport } from "@/types/report";

/** Semua laporan (termasuk pembaruan petugas); diperbarui otomatis saat data berubah. */
export function useAllReports(): StoredReport[] {
  const [reports, setReports] = useState<StoredReport[]>([]);
  useEffect(() => {
    const load = () => setReports(getAllReports());
    load();
    window.addEventListener(REPORTS_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return reports;
}
