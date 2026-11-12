// Autentikasi petugas di SERVER. Browser mengirim access token Supabase (Authorization: Bearer ...); token DIPERIKSA ke
// Supabase Auth, lalu akunnya dicocokkan dengan tabel officers. Hanya akun yang terdaftar di tabel itu yang dianggap petugas:
// pendaftaran akun biasa di Supabase Auth (kalau ada) tidak memberi akses apa pun.
import { supabaseAdmin } from "@/lib/supabase/admin";

export type OfficerRole = "officer" | "national" | "admin";
export interface Officer { id: string; name: string; agency: string; role: OfficerRole; regions: string[] }
export type AuthResult = { officer: Officer } | { status: 401 | 403 | 503; error: string };

export function bearerToken(req: Request): string | null {
  const m = /^Bearer\s+([A-Za-z0-9._~+/=-]+)$/.exec(req.headers.get("authorization") ?? "");
  return m ? m[1] : null;
}

export async function authenticateOfficer(req: Request): Promise<AuthResult> {
  const token = bearerToken(req);
  if (!token) return { status: 401, error: "Silakan masuk terlebih dahulu." };

  let userId: string;
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data.user) return { status: 401, error: "Sesi tidak valid atau sudah berakhir. Silakan masuk lagi." };
    userId = data.user.id;
  } catch { return { status: 503, error: "Layanan login belum dapat dihubungi." }; }

  const { data: row, error } = await supabaseAdmin().from("officers").select("id, full_name, agency, role, regions, active").eq("id", userId).maybeSingle();
  if (error) return { status: 503, error: "Data petugas belum dapat dimuat." };
  if (!row) return { status: 403, error: "Akun ini bukan akun petugas." };
  if (!row.active) return { status: 403, error: "Akun ini dinonaktifkan. Hubungi admin." };
  return { officer: { id: row.id, name: row.full_name, agency: row.agency, role: row.role, regions: row.regions ?? [] } };
}

/** Seperti authenticateOfficer, tetapi hanya menerima admin. */
export async function authenticateAdmin(req: Request): Promise<AuthResult> {
  const auth = await authenticateOfficer(req);
  if ("error" in auth) return auth;
  if (auth.officer.role !== "admin") return { status: 403, error: "Halaman ini khusus admin." };
  return auth;
}

