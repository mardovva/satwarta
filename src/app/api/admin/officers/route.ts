import { NextResponse } from "next/server";
import { allowShared } from "@/lib/server/rateLimit";
import { authenticateAdmin } from "@/lib/server/officerAuth";
import { parseCreate } from "@/lib/server/officerInput";
import { AdminError, createOfficer, listOfficers, logAudit } from "@/lib/server/adminOfficers";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });

/** Daftar akun petugas (khusus admin). */
export async function GET(req: Request) {
  const auth = await authenticateAdmin(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  try { return json({ officers: await listOfficers() }); }
  catch (e) { console.error("[admin list]", e instanceof Error ? e.message : e); return json({ error: "Daftar petugas belum dapat dimuat." }, 502); }
}

/** Tambah akun petugas (khusus admin): membuat akun login dan mendaftarkannya sebagai petugas. */
export async function POST(req: Request) {
  const auth = await authenticateAdmin(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  if (!(await allowShared(`admin:${auth.officer.id}`, 60, 10 * 60_000))) return json({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." }, 429);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Permintaan tidak valid." }, 400); }
  const parsed = parseCreate(body);
  if (!parsed.ok) return json({ error: "Data belum lengkap atau tidak valid.", errors: parsed.errors }, 422);

  try {
    const created = await createOfficer(parsed.value);
    await logAudit(auth.officer, "create", created.id, created.email ?? created.fullName, { role: created.role, regions: created.regions, agency: created.agency });
    return json({ officer: created }, 201);
  } catch (e) {
    if (e instanceof AdminError) return json({ error: e.message }, e.status);
    console.error("[admin create]", e instanceof Error ? e.message : e);
    return json({ error: "Akun belum dapat dibuat. Silakan coba lagi." }, 500);
  }
}
