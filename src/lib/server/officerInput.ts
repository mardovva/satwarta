// Validasi masukan pengelolaan petugas (SERVER, fungsi murni). Aturan yang sama dipakai untuk menambah dan mengubah akun.
import { provinces } from "@/data/locations";

export const ROLES = ["officer", "national", "admin"] as const;
export type Role = (typeof ROLES)[number];

export interface OfficerCreate { email: string; password: string; fullName: string; agency: string; role: Role; regions: string[] }
export interface OfficerPatch { fullName?: string; agency?: string; role?: Role; regions?: string[]; active?: boolean; password?: string }
export type Parsed<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/g;
const text = (v: unknown) => (typeof v === "string" ? v.replace(CONTROL, " ").replace(/\s+/g, " ").trim() : "");

/** Supabase Auth menolak domain contoh/uji (error email_address_invalid). Ditolak lebih awal agar pesannya jelas. */
const BLOCKED_HOSTS = new Set(["test", "example", "invalid", "local", "localhost", "test.com", "example.com", "example.net", "example.org"]);
export const EMAIL_HINT = "Gunakan email dengan domain nyata. Supabase menolak domain contoh atau uji (example.com, .test, .local). Alias Gmail seperti nama+kode@gmail.com boleh dipakai.";

export function validateEmail(raw: unknown): string | null {
  const email = text(raw).toLowerCase();
  if (!email || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
  const host = email.split("@")[1];
  const tld = host.split(".").pop() ?? "";
  if (BLOCKED_HOSTS.has(host) || BLOCKED_HOSTS.has(tld)) return EMAIL_HINT;
  return null;
}

export function validatePassword(raw: unknown): string | null {
  if (typeof raw !== "string") return "Kata sandi wajib diisi.";
  if (raw.length < 10) return "Kata sandi minimal 10 karakter.";
  if (raw.length > 72) return "Kata sandi maksimal 72 karakter.";
  if (!/[A-Za-z]/.test(raw) || !/[0-9]/.test(raw)) return "Kata sandi harus memuat huruf dan angka.";
  return null;
}

const regionList = (v: unknown): string[] | null => {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const x of v) {
    const r = text(x);
    if (!Object.prototype.hasOwnProperty.call(provinces, r)) return null;
    if (!out.includes(r)) out.push(r);
  }
  return out;
};

export function parseCreate(raw: unknown): Parsed<OfficerCreate> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const email = text(r.email).toLowerCase();
  const emailErr = validateEmail(r.email); if (emailErr) errors.email = emailErr;
  const passErr = validatePassword(r.password); if (passErr) errors.password = passErr;
  const fullName = text(r.fullName); if (fullName.length < 2 || fullName.length > 80) errors.fullName = "Nama 2 sampai 80 karakter.";
  const agency = text(r.agency); if (agency.length < 2 || agency.length > 120) errors.agency = "Instansi 2 sampai 120 karakter.";
  const role = text(r.role) as Role; if (!ROLES.includes(role)) errors.role = "Peran tidak valid.";
  let regions: string[] = [];
  if (role === "officer") {
    const list = regionList(r.regions);
    if (!list) errors.regions = "Wilayah tidak valid."; else if (list.length === 0) errors.regions = "Pilih minimal satu wilayah kerja.";
    else regions = list;
  } // national dan admin: semua wilayah, daftar dikosongkan
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { email, password: r.password as string, fullName, agency, role, regions } };
}

export function parsePatch(raw: unknown): Parsed<OfficerPatch> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const v: OfficerPatch = {};
  if ("fullName" in r) { const x = text(r.fullName); if (x.length < 2 || x.length > 80) errors.fullName = "Nama 2 sampai 80 karakter."; else v.fullName = x; }
  if ("agency" in r) { const x = text(r.agency); if (x.length < 2 || x.length > 120) errors.agency = "Instansi 2 sampai 120 karakter."; else v.agency = x; }
  if ("role" in r) { const x = text(r.role) as Role; if (!ROLES.includes(x)) errors.role = "Peran tidak valid."; else v.role = x; }
  if ("regions" in r) { const x = regionList(r.regions); if (!x) errors.regions = "Wilayah tidak valid."; else v.regions = x; }
  if ("active" in r) { if (typeof r.active !== "boolean") errors.active = "Status tidak valid."; else v.active = r.active; }
  if ("password" in r) { const e = validatePassword(r.password); if (e) errors.password = e; else v.password = r.password as string; }
  if (!Object.keys(errors).length && Object.keys(v).length === 0) errors.body = "Tidak ada perubahan yang dikirim.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: v };
}
