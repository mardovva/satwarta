import type { StoredReport } from "@/types/report";
import { statusMeta } from "@/data/trackingStatuses";
import { needFor, needsFor, type DonationNeed, type Pledge } from "@/lib/donations";

/** Satu penggalangan donasi = satu laporan satwa. Semua angka berasal dari data laporan dan donasi di browser ini (simulasi). */
export interface Campaign {
  report: StoredReport;
  id: string;
  title: string;
  target: number;
  collected: number;
  /** 0 sampai 100; 100 hanya bila target benar-benar tercapai */
  pct: number;
  donors: number;
  /** Penanganan selesai (target dianggap tercapai) */
  done: boolean;
  /** Laporan sudah diverifikasi petugas */
  verified: boolean;
  urgent: boolean;
  almost: boolean;
  /** Rincian rencana penggunaan dana */
  plan: DonationNeed[];
}

export const MIN_DONATION = 10_000;
export const PRESET_AMOUNTS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000];
/** Perkiraan rata-rata donasi, dipakai untuk menaksir jumlah donatur pada data contoh */
const AVG_GIFT = 85_000;

export const campaignTitle = (r: StoredReport) => r.animal.name || `Satwa ${r.animal.type.toLowerCase()}`;

export function buildCampaign(report: StoredReport, pledges: Pledge[]): Campaign {
  const base = needFor(report);
  const mine = pledges.filter((p) => p.reportId === report.id);
  const added = mine.reduce((sum, p) => sum + p.amount, 0);
  const collected = Math.min(base.target, base.collected + added);
  const full = collected >= base.target;
  const pct = full ? 100 : Math.min(99, Math.round((collected / base.target) * 100));
  const done = report.status === "Resolved";
  return {
    report, id: report.id, title: campaignTitle(report),
    target: base.target, collected, pct,
    donors: Math.round(base.collected / AVG_GIFT) + mine.length,
    done,
    verified: ["Verified", "In Progress", "Resolved"].includes(report.status),
    urgent: !done && !full && pct < 40,
    almost: !done && !full && pct >= 80,
    plan: needsFor(report, []),
  };
}

export type CampaignFilter = "semua" | "mendesak" | "hampir" | "selesai";
export type CampaignSort = "terbaru" | "mendesak" | "hampir" | "donatur";

export interface CampaignQuery { q: string; filter: CampaignFilter; type: string; sort: CampaignSort }

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();

export function filterCampaigns(list: Campaign[], { q, filter, type, sort }: CampaignQuery): Campaign[] {
  const query = norm(q);
  const out = list.filter((c) => {
    if (filter === "mendesak" && !c.urgent) return false;
    if (filter === "hampir" && !c.almost) return false;
    if (filter === "selesai" && !c.done) return false;
    if (type !== "semua" && c.report.animal.type !== type) return false;
    if (!query) return true;
    const hay = norm([c.title, c.id, c.report.animal.type, c.report.animal.condition, c.report.location.city, c.report.location.province].join(" "));
    return hay.includes(query);
  });
  const byNewest = (a: Campaign, b: Campaign) => b.report.createdAt.localeCompare(a.report.createdAt);
  const open = (c: Campaign) => (c.done || c.pct >= 100 ? 1 : 0); // yang masih membutuhkan donasi di depan
  const sorters: Record<CampaignSort, (a: Campaign, b: Campaign) => number> = {
    terbaru: byNewest,
    mendesak: (a, b) => open(a) - open(b) || a.pct - b.pct || byNewest(a, b),
    hampir: (a, b) => open(a) - open(b) || b.pct - a.pct || byNewest(a, b),
    donatur: (a, b) => b.donors - a.donors || byNewest(a, b),
  };
  return [...out].sort(sorters[sort]);
}

export function summarize(list: Campaign[]) {
  return {
    collected: list.reduce((s, c) => s + c.collected, 0),
    donors: list.reduce((s, c) => s + c.donors, 0),
    active: list.filter((c) => !c.done).length,
  };
}

/** "baru saja", "3 jam lalu", "2 hari lalu", dst. */
export function timeAgo(iso: string, now = Date.now()): string {
  const sec = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon} bulan lalu`;
  return `${Math.floor(mon / 12)} tahun lalu`;
}

/** Cerita singkat yang disusun dari data laporan (bukan teks buatan pengguna). */
export function campaignStory(c: Campaign, date: string): string[] {
  const r = c.report;
  return [
    `Pada ${date}, laporan masuk melalui Satwarta: ${c.title} (${r.animal.count} ekor) ditemukan di ${r.location.city}, ${r.location.province} dengan kondisi ${r.animal.condition.toLowerCase()}.`,
    statusMeta[r.status].description,
    `Donasi direncanakan untuk: ${c.plan.map((p) => p.label.toLowerCase()).join(", ")}.`,
  ];
}
