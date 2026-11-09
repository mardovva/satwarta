import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/admin";
import { turnstileStatus } from "@/lib/server/turnstile";

export const dynamic = "force-dynamic";

const TABLES = ["officers", "report_counters", "reports", "report_history", "report_photos", "pledges"] as const;

/**
 * Cek koneksi ke database: buka /api/db-status di browser.
 * Hanya menampilkan ya/tidak (tanpa isi data, jumlah, atau kunci). Hapus folder src/app/api/db-status bila tidak diperlukan lagi.
 */
export async function GET() {
  const configured = supabaseConfigured();
  if (!configured.url || !configured.secretKey) {
    return NextResponse.json({
      configured, connected: false,
      hint: "Variabel belum terbaca. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY di .env.local (atau Environment Variables di Vercel), lalu jalankan ulang server.",
    });
  }

  const db = supabaseAdmin();
  const tables: Record<string, true | string> = {};
  for (const t of TABLES) {
    // GET dengan limit(0) (bukan HEAD) agar kode galat dari database ikut terbaca; tidak ada baris yang diambil
    const { error } = await db.from(t).select("*", { count: "exact" }).limit(0);
    tables[t] = !error ? true : error.code === "42P01" || error.code === "PGRST205" ? "belum dibuat (jalankan supabase/schema.sql)" : `galat ${error.code ?? ""} ${(error.message ?? "").slice(0, 80)}`.trim();
  }
  const okTables = Object.values(tables).filter((v) => v === true).length;

  let bucket: true | string = "tidak ditemukan";
  try {
    const { data, error } = await db.storage.getBucket("report-photos");
    bucket = !error && data ? true : "tidak ditemukan (jalankan supabase/schema.sql)";
  } catch { bucket = "galat"; }

  const connected = okTables > 0;
  let rateLimit: "bersama" | string = "memori (jalankan supabase/migrations/005_shared_rate_limit.sql)";
  try { const { data, error } = await db.rpc("rate_limit_hit", { p_key: "db-status-probe", p_limit: 1_000_000, p_window_seconds: 60 }); if (!error && typeof data === "boolean") rateLimit = "bersama"; } catch { /* tetap memori */ }
  const ts = turnstileStatus();
  return NextResponse.json({
    configured, connected, tables, bucket,
    rateLimit,
    captcha: ts.siteKey && ts.secretKey ? "aktif" : ts.siteKey || ts.secretKey ? "tidak lengkap (isi site key DAN secret key)" : "belum dikonfigurasi",
    ready: okTables === TABLES.length && bucket === true,
    ...(connected ? {} : { hint: "Variabel terbaca tetapi koneksi gagal. Periksa URL proyek dan Secret key (tanpa spasi atau tanda kutip), lalu restart server." }),
  });
}
