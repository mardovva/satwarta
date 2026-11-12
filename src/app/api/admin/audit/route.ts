import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/server/officerAuth";
import { listAudit } from "@/lib/server/adminOfficers";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

/** Log kegiatan pengelolaan petugas (khusus admin). */
export async function GET(req: Request) {
  const auth = await authenticateAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: NO_STORE });
  try { return NextResponse.json({ entries: await listAudit(30) }, { headers: NO_STORE }); }
  catch (e) { console.error("[audit]", e instanceof Error ? e.message : e); return NextResponse.json({ error: "Log belum dapat dimuat." }, { status: 502, headers: NO_STORE }); }
}

