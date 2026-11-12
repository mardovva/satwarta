"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, type OfficerSession } from "@/lib/auth";
import { roleLabel } from "@/types/officer";
import type { StoredReport, TrackingStatus } from "@/types/report";
import { useOfficerSession } from "@/hooks/useOfficerSession";
import { useOfficerReports } from "@/hooks/useOfficerReports";
import OfficerHeader from "./OfficerHeader";
import OfficerLoginScreen from "./OfficerLoginScreen";
import OfficerStats from "./OfficerStats";
import OfficerMap from "./OfficerMap";
import ReportQueue from "./ReportQueue";
import ReportDetail from "./ReportDetail";

function matches(r: StoredReport, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [r.id, r.animal.name, r.animal.type, r.location.city, r.location.province].some((v) => v.toLowerCase().includes(s));
}

function DashboardContent({ officer, onLogout }: { officer: OfficerSession; onLogout: () => void }) {
  const { reports, loading, error, refresh } = useOfficerReports();
  const isAdmin = officer.role === "admin";
  const allRegions = officer.role !== "officer";
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
      <OfficerHeader onLogout={onLogout} links={isAdmin ? [{ href: "/petugas/kelola", label: "Kelola petugas" }] : []} />
      <main className="pb-20 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{officer.name}</h1>
          <p className="text-sm text-ink/70">{officer.agency} · <span className="font-semibold">{roleLabel[officer.role]}</span></p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Wilayah kerja:</span>
            {allRegions
              ? <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">Semua wilayah</span>
              : officer.regions.length > 0
                ? officer.regions.map((r) => <span key={r} className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{r}</span>)
                : <span className="text-xs font-medium text-amber-700">Belum ada wilayah kerja. Hubungi admin untuk menetapkannya.</span>}
          </div>
        </section>

        <div className="mt-6"><OfficerStats reports={reports} filter={filter} onFilter={setFilter} /></div>
        </div>

        {/* peta selebar peta di Beranda (pelapor); memakai lokasi tepat dari server */}
        <div className="mx-auto mt-8 w-[92%] max-w-[83.125rem] md:w-[84%]">
          <h2 className="mb-3 text-xl font-bold">Peta persebaran</h2>
          <OfficerMap reports={reports} onSelect={(id) => select(id, true)} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <h2 className="mb-3 mt-10 text-xl font-bold">Laporan masuk</h2>
        {loading && <p className="mb-3 text-sm text-ink/60">Memuat laporan…</p>}
        {error && (
          <p role="alert" className="mb-3 text-sm font-medium text-red-600">
            {error} <button type="button" onClick={() => void refresh()} className="font-semibold underline">Coba lagi</button>
          </p>
        )}
        <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <ReportQueue reports={visible} selectedId={selectedId} query={query} onQuery={setQuery} onSelect={(id) => select(id, false)} />
          <ReportDetail report={selected} session={officer} onChanged={() => void refresh()} />
        </div>
        </div>
      </main>
    </div>
  );
}

/** Pintu masuk halaman petugas: wajib login (Supabase Auth); hanya akun yang terdaftar sebagai petugas yang diterima server. */
export default function OfficerDashboard() {
  const router = useRouter();
  const state = useOfficerSession();

  if (state.status === "loading") return <div className="min-h-screen bg-cream" />;
  if (state.status === "anon") return <OfficerLoginScreen notice={state.notice} />;
  return <DashboardContent officer={state.officer} onLogout={() => { void signOut().then(() => router.push("/")); }} />;
}
