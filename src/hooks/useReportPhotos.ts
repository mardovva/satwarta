"use client";
import { useEffect, useMemo, useState } from "react";
import { loadPhotos } from "@/lib/photoStore";
import type { HistoryPhoto, StatusHistoryEntry, StoredReport } from "@/types/report";

/**
 * Memuat foto pelapor dan foto petugas dari IndexedDB.
 * Mengembalikan riwayat dengan foto sudah terisi, serta foto pelapor.
 */
export function useReportPhotos(report: StoredReport): { history: StatusHistoryEntry[]; reporterPhotos: HistoryPhoto[] } {
  const [reporter, setReporter] = useState<HistoryPhoto[]>([]);
  const [officer, setOfficer] = useState<Record<string, HistoryPhoto[]>>({});
  const key = report.history.map((h) => `${h.at}:${h.storedPhotos ?? 0}`).join("|");

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];
    setReporter([]);
    setOfficer({});

    const reporterJob = report.photos.length > 0 ? loadPhotos(report.id, report.photos.length, "Foto dari pelapor") : Promise.resolve([] as HistoryPhoto[]);
    const officerJobs = report.history
      .filter((h) => h.storedPhotos)
      .map((h) => loadPhotos(`${report.id}:o:${h.at}`, h.storedPhotos ?? 0, "Dokumentasi petugas").then((ps) => [h.at, ps] as const));

    Promise.all([reporterJob, Promise.all(officerJobs)]).then(([rp, ops]) => {
      urls = [...rp, ...ops.flatMap(([, ps]) => ps)].map((p) => p.url);
      if (cancelled) { urls.forEach((u) => URL.revokeObjectURL(u)); return; }
      setReporter(rp);
      setOfficer(Object.fromEntries(ops));
    });

    return () => { cancelled = true; urls.forEach((u) => URL.revokeObjectURL(u)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id, report.photos.length, key]);

  const history = useMemo(
    () => report.history.map((h) => (h.storedPhotos ? { ...h, photos: officer[h.at] ?? [] } : h)),
    [report.history, officer]
  );
  return { history, reporterPhotos: reporter };
}
