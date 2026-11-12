// Login petugas lewat Supabase Auth (email + kata sandi). Akun dibuat oleh admin di dashboard Supabase;
// tidak ada pendaftaran mandiri. Server memeriksa token dan peran di setiap permintaan (src/lib/server/officerAuth.ts).
import { browserSupabase } from "./supabase/browser";

export interface OfficerSession {
  /** ID akun petugas (sama dengan officer.username pada riwayat laporan versi petugas) */
  username: string;
  name: string;
  agency: string;
  role: "officer" | "national" | "admin";
  /** Wilayah kerja (provinsi). Kosong untuk admin = semua wilayah. */
  regions: string[];
}

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const sb = browserSupabase();
  if (!sb) return { ok: false, message: "Layanan login belum dikonfigurasi di server ini." };
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (!error) return { ok: true };
  if (error.status === 429) return { ok: false, message: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi." };
  if (error.status === 400 || error.status === 401) return { ok: false, message: "Email atau kata sandi salah." };
  return { ok: false, message: "Tidak dapat masuk saat ini. Periksa koneksi lalu coba lagi." };
}

export async function signOut(): Promise<void> {
  try { await browserSupabase()?.auth.signOut(); } catch { /* abaikan */ }
}

async function accessToken(): Promise<string | null> {
  const { data } = (await browserSupabase()?.auth.getSession()) ?? { data: { session: null } };
  return data.session?.access_token ?? null;
}

/** fetch ke API petugas dengan token sesi. Bila sesi tidak ada atau ditolak (401), pengguna dikeluarkan. */
export async function officerFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  const res = await fetch(path, { ...init, cache: "no-store", headers: { ...(init.headers as Record<string, string> | undefined), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (res.status === 401) await signOut();
  return res;
}
