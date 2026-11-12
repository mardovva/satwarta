"use client";
import { useCallback, useEffect, useState } from "react";
import { officerFetch } from "@/lib/auth";
import type { StoredReport } from "@/types/report";

/** Laporan dalam wilayah kerja petugas (lengkap dengan kontak pelapor). Menyegarkan tiap 30 detik saat tab terlihat. */
export function useOfficerReports() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await officerFetch("/api/petugas/reports");
      if (!res.ok) { if (res.status !== 401) setError("Laporan belum dapat dimuat."); return; }
      const data = (await res.json()) as { reports: StoredReport[] };
      setReports(data.reports);
      setError("");
    } catch { setError("Tidak dapat terhubung ke server."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30_000);
    return () => window.clearInterval(t);
  }, [refresh]);

  return { reports, loading, error, refresh };
}
