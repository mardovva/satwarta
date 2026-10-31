import { NextResponse } from "next/server";
import { FIRMS_AREA, FIRMS_DAY_RANGE, FIRMS_SOURCE, parseFirmsCsv, type HotspotFeed } from "@/lib/firms";

// Dijalankan di server agar MAP_KEY tidak terbuka di browser. Hasil di-cache 30 menit.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.FIRMS_MAP_KEY;
  if (!key) return NextResponse.json({ error: "FIRMS_MAP_KEY belum diatur" }, { status: 503 });

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${FIRMS_SOURCE}/${FIRMS_AREA}/${FIRMS_DAY_RANGE}`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const text = await res.text();
    // FIRMS membalas teks biasa (bukan CSV) bila key salah atau kuota habis
    if (!res.ok || !text.startsWith("latitude")) {
      return NextResponse.json({ error: "Respons NASA FIRMS tidak valid (cek MAP_KEY dan kuota)" }, { status: 502 });
    }
    const data = parseFirmsCsv(text);
    const body: HotspotFeed = {
      data,
      meta: { source: FIRMS_SOURCE, dayRange: FIRMS_DAY_RANGE, count: data.features.length, fetchedAt: new Date().toISOString() },
    };
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Gagal menghubungi NASA FIRMS" }, { status: 502 });
  }
}
