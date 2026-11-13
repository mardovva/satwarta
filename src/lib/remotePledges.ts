// Salinan donasi dari server (database) di sisi browser, sama untuk semua perangkat. usePledges() membacanya dan memperbarui diri
// lewat PLEDGES_EVENT. Hanya dipakai di client.
import { PLEDGES_EVENT, type Pledge } from "./donations";

let remote: Pledge[] = [];
let state: "idle" | "started" = "idle";

export const getRemotePledges = (): Pledge[] => remote;

/** Ambil ulang daftar donasi. `fresh` melewati cache CDN (mis. tepat setelah berdonasi). */
export async function refreshRemotePledges(fresh = false): Promise<void> {
  try {
    const res = await fetch(`/api/pledges${fresh ? `?v=${Date.now()}` : ""}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { pledges?: Pledge[] };
    if (Array.isArray(data.pledges)) {
      remote = data.pledges;
      window.dispatchEvent(new Event(PLEDGES_EVENT));
    }
  } catch { /* jaringan putus: tetap memakai data terakhir */ }
}

/** Mulai memuat sekali, lalu menyegarkan tiap 20 detik dan setiap tab kembali terlihat. Aman dipanggil berulang. */
export function ensureRemotePledges(): void {
  if (typeof window === "undefined" || state === "started") return;
  state = "started";
  void refreshRemotePledges();
  window.setInterval(() => { if (!document.hidden) void refreshRemotePledges(); }, 20_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) void refreshRemotePledges(); });
}

export interface PledgeDraft { reportId: string; amount: number; name: string; anonymous: boolean; message: string; method: string }
export type PledgeResult = { ok: true; pledge: Pledge } | { ok: false; message: string };

/** Kirim donasi ke server (POST /api/pledges). Pembayaran masih simulasi. */
export async function submitPledge(d: PledgeDraft, captchaToken?: string | null): Promise<PledgeResult> {
  try {
    const res = await fetch("/api/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(captchaToken ? { "X-Turnstile-Token": captchaToken } : {}) },
      body: JSON.stringify(d),
    });
    const data = (await res.json().catch(() => ({}))) as { pledge?: Pledge; error?: string };
    if (res.ok && data.pledge) {
      const pledge = data.pledge;
      remote = [pledge, ...remote.filter((p) => p.code !== pledge.code)]; // tampil seketika; daftar resmi menyusul lewat refresh
      window.dispatchEvent(new Event(PLEDGES_EVENT));
      void refreshRemotePledges(true);
      return { ok: true, pledge };
    }
    if (res.status === 503) return { ok: false, message: "Layanan donasi belum aktif. Silakan coba lagi nanti." };
    return { ok: false, message: data.error || "Donasi belum dapat dikirim. Silakan coba lagi." };
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi." };
  }
}
