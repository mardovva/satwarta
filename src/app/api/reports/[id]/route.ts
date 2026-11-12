import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { getPublicReport } from "@/lib/server/reportsDb";

export const dynamic = "force-dynamic";

/** Satu laporan menurut ID (untuk Lacak Laporan). Tanpa kontak pelapor; koordinat dibulatkan. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = supabaseConfigured();
  const id = (await params).id.toUpperCase();
  if (!c.url || !c.secretKey || !/^SWT-\d{4}-\d{4}$/.test(id)) return NextResponse.json({ report: null }, { status: 404 });
  try {
    const report = await getPublicReport(id);
    return report ? NextResponse.json({ report }) : NextResponse.json({ report: null }, { status: 404 });
  } catch (e) {
    console.error("[reports GET id]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Laporan belum dapat dimuat." }, { status: 502 });
  }
}

