import { NextResponse } from "next/server";
import { authenticateOfficer } from "@/lib/server/officerAuth";
import { listOfficerReports } from "@/lib/server/officerDb";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

/** Laporan dalam wilayah kerja petugas, lengkap (kontak pelapor + lokasi tepat). Tidak pernah di-cache. */
export async function GET(req: Request) {
  const auth = await authenticateOfficer(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: NO_STORE });
  try {
    const reports = await listOfficerReports(auth.officer);
    return NextResponse.json({ officer: auth.officer, reports }, { headers: NO_STORE });
  } catch (e) {
    console.error("[petugas reports]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Laporan belum dapat dimuat." }, { status: 502, headers: NO_STORE });
  }
}
