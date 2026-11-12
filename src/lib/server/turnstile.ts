// Verifikasi Cloudflare Turnstile (CAPTCHA) di SERVER. Token dikirim browser lewat header X-Turnstile-Token dan diperiksa ke
// Cloudflare sebelum isi permintaan dibaca. Token hanya berlaku sekali dan kedaluwarsa dalam 5 menit.
//
// Kebijakan:
//  * TURNSTILE_SECRET_KEY kosong      -> verifikasi dilewati (mode pengembangan). /api/db-status menampilkan statusnya.
//  * Cloudflare menjawab "tidak valid" -> DITOLAK.
//  * Cloudflare sendiri gangguan (jaringan putus, timeout, status 5xx) -> DITERIMA dan dicatat: laporan satwa darurat
//    tidak boleh tertahan oleh gangguan layanan CAPTCHA.
const DEFAULT_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type CaptchaResult = { ok: true; skipped?: "no-secret" | "provider-down" } | { ok: false; reason: "missing" | "invalid" };

export const turnstileStatus = () => ({ siteKey: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, secretKey: !!process.env.TURNSTILE_SECRET_KEY });

export async function verifyTurnstile(token: unknown, ip: string): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: "no-secret" };
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return { ok: false, reason: "missing" };

  const url = process.env.TURNSTILE_VERIFY_URL || DEFAULT_URL; // TURNSTILE_VERIFY_URL hanya untuk pengujian
  const timeout = Number(process.env.TURNSTILE_TIMEOUT_MS) || 5000;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "local") body.set("remoteip", ip);
    const res = await fetch(url, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(timeout) });
    if (!res.ok) { console.error("[turnstile] layanan Cloudflare menjawab", res.status, "- verifikasi dilewati"); return { ok: true, skipped: "provider-down" }; }
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success === true) return { ok: true };
    const codes = data["error-codes"] ?? [];
    if (codes.includes("invalid-input-secret") || codes.includes("missing-input-secret")) console.error("[turnstile] TURNSTILE_SECRET_KEY ditolak Cloudflare: periksa nilainya. Semua pengiriman akan gagal sampai diperbaiki.");
    return { ok: false, reason: "invalid" };
  } catch (e) {
    console.error("[turnstile] tidak dapat menghubungi Cloudflare:", e instanceof Error ? e.message : e, "- verifikasi dilewati");
    return { ok: true, skipped: "provider-down" };
  }
}

