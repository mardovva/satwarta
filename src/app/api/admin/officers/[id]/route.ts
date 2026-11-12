import { NextResponse } from "next/server";
import { allowShared } from "@/lib/server/rateLimit";
import { authenticateAdmin } from "@/lib/server/officerAuth";
import { parsePatch } from "@/lib/server/officerInput";
import { AdminError, deleteOfficer, getOfficerRow, listOfficers, logAudit, otherActiveAdmins, updateOfficer, type AuditAction } from "@/lib/server/adminOfficers";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LAST_ADMIN = "Harus tersisa minimal satu admin aktif. Jadikan akun lain admin terlebih dahulu.";

async function label(id: string, fallback: string): Promise<string> {
  try { return (await listOfficers()).find((o) => o.id === id)?.email ?? fallback; } catch { return fallback; }
}

/** Ubah akun petugas: nama, instansi, peran, wilayah, aktif/nonaktif, atau atur ulang kata sandi. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await authenticateAdmin(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  const admin = auth.officer;
  if (!UUID.test(id)) return json({ error: "Akun tidak ditemukan." }, 404);
  if (!(await allowShared(`admin:${admin.id}`, 60, 10 * 60_000))) return json({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." }, 429);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Permintaan tidak valid." }, 400); }
  const parsed = parsePatch(body);
  if (!parsed.ok) return json({ error: "Perubahan tidak valid.", errors: parsed.errors }, 422);
  const patch = parsed.value;

  try {
    const current = await getOfficerRow(id);
    if (!current) return json({ error: "Akun tidak ditemukan." }, 404);
    const self = id === admin.id;
    const losesAdmin = current.role === "admin" && current.active && ((patch.role !== undefined && patch.role !== "admin") || patch.active === false);

    if (self && (patch.active === false || (patch.role !== undefined && patch.role !== "admin"))) return json({ error: "Anda tidak dapat menonaktifkan atau menurunkan peran akun Anda sendiri." }, 422);
    if (losesAdmin && (await otherActiveAdmins(id)) < 1) return json({ error: LAST_ADMIN }, 409);

    await updateOfficer(id, patch, current);

    const target = await label(id, current.full_name);
    const actions: AuditAction[] = [];
    if (patch.password !== undefined) actions.push("reset_password");
    if (patch.active === false && current.active) actions.push("deactivate");
    if (patch.active === true && !current.active) actions.push("reactivate");
    const changed = Object.fromEntries(Object.entries({ fullName: patch.fullName, agency: patch.agency, role: patch.role, regions: patch.regions }).filter(([, v]) => v !== undefined));
    if (Object.keys(changed).length) actions.push("update");
    for (const a of actions) await logAudit(admin, a, id, target, a === "update" ? changed : {});
    return json({ ok: true });
  } catch (e) {
    if (e instanceof AdminError) return json({ error: e.message }, e.status);
    console.error("[admin patch]", e instanceof Error ? e.message : e);
    return json({ error: "Perubahan belum dapat disimpan. Silakan coba lagi." }, 500);
  }
}

/** Hapus akun petugas (akun login dan profilnya). Riwayat laporan lama tetap utuh. */
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await authenticateAdmin(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  const admin = auth.officer;
  if (!UUID.test(id)) return json({ error: "Akun tidak ditemukan." }, 404);
  if (!(await allowShared(`admin:${admin.id}`, 60, 10 * 60_000))) return json({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." }, 429);
  if (id === admin.id) return json({ error: "Anda tidak dapat menghapus akun Anda sendiri." }, 422);

  try {
    const current = await getOfficerRow(id);
    if (!current) return json({ error: "Akun tidak ditemukan." }, 404);
    if (current.role === "admin" && current.active && (await otherActiveAdmins(id)) < 1) return json({ error: LAST_ADMIN }, 409);
    const target = await label(id, current.full_name);
    await deleteOfficer(id);
    await logAudit(admin, "delete", id, target, { role: current.role, agency: current.agency });
    return json({ ok: true });
  } catch (e) {
    console.error("[admin delete]", e instanceof Error ? e.message : e);
    return json({ error: "Akun belum dapat dihapus. Silakan coba lagi." }, 500);
  }
}

