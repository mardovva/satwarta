"use client";
import ProgressFill from "@/components/ui/ProgressFill";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Share2, ShieldCheck, X } from "lucide-react";
import { statusMeta } from "@/data/trackingStatuses";
import { useReportPhotos } from "@/hooks/useReportPhotos";
import { campaignStory, timeAgo, type Campaign } from "@/lib/campaigns";
import { formatRupiah, type Pledge } from "@/lib/donations";
import { handleImgError } from "@/lib/placeholderPhoto";
import { formatDate, formatDateTime } from "@/lib/tracking";
import DonateForm from "./DonateForm";

type Tab = "cerita" | "kabar" | "rencana" | "donatur";
interface Props { campaign: Campaign; pledges: Pledge[]; onClose: () => void }

/** Halaman rinci penggalangan (jendela): galeri, progres, tab Cerita/Kabar/Rencana/Donatur, dan panel donasi. */
export default function CampaignDetail({ campaign: c, pledges, onClose }: Props) {
  const { history, reporterPhotos } = useReportPhotos(c.report);
  const [tab, setTab] = useState<Tab>("cerita");
  const [shot, setShot] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = useMemo(() => {
    const all = [...reporterPhotos, ...history.flatMap((h) => h.photos ?? [])];
    return all.length ? all : [{ url: "/images/animals/missing.jpg", caption: "Foto belum tersedia" }];
  }, [reporterPhotos, history]);
  const mine = useMemo(() => pledges.filter((p) => p.reportId === c.id).sort((a, b) => b.at.localeCompare(a.at)), [pledges, c.id]);
  const others = Math.max(0, c.donors - mine.length);
  const meta = statusMeta[c.report.status];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const share = async () => {
    const url = `${window.location.origin}/donasi?kampanye=${encodeURIComponent(c.id)}`;
    try {
      if (navigator.share) { await navigator.share({ title: `Bantu ${c.title}`, text: `Bantu ${c.title} di Satwarta`, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* dibatalkan pengguna */ }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "cerita", label: "Cerita" },
    { id: "kabar", label: `Kabar Terbaru (${history.length})` },
    { id: "rencana", label: "Rencana Dana" },
    { id: "donatur", label: `Donatur (${c.donors})` },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[120] animate-fade-in overflow-y-auto bg-black/50 p-3 motion-reduce:animate-none sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Donasi untuk ${c.title}`} className="relative mx-auto my-2 w-full max-w-5xl animate-pop-in rounded-3xl bg-white shadow-soft motion-reduce:animate-none" onClick={(e) => e.stopPropagation()}>
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button type="button" onClick={share} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/90 px-3 text-sm font-semibold text-primary shadow hover:bg-white">
            {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? "Tautan disalin" : "Bagikan"}
          </button>
          <button type="button" onClick={onClose} aria-label="Tutup" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* galeri, judul, progres */}
          <div className="min-w-0 md:col-start-1">
            <div className="overflow-hidden rounded-2xl bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[Math.min(shot, images.length - 1)].url} alt={images[Math.min(shot, images.length - 1)].caption} onError={handleImgError} className="h-64 w-full object-cover sm:h-80" />
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex max-w-full gap-2 overflow-x-auto pb-1">
                {images.slice(0, 8).map((im, i) => (
                  <button key={i} type="button" onClick={() => setShot(i)} aria-label={`Foto ${i + 1}`} aria-pressed={i === shot} className={`h-14 w-20 flex-none overflow-hidden rounded-lg ring-2 ${i === shot ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" onError={handleImgError} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-primary sm:text-3xl">{c.title}</h2>
            <p className="text-sm text-ink/70">{c.report.animal.count} ekor · {c.report.animal.condition} · {c.report.location.city}, {c.report.location.province}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: meta.bg, color: meta.fg }}>{meta.label}</span>
              {c.verified && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"><ShieldCheck size={13} /> Terverifikasi petugas</span>}
              <span className="font-semibold tracking-wide text-ink/50">{c.id}</span>
              <span className="text-ink/50">· dibuat {timeAgo(c.report.createdAt)}</span>
            </div>

            <div className="mt-5 rounded-2xl bg-cream p-4 ring-1 ring-black/5">
              <p><span className="text-2xl font-bold text-primary">{formatRupiah(c.collected)}</span> <span className="text-sm text-ink/60">terkumpul dari {formatRupiah(c.target)}</span></p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={c.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progres donasi">
                <ProgressFill pct={c.pct} className="h-full rounded-full bg-accent" delay={350} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink/60"><span>{c.pct}% tercapai</span><span>{c.donors} donatur</span></div>
            </div>
          </div>

          {/* panel donasi */}
          <aside className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start md:sticky md:top-4">
            <DonateForm campaign={c} onShare={share} />
          </aside>

          {/* tab */}
          <div className="min-w-0 md:col-start-1">
            <div role="tablist" aria-label="Rincian penggalangan" className="flex gap-1 overflow-x-auto border-b border-black/10">
              {tabs.map((t) => (
                <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-ink/55 hover:text-ink"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div role="tabpanel" key={tab} className="animate-tab-in pt-4 text-[0.9375rem] leading-relaxed text-ink/85 motion-reduce:animate-none">
              {tab === "cerita" && (
                <div className="space-y-3">
                  {campaignStory(c, formatDate(c.report.createdAt)).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}

              {tab === "kabar" && (
                <ol className="space-y-4">
                  {[...history].reverse().map((h, i) => {
                    const m = statusMeta[h.status];
                    return (
                      <li key={`${h.at}-${i}`} className="rounded-2xl bg-cream p-4 ring-1 ring-black/5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: m.bg, color: m.fg }}>{m.label}</span>
                          <span className="text-ink/55">{formatDateTime(h.at)}</span>
                        </div>
                        {h.note && <p className="mt-2">{h.note}</p>}
                        {h.officer && <p className="mt-1 text-xs text-ink/55">Oleh {h.officer.name}, {h.officer.agency}</p>}
                        {h.photos && h.photos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {h.photos.map((p, j) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={j} src={p.url} alt={p.caption} onError={handleImgError} className="h-20 w-28 rounded-lg object-cover" />
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {history.length === 0 && <li className="text-ink/60">Belum ada kabar terbaru.</li>}
                </ol>
              )}

              {tab === "rencana" && (
                <div>
                  <ul className="space-y-3">
                    {c.plan.map((n) => {
                      const share = Math.round((n.target / c.target) * 100);
                      return (
                        <li key={n.id}>
                          <div className="flex items-baseline justify-between gap-3"><span className="font-semibold">{n.label}</span><span className="whitespace-nowrap font-semibold text-primary">{formatRupiah(n.target)}</span></div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist"><ProgressFill pct={share} className="h-full rounded-full bg-primary/60" /></div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 flex justify-between border-t border-black/10 pt-3 font-bold"><span>Total target</span><span className="text-primary">{formatRupiah(c.target)}</span></div>
                </div>
              )}

              {tab === "donatur" && (
                <ul className="space-y-3">
                  {mine.map((p) => (
                    <li key={p.code} className="rounded-2xl bg-cream p-4 ring-1 ring-black/5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{p.anonymous || !p.name ? "Donatur anonim" : p.name}</span>
                        <span className="whitespace-nowrap font-semibold text-primary">{formatRupiah(p.amount)}</span>
                      </div>
                      <p className="text-xs text-ink/50">{timeAgo(p.at)}</p>
                      {p.message && <p className="mt-1.5 italic text-ink/80">“{p.message}”</p>}
                    </li>
                  ))}
                  {others > 0 && <li className="text-ink/70">{mine.length > 0 ? "dan " : ""}{others} donatur lainnya.</li>}
                  {c.donors === 0 && <li className="text-ink/60">Belum ada donatur. Jadilah yang pertama membantu.</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
