import { NextResponse } from "next/server";
import { FIRMS_AREA, FIRMS_DAY_RANGE, FIRMS_SOURCE, parseFirmsCsv, type HotspotFeed } from "@/lib/firms";

// Dijalankan di server agar MAP_KEY tidak terbuka di browser. Respons sukses di-cache CDN selama 30 menit.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Bila satelit pertama gagal, coba satelit berikutnya
const SOURCES = [FIRMS_SOURCE, "VIIRS_NOAA20_NRT"];
let lastGood: { at: number; body: HotspotFeed } | null = null;

async function fetchSource(key: string, source: string) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${source}/${FIRMS_AREA}/${FIRMS_DAY_RANGE}`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(13_000) });
  const text = await res.text();
  // FIRMS membalas teks biasa (bukan CSV) bila key salah atau kuota habis
  if (!res.ok || !text.startsWith("latitude")) throw new Error(`${source}: HTTP ${res.status} ${text.replace(key, "***").slice(0, 100)}`);
  return parseFirmsCsv(text);
}

export async function GET() {
  const key = process.env.FIRMS_MAP_KEY;
  if (!key) return NextResponse.json({ error: "FIRMS_MAP_KEY belum diatur di environment variables" }, { status: 503 });

  const errors: string[] = [];
  for (const source of SOURCES) {
    try {
      const data = await fetchSource(key, source);
      const body: HotspotFeed = { data, meta: { source, dayRange: FIRMS_DAY_RANGE, count: data.features.length, fetchedAt: new Date().toISOString() } };
      lastGood = { at: Date.now(), body };
      return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  // Semua sumber gagal: pakai data terakhir yang berhasil (maks. 6 jam) bila ada
  if (lastGood && Date.now() - lastGood.at < 6 * 3600_000) return NextResponse.json(lastGood.body, { headers: { "X-Hotspot-Stale": "1" } });
  return NextResponse.json({ error: "Gagal mengambil data NASA FIRMS", detail: errors.join(" | ") }, { status: 502 });
}
