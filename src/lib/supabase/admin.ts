// Koneksi ke Supabase dari SERVER (API route). Memakai SECRET KEY yang melewati Row Level Security,
// jadi file ini TIDAK BOLEH diimpor dari komponen browser ("use client") dan kuncinya tidak boleh berawalan NEXT_PUBLIC_.
// Nama variabel mengikuti dokumentasi Supabase: SUPABASE_URL (atau NEXT_PUBLIC_SUPABASE_URL) dan SUPABASE_SECRET_KEY.
// Kunci lama bernama service_role tetap diterima lewat SUPABASE_SERVICE_ROLE_KEY.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseConfigured = () => ({ url: !!url(), secretKey: !!secret() });

let client: SupabaseClient | null = null;

/** Klien admin (satu per proses). Melempar galat bila variabel lingkungan belum diatur. */
export function supabaseAdmin(): SupabaseClient {
  if (!url() || !secret()) throw new Error("Supabase belum dikonfigurasi (SUPABASE_URL / SUPABASE_SECRET_KEY)");
  client ??= createClient(url(), secret(), {
    auth: { persistSession: false, autoRefreshToken: false },
    // Next.js 14 menyimpan hasil fetch() di cache secara bawaan. Data laporan harus selalu terbaru, jadi cache dimatikan.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

