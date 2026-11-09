import { NextResponse } from "next/server";
import { GeminiError, geminiConfigured, geminiGenerateDetailed, geminiModels } from "@/lib/gemini";

export const dynamic = "force-dynamic";

// Batas sederhana agar uji langsung tidak menghabiskan kuota (di-reset saat instance dimulai ulang)
const hits: number[] = [];

/**
 * Cek apakah AI aktif.
 *   /api/ai-status          -> hanya memeriksa apakah GEMINI_API_KEY terbaca (tanpa memanggil Gemini)
 *   /api/ai-status?test=1   -> sekali memanggil Gemini dan melaporkan hasilnya (maks 3 kali per menit)
 * Tidak pernah menampilkan kunci. Hapus folder src/app/api/ai-status bila tidak diperlukan lagi.
 */
export async function GET(req: Request) {
  const configured = geminiConfigured();
  const out: Record<string, unknown> = { configured, models: geminiModels() };
  if (!configured) { out.hint = "GEMINI_API_KEY tidak terbaca. Periksa Environment Variables di Vercel (centang Production) lalu Redeploy."; return NextResponse.json(out); }

  if (new URL(req.url).searchParams.get("test") === "1") {
    const now = Date.now();
    while (hits.length && now - hits[0] > 60_000) hits.shift();
    if (hits.length >= 3) { out.test = { ok: false, error: "Terlalu sering. Coba lagi sebentar lagi." }; return NextResponse.json(out); }
    hits.push(now);
    try {
      const r = await geminiGenerateDetailed({ contents: [{ role: "user", parts: [{ text: "Balas hanya dengan kata: ok" }] }], maxOutputTokens: 200, temperature: 0, timeoutMs: 15_000 });
      out.test = { ok: true, model: r.model, failedBefore: r.attempts, reply: r.text.slice(0, 40) };
    } catch (e) {
      out.test = { ok: false, error: e instanceof Error ? e.message : "gagal", failedBefore: e instanceof GeminiError ? e.attempts : [] };
    }
  }
  return NextResponse.json(out);
}
