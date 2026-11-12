import type { StoredReport } from "@/types/report";

export interface DonationNeed { id: string; label: string; target: number; collected: number }
export interface Pledge {
  code: string; reportId: string; needId: string; amount: number; name: string; contact: string; at: string;
  /** Donasi anonim: nama tidak ditampilkan */
  anonymous?: boolean;
  /** Doa atau pesan dukungan dari donatur */
  message?: string;
  /** Metode pembayaran yang dipilih (simulasi) */
  method?: string;
}

const KEY = "satwarta:pledges:v1";
export const PLEDGES_EVENT = "satwarta:pledges-updated";

export const formatRupiah = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

export function getPledges(): Pledge[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Mencatat donasi (kode DNS-0001, dst). Hanya panggil dari client. */
export function savePledge(input: Omit<Pledge, "code" | "at">): Pledge {
  const all = getPledges();
  const pledge: Pledge = { ...input, code: `DNS-${String(all.length + 1).padStart(4, "0")}`, at: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...all, pledge]));
    window.dispatchEvent(new Event(PLEDGES_EVENT));
  } catch { /* abaikan */ }
  return pledge;
}

interface Template { id: string; label: string; unit: number }

const TEMPLATES: Record<string, Template[]> = {
  Terluka: [
    { id: "medis", label: "Perawatan dokter hewan", unit: 1_500_000 },
    { id: "obat", label: "Obat dan perlengkapan medis", unit: 750_000 },
    { id: "transport", label: "Transportasi ke pusat rehabilitasi", unit: 1_000_000 },
  ],
  Terjebak: [
    { id: "alat", label: "Peralatan evakuasi", unit: 1_200_000 },
    { id: "transport", label: "Transportasi tim lapangan", unit: 900_000 },
  ],
  Mengungsi: [
    { id: "pakan", label: "Pakan darurat", unit: 600_000 },
    { id: "shelter", label: "Shelter sementara", unit: 1_500_000 },
  ],
  "Terpapar asap": [
    { id: "pemulihan", label: "Perawatan pemulihan", unit: 1_000_000 },
    { id: "pakan", label: "Pakan dan hidrasi", unit: 500_000 },
  ],
  "Ditemukan mati": [
    { id: "pemeriksaan", label: "Pemeriksaan penyebab kematian", unit: 800_000 },
    { id: "habitat", label: "Pemulihan habitat sekitar", unit: 1_000_000 },
  ],
};
const DEFAULT_TEMPLATE: Template[] = [{ id: "operasional", label: "Dana operasional penanganan", unit: 1_000_000 }];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Kebutuhan donasi sebuah laporan (disusun dari kondisi dan jumlah satwa) beserta dana yang sudah terkumpul. */
export function needsFor(report: StoredReport, pledges: Pledge[]): DonationNeed[] {
  const multiplier = Math.min(Math.max(report.animal.count, 1), 5);
  const seeded = /^SWT-\d{4}-09\d{2}$/.test(report.id);
  return (TEMPLATES[report.animal.condition] ?? DEFAULT_TEMPLATE).map((t) => {
    const target = t.unit * multiplier;
    let collected = 0;
    if (report.status === "Resolved") collected = target;
    else if (seeded) collected = Math.round((target * (15 + (hash(report.id + t.id) % 60))) / 100 / 10_000) * 10_000;
    collected += pledges.filter((p) => p.reportId === report.id && p.needId === t.id).reduce((sum, p) => sum + p.amount, 0);
    return { id: t.id, label: t.label, target, collected: Math.min(collected, target) };
  });
}

/** Satu target capaian donasi per laporan (jumlah semua kebutuhan penanganan). */
export function needFor(report: StoredReport): DonationNeed {
  const multiplier = Math.min(Math.max(report.animal.count, 1), 5);
  const templates = TEMPLATES[report.animal.condition] ?? DEFAULT_TEMPLATE;
  const target = templates.reduce((sum, t) => sum + t.unit, 0) * multiplier;
  const seeded = /^SWT-\d{4}-09\d{2}$/.test(report.id);
  let collected = 0;
  if (report.status === "Resolved") collected = target;
  else if (seeded) collected = Math.round((target * (15 + (hash(report.id) % 60))) / 100 / 10_000) * 10_000;
  return { id: "total", label: "Target donasi", target, collected };
}
