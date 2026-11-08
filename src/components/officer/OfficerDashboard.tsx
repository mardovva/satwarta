"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { enterAsOfficer, getSession, logout, type OfficerSession } from "@/lib/auth";
import { officerAccounts } from "@/data/officerAccounts";
import { REGIONS_EVENT, getRegions, saveRegions } from "@/lib/officerRegions";
import type { StoredReport, TrackingStatus } from "@/types/report";
import { useAllReports } from "@/hooks/useAllReports";
import OfficerHeader from "./OfficerHeader";
import RegionPicker from "./RegionPicker";
import OfficerStats from "./OfficerStats";
import OfficerMap from "./OfficerMap";
import ReportQueue from "./ReportQueue";
import ReportDetail from "./ReportDetail";

function matches(r: StoredReport, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [r.id, r.animal.name, r.animal.type, r.location.city, r.location.province].some((v) => v.toLowerCase().includes(s));
}

function DashboardContent({ session, onLogout, onSwitch }: { session: OfficerSession; onLogout: () => void; onSwitch: (username: string) => void }) {
  const allReports = useAllReports();
  const [regions, setRegions] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const load = () => setRegions(getRegions(session.username));
    load();
    window.addEventListener(REGIONS_EVENT, load);
    return () => window.removeEventListener(REGIONS_EVENT, load);
  }, [session.username]);

  // Petugas hanya menerima laporan dari wilayah kerjanya
  const reports = useMemo(() => allReports.filter((r) => regions.includes(r.location.province)), [allReports, regions]);
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
      <OfficerHeader onLogout={onLogout} />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-8 sm:pt-28">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{session.name}</h1>
              <p className="text-sm text-ink/70">{session.agency}</p>
            </div>
            <label className="text-xs font-semibold text-ink/60">
              Ganti petugas
              <select value={session.username} onChange={(e) => onSwitch(e.target.value)} className="mt-1 block rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-ink outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary">
                {officerAccounts.map((a) => <option key={a.username} value={a.username}>{a.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Wilayah kerja:</span>
            {regions.map((r) => <span key={r} className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{r}</span>)}
            <button type="button" onClick={() => setPickerOpen(true)} className="rounded-full px-3 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/40 hover:bg-accent/10">Ubah wilayah</button>
          </div>
        </section>

        <div className="mt-6"><OfficerStats reports={reports} filter={filter} onFilter={setFilter} /></div>

        <h2 className="mb-3 mt-8 text-xl font-bold">Peta persebaran</h2>
        <OfficerMap regions={regions} onSelect={(id) => select(id, true)} />

        <h2 className="mb-3 mt-10 text-xl font-bold">Laporan masuk</h2>
        <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <ReportQueue reports={visible} selectedId={selectedId} query={query} onQuery={setQuery} onSelect={(id) => select(id, false)} />
          <ReportDetail report={selected} session={session} />
        </div>
      </main>
      {pickerOpen && (
        <RegionPicker
          initial={regions}
          onClose={() => setPickerOpen(false)}
          onSave={(r) => { saveRegions(session.username, r); setPickerOpen(false); setSelectedId(null); }}
        />
      )}
    </div>
  );
}

/** Pintu masuk halaman petugas: langsung masuk tanpa login (memakai petugas terakhir yang dipakai). */
export default function OfficerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<OfficerSession | null>(null);

  useEffect(() => { setSession(getSession() ?? enterAsOfficer()); }, []);

  if (!session) return <div className="min-h-screen bg-cream" />;

  return (
    <DashboardContent
      session={session}
      onSwitch={(username) => setSession(enterAsOfficer(username))}
      onLogout={() => { logout(); router.push("/"); }}
    />
  );
}
