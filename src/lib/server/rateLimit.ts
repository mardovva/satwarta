// Pembatas permintaan per kunci (mis. alamat IP).
//  * allowShared: hitungan disimpan di database (supabase/schema.sql 8f), berlaku untuk SEMUA instance server sekaligus.
//    Bila database/fungsinya tidak tersedia, otomatis memakai pembatas memori di bawah (per instance, hilang saat restart).
//  * allow: pembatas memori murni.
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/admin";

const buckets = new Map<string, number[]>();

/** true = diizinkan; false = melewati batas `limit` per `windowMs`. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { buckets.set(key, recent); return false; }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k); // bersih-bersih
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

let warned = false;

/** Seperti allow(), tetapi hitungannya dibagi antar semua instance server lewat database. */
export async function allowShared(key: string, limit: number, windowMs: number): Promise<boolean> {
  const c = supabaseConfigured();
  if (c.url && c.secretKey) {
    try {
      const { data, error } = await supabaseAdmin().rpc("rate_limit_hit", { p_key: key.slice(0, 200), p_limit: limit, p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)) });
      if (!error && typeof data === "boolean") return data;
      if (!warned) { warned = true; console.error("[rateLimit] pembatas bersama tidak tersedia (jalankan supabase/migrations/005_shared_rate_limit.sql); memakai pembatas memori.", error?.code ?? "", error?.message ?? ""); }
    } catch (e) {
      if (!warned) { warned = true; console.error("[rateLimit] database tidak dapat dihubungi; memakai pembatas memori.", e instanceof Error ? e.message : e); }
    }
  }
  return allow(key, limit, windowMs);
}

/** Tanggal (WIB) untuk kunci batas harian, mis. "2026-11-09". */
export const jakartaDay = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

/** Batas harian global (semua pengunjung). `cap` diambil dari variabel lingkungan; 0 atau kosong = tanpa batas. */
export const dailyCap = (envName: string, fallback: number): number => {
  const raw = process.env[envName];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

export async function allowDaily(name: string, cap: number): Promise<boolean> {
  if (cap <= 0) return true;
  return allowShared(`${name}:${jakartaDay()}`, cap, 86_400_000);
}
