"use client";
import { useState } from "react";
import { Camera, ChevronDown } from "lucide-react";
import type { HistoryPhoto, StatusHistoryEntry } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { formatDateTime } from "@/lib/tracking";
import PhotoLightbox from "./PhotoLightbox";

interface Props {
  history: StatusHistoryEntry[];
  /** Foto yang dikirim pelapor, ditampilkan pada langkah pertama (Submitted) */
  reporterPhotos: HistoryPhoto[];
}

export default function TrackingTimeline({ history, reporterPhotos }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [viewer, setViewer] = useState<{ photos: HistoryPhoto[]; index: number } | null>(null);
  const last = history.length - 1;

  return (
    <>
      <ol className="relative ml-3 border-l-2 border-primary/20">
        {history.map((h, i) => {
          const meta = statusMeta[h.status];
          const current = i === last;
          const photos = h.photos?.length ? h.photos : i === 0 ? reporterPhotos : [];
          const isOpen = open === i;
          const chip = (
            <span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: meta.bg, color: meta.fg }}>{h.status}</span>
          );
          return (
            <li key={`${h.status}-${h.at}`} className="relative pb-6 pl-6 last:pb-0">
              <span
                aria-hidden
                className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${current ? "ring-4 ring-primary/20" : ""}`}
                style={{ backgroundColor: meta.dot }}
              />
              <div className="flex flex-wrap items-center gap-2">
                {photos.length > 0 ? (
                  <button
                    type="button" aria-expanded={isOpen} aria-controls={`step-photos-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="inline-flex items-center gap-2 rounded-full bg-white py-0.5 pl-0.5 pr-3 text-xs font-medium text-primary ring-1 ring-primary/30 transition hover:ring-primary"
                  >
                    {chip}
                    <Camera size={14} aria-hidden /> {photos.length} foto
                    <ChevronDown size={14} aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : chip}
                {current && <span className="text-xs font-semibold text-accent">Status terkini</span>}
              </div>
              <time dateTime={h.at} className="mt-1 block text-xs text-ink/55">{formatDateTime(h.at)}</time>
              <p className="mt-1 text-sm font-medium">{h.note}</p>
              <p className="text-xs text-ink/55">{meta.description}</p>

              {isOpen && (
                <div id={`step-photos-${i}`} className="mt-3">
                  <p className="mb-2 text-xs font-semibold text-ink/70">{photos[0].caption}</p>
                  <ul className="flex flex-wrap gap-2">
                    {photos.map((p, k) => (
                      <li key={k}>
                        <button type="button" onClick={() => setViewer({ photos, index: k })} aria-label={`Perbesar foto ${k + 1}`} className="block overflow-hidden rounded-xl ring-1 ring-black/10 transition hover:ring-2 hover:ring-primary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={`${p.caption} ${k + 1}`} className="h-20 w-20 object-cover sm:h-24 sm:w-24" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {viewer && <PhotoLightbox photos={viewer.photos} index={viewer.index} onClose={() => setViewer(null)} />}
    </>
  );
}
