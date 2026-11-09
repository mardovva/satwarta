// Pengelolaan akun petugas oleh admin (SERVER). Membuat akun di Supabase Auth lalu mendaftarkannya di tabel officers.
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Officer } from "./officerAuth";
import type { AuditAction, AuditItem, OfficerListItem, OfficerRole } from "@/types/officer";
import type { OfficerCreate, OfficerPatch } from "./officerInput";

interface OfficerRow { id: string; full_name: string; agency: string; role: OfficerRole; regions: string[] | null; active: boolean; created_at: string }

/** Galat yang aman ditampilkan ke admin (status HTTP + pesan). */
export class AdminError extends Error { constructor(public status: number, message: string) { super(message); } }

const COLS = "id, full_name, agency, role, regions, active, created_at";

async function emailMap(): Promise<Map<string, { email: string | null; last: string | null }>> {
  const map = new Map<string, { email: string | null; last: string | null }>();
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`listUsers: ${error.message}`);
  for (const u of data.users) map.set(u.id, { email: u.email ?? null, last: u.last_sign_in_at ?? null });
  return map;
}

const toItem = (r: OfficerRow, m: Map<string, { email: string | null; last: string | null }>): OfficerListItem => ({
  id: r.id, email: m.get(r.id)?.email ?? null, fullName: r.full_name, agency: r.agency, role: r.role,
  regions: r.regions ?? [], active: r.active, createdAt: r.created_at, lastSignInAt: m.get(r.id)?.last ?? null,
});

export async function listOfficers(): Promise<OfficerListItem[]> {
  const { data, error } = await supabaseAdmin().from("officers").select(COLS).order("agency");
  if (error) throw new Error(`officers: ${error.code ?? ""} ${error.message}`);
  const m = await emailMap();
  return (data as OfficerRow[]).map((r) => toItem(r, m));
}

export async function getOfficerRow(id: string): Promise<OfficerRow | null> {
  const { data, error } = await supabaseAdmin().from("officers").select(COLS).eq("id", id).maybeSingle();
  if (error) throw new Error(`officer: ${error.message}`);
  return data as OfficerRow | null;
}

/** Jumlah admin aktif selain `exceptId` (untuk menjaga agar selalu tersisa admin). */
export async function otherActiveAdmins(exceptId: string): Promise<number> {
  const { count, error } = await supabaseAdmin().from("officers").select("id", { count: "exact", head: true }).eq("role", "admin").eq("active", true).neq("id", exceptId);
  if (error) throw new Error(`admins: ${error.message}`);
  return count ?? 0;
}

export async function createOfficer(i: OfficerCreate): Promise<OfficerListItem> {
  const db = supabaseAdmin();
  const { data, error } = await db.auth.admin.createUser({ email: i.email, password: i.password, email_confirm: true });
  if (error || !data.user) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "email_exists" || /already (been )?registered|already exists/i.test(error?.message ?? "")) throw new AdminError(409, "Email ini sudah terdaftar.");
    if (code === "email_address_invalid") throw new AdminError(422, "Supabase menolak domain email ini. Gunakan domain nyata (mis. alias Gmail nama+kode@gmail.com).");
    if (code === "weak_password") throw new AdminError(422, "Kata sandi ditolak karena terlalu lemah.");
    throw new Error(`createUser: ${error?.message ?? "kosong"}`);
  }
  const user = data.user;
  const { error: insErr } = await db.from("officers").insert({ id: user.id, full_name: i.fullName, agency: i.agency, role: i.role, regions: i.regions, active: true });
  if (insErr) { await db.auth.admin.deleteUser(user.id).catch(() => undefined); throw new Error(`officer insert: ${insErr.code ?? ""} ${insErr.message}`); }
  return { id: user.id, email: i.email, fullName: i.fullName, agency: i.agency, role: i.role, regions: i.regions, active: true, createdAt: new Date().toISOString(), lastSignInAt: null };
}

export async function updateOfficer(id: string, p: OfficerPatch, current: OfficerRow): Promise<void> {
  const db = supabaseAdmin();
  const row: Record<string, unknown> = {};
  if (p.fullName !== undefined) row.full_name = p.fullName;
  if (p.agency !== undefined) row.agency = p.agency;
  if (p.active !== undefined) row.active = p.active;
  if (p.role !== undefined) row.role = p.role;
  const finalRole = p.role ?? current.role;
  if (p.role !== undefined || p.regions !== undefined) row.regions = finalRole === "officer" ? (p.regions ?? current.regions ?? []) : [];
  if (Object.keys(row).length) {
    const { error } = await db.from("officers").update(row).eq("id", id);
    if (error) throw new Error(`officer update: ${error.code ?? ""} ${error.message}`);
  }
  if (p.password !== undefined) {
    const { error } = await db.auth.admin.updateUserById(id, { password: p.password });
    if (error) throw new Error(`password: ${error.message}`);
  }
}

export async function deleteOfficer(id: string): Promise<void> {
  const { error } = await supabaseAdmin().auth.admin.deleteUser(id); // baris officers ikut terhapus (cascade)
  if (error) throw new Error(`deleteUser: ${error.message}`);
}

// ---------- log audit ----------
export type { AuditAction, AuditItem, OfficerListItem };

export async function logAudit(actor: Officer, action: AuditAction, targetId: string | null, targetLabel: string, details: Record<string, unknown> = {}): Promise<void> {
  const { error } = await supabaseAdmin().from("officer_audit").insert({ actor_id: actor.id, actor_name: `${actor.name} (${actor.agency})`, action, target_id: targetId, target_label: targetLabel, details });
  if (error) console.error("[audit]", error.code ?? "", error.message); // pencatatan gagal tidak boleh menggagalkan aksinya
}

export async function listAudit(limit = 30): Promise<AuditItem[]> {
  const { data, error } = await supabaseAdmin().from("officer_audit").select("id, at, actor_name, action, target_label, details").order("at", { ascending: false }).order("id", { ascending: false }).limit(limit);
  if (error) throw new Error(`audit: ${error.code ?? ""} ${error.message}`);
  return (data as { id: number; at: string; actor_name: string; action: AuditAction; target_label: string; details: Record<string, unknown> }[]).map((r) => ({ id: r.id, at: r.at, actorName: r.actor_name, action: r.action, targetLabel: r.target_label, details: r.details }));
}
