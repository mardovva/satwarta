import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { allowShared, clientIp } from "@/lib/server/rateLimit";
import { PLEDGE_MAX, PLEDGE_METHODS, PLEDGE_MIN, insertPledge, listPublicPledges, reportPledgeState } from "@/lib/server/pledgesDb";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const dynamic = "force-dynamic";

const dbReady = () => { const c = supabaseConfigured(); return c.url && c.secretKey; };
const fail = (status: number, error: string, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

/** Daftar donasi untuk semua penggalangan, dibagi ke semua perangkat. Nama donatur anonim dikosongkan. */
export async function GET() {
  if (!dbReady()) return NextResponse.json({ pledges: [], configured: false });
  try {
    const pledges = await listPublicPledges();
    return NextResponse.json({ pledges, configured: true }, { headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15" } });
  } catch (e) {
    console.error("[pledges GET]", e instanceof Error ? e.message : e);
    return fail(502, "Data donasi belum dapat dimuat.");
  }
}

/** Catat donasi baru (JSON). Pembayaran masih simulasi. */
export async function POST(req: Request) {
  if (!dbReady()) return fail(503, "db_off");
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return fail(413, "Permintaan terlalu besar.");
  if (!(await allowShared(`pledge:${clientIp(req)}`, 8, 10 * 60_000))) return fail(429, "Terlalu banyak donasi dari perangkat ini. Coba lagi beberapa menit lagi.");

  const captcha = await verifyTurnstile(req.headers.get("x-turnstile-token"), clientIp(req));
  if (!captcha.ok) return fail(403, captcha.reason === "missing" ? "Verifikasi keamanan belum selesai. Tunggu sebentar lalu coba lagi." : "Verifikasi keamanan gagal. Silakan coba lagi.", { captcha: true });

  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; } catch { return fail(400, "Permintaan tidak valid."); }
  if (!body || typeof body !== "object") return fail(400, "Permintaan tidak valid.");

  const reportId = clean(body.reportId, 20).toUpperCase();
  const amount = body.amount;
  const method = clean(body.method, 60);
  if (!/^SWT-\d{4}-\d{4}$/.test(reportId)) return fail(422, "Penggalangan tidak dikenal.");
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount < PLEDGE_MIN || amount > PLEDGE_MAX) return fail(422, `Nominal donasi harus antara Rp ${PLEDGE_MIN.toLocaleString("id-ID")} dan Rp ${PLEDGE_MAX.toLocaleString("id-ID")}.`);
  if (!(PLEDGE_METHODS as readonly string[]).includes(method)) return fail(422, "Metode pembayaran tidak dikenal.");

  try {
    const state = await reportPledgeState(reportId);
    if (state === "missing") return fail(404, "Penggalangan tidak ditemukan.");
    if (state === "closed") return fail(409, "Penggalangan ini sudah ditutup.");
    const pledge = await insertPledge({ reportId, amount, name: clean(body.name, 60), anonymous: body.anonymous === true, message: clean(body.message, 200), method });
    return NextResponse.json({ pledge }, { status: 201 });
  } catch (e) {
    console.error("[pledges POST]", e instanceof Error ? e.message : e);
    return fail(500, "Donasi belum dapat disimpan. Silakan coba lagi.");
  }
}
