import type { StoredReport, TrackingStatus } from "@/types/report";
import { statusMeta, statusOrder } from "@/data/trackingStatuses";
import { statusLabel } from "@/data/officerWorkflow";

interface Props {
  reports: StoredReport[];
  filter: TrackingStatus | "all";
  onFilter: (f: TrackingStatus | "all") => void;
}

export default function OfficerStats({ reports, filter, onFilter }: Props) {
  const count = (s: TrackingStatus) => reports.filter((r) => r.status === s).length;
  const card = (active: boolean) =>
    `flex flex-col items-start rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${active ? "ring-2 ring-primary" : "ring-black/5"}`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <button type="button" aria-pressed={filter === "all"} onClick={() => onFilter("all")} className={card(filter === "all")}>
        <span className="text-3xl font-bold text-primary">{reports.length}</span>
        <span className="text-sm text-ink/70">Semua laporan</span>
      </button>
      {statusOrder.map((s) => (
        <button key={s} type="button" aria-pressed={filter === s} onClick={() => onFilter(filter === s ? "all" : s)} className={card(filter === s)}>
          <span className="text-3xl font-bold" style={{ color: statusMeta[s].dot }}>{count(s)}</span>
          <span className="text-sm text-ink/70">{statusLabel[s]}</span>
        </button>
      ))}
    </div>
  );
}
