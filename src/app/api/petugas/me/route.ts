import { NextResponse } from "next/server";
import { authenticateOfficer } from "@/lib/server/officerAuth";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

/** Profil petugas untuk token yang dikirim. 401 = belum masuk, 403 = akun bukan petugas. */
export async function GET(req: Request) {
  const auth = await authenticateOfficer(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: NO_STORE });
  return NextResponse.json({ officer: auth.officer }, { headers: NO_STORE });
}

