import { Search } from "lucide-react";
import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { formatDate } from "@/lib/tracking";

interface Props {
  reports: StoredReport[];
  selectedId: string | null;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: string) => void;
}

export default function ReportQueue({ reports, selectedId, query, onQuery, onSelect }: Props) {
  return (
    <section aria-label="Daftar laporan" className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" />
        <label htmlFor="officer-search" className="sr-only">Cari laporan</label>
        <input
          id="officer-search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Cari ID, satwa, atau lokasi"
          className="w-full rounded-xl bg-cream py-2.5 pl-9 pr-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary"
        />
      </div>

      <ul className="mt-3 space-y-2 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
        {reports.map((r) => {
          const m = statusMeta[r.status];
          const active = r.id === selectedId;
          return (
            <li key={r.id}>
              <button
                type="button" onClick={() => onSelect(r.id)} aria-current={active ? "true" : undefined}
                className={`w-full rounded-2xl p-3 text-left transition ${active ? "bg-primary/10 ring-2 ring-primary" : "bg-cream ring-1 ring-black/5 hover:ring-primary/40"}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-bold">{r.id}</span>
                  <span className="flex-none rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: m.bg, color: m.fg }}>{r.status}</span>
                </span>
                <span className="mt-0.5 block text-sm">{r.animal.name || `Satwa ${r.animal.type.toLowerCase()}`} · {r.animal.count} ekor</span>
                <span className="block text-xs text-ink/60">{r.location.city}, {r.location.province} · {formatDate(r.createdAt)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {reports.length === 0 && <p className="mt-6 text-center text-sm text-ink/60">Tidak ada laporan yang sesuai.</p>}
    </section>
  );
}
