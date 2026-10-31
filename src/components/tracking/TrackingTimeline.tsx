import type { StatusHistoryEntry } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { formatDateTime } from "@/lib/tracking";

export default function TrackingTimeline({ history }: { history: StatusHistoryEntry[] }) {
  const last = history.length - 1;
  return (
    <ol className="relative ml-3 border-l-2 border-primary/20">
      {history.map((h, i) => {
        const meta = statusMeta[h.status];
        const current = i === last;
        return (
          <li key={`${h.status}-${h.at}`} className="relative pb-6 pl-6 last:pb-0">
            <span
              aria-hidden
              className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${current ? "ring-4 ring-primary/20" : ""}`}
              style={{ backgroundColor: meta.dot }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: meta.bg, color: meta.fg }}>{h.status}</span>
              {current && <span className="text-xs font-semibold text-accent">Status terkini</span>}
            </div>
            <time dateTime={h.at} className="mt-1 block text-xs text-ink/55">{formatDateTime(h.at)}</time>
            <p className="mt-1 text-sm font-medium">{h.note}</p>
            <p className="text-xs text-ink/55">{meta.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
