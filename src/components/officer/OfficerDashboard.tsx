"use client";
import { useMemo, useState } from "react";
import type { StoredReport, TrackingStatus } from "@/types/report";
import { useAllReports } from "@/hooks/useAllReports";
import OfficerHeader from "./OfficerHeader";
import OfficerStats from "./OfficerStats";
import OfficerMap from "./OfficerMap";
import ReportQueue from "./ReportQueue";
import ReportDetail from "./ReportDetail";

function matches(r: StoredReport, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [r.id, r.animal.name, r.animal.type, r.location.city, r.location.province].some((v) => v.toLowerCase().includes(s));
}

export default function OfficerDashboard() {
  const reports = useAllReports();
  const [filter, setFilter] = useState<TrackingStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [reports]);
  const visible = useMemo(() => sorted.filter((r) => (filter === "all" || r.status === filter) && matches(r, query)), [sorted, filter, query]);
  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const select = (id: string, scroll: boolean) => {
    setSelectedId(id);
    const small = window.matchMedia("(max-width: 1023px)").matches;
    if (scroll || small) requestAnimationFrame(() => document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="min-h-screen bg-cream">
      <OfficerHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Dasbor Petugas</h1>
        <p className="mt-1 text-sm text-ink/70">Terima, verifikasi, dan tindak lanjuti laporan satwa terdampak karhutla.</p>

        <div className="mt-6"><OfficerStats reports={reports} filter={filter} onFilter={setFilter} /></div>

        <h2 className="mb-3 mt-8 text-xl font-bold">Peta persebaran</h2>
        <OfficerMap onSelect={(id) => select(id, true)} />

        <h2 className="mb-3 mt-10 text-xl font-bold">Laporan masuk</h2>
        <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <ReportQueue reports={visible} selectedId={selectedId} query={query} onQuery={setQuery} onSelect={(id) => select(id, false)} />
          <ReportDetail report={selected} />
        </div>
      </main>
    </div>
  );
}
