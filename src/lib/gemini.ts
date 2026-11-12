// Pemanggil Gemini API (Google AI Studio) dari server. Kunci dibaca dari GEMINI_API_KEY dan tidak pernah dikirim ke browser.
// Memakai endpoint generateContent (v1beta). Model pertama = GEMINI_MODEL (bila diisi), lalu daftar cadangan di bawah.
// Bila sebuah model tidak ditemukan (404), kuotanya habis (429), atau sedang padat (503), model berikutnya dicoba;
// kuota gratis dihitung per model. Daftar model gratis terbaru: https://ai.google.dev/gemini-api/docs/pricing

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

/**
 * Tingkat berpikir per model, agar jawaban cepat. Menurut dokumentasi Google: gemini-3.8-flash berpikir "medium" secara bawaan
 * dan hanya mendukung low/medium/high; gemini-3.6-flash dan model Flash-Lite mendukung "minimal". Model lain: tidak diatur.
 * Bila sebuah model menolak pengaturan ini (400), permintaan diulang tanpa pengaturan tersebut.
 */
function thinkingLevelFor(model: string): "minimal" | "low" | undefined {
  if (/flash-lite/.test(model)) return "minimal";
  if (model.startsWith("gemini-3.8-flash")) return "low";
  if (model.startsWith("gemini-3.6-flash")) return "minimal";
  return undefined;
}

export const geminiConfigured = () => !!process.env.GEMINI_API_KEY;
export const geminiModels = () => Array.from(new Set([process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL, ...FALLBACK_MODELS]));

/** Galat dengan kode singkat yang aman ditampilkan (tidak memuat kunci maupun isi respons). */
export class GeminiError extends Error {
  /** Model yang gagal sebelum galat ini, mis. ["gemini-3.8-flash: 404"] */
  attempts: string[] = [];
  constructor(message: string, public status = 0) { super(message); }
}

export interface GeminiPart { text?: string; inlineData?: { mimeType: string; data: string } }
export interface GeminiContent { role: "user" | "model"; parts: GeminiPart[] }

interface GeminiOptions {
  system?: string;
  contents: GeminiContent[];
  /** Minta keluaran JSON murni */
  json?: boolean;
  maxOutputTokens?: number;
  temperature?: number;
  /** Batas waktu total semua percobaan (ms). Harus di bawah maxDuration fungsi server. */
  timeoutMs?: number;
  /** Batas waktu per model (ms); bila terlampaui, model berikutnya dicoba. */
  attemptMs?: number;
}

export async function geminiGenerateDetailed({ system, contents, json = false, maxOutputTokens = 1500, temperature = 0.3, timeoutMs = 24_000, attemptMs = 12_000 }: GeminiOptions): Promise<{ text: string; model: string; attempts: string[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("GEMINI_API_KEY belum terbaca");

  const bodyFor = (thinking: "minimal" | "low" | undefined) => JSON.stringify({
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents,
    generationConfig: {
      maxOutputTokens, temperature,
      ...(json ? { responseMimeType: "application/json" } : {}),
      ...(thinking ? { thinkingConfig: { thinkingLevel: thinking } } : {}),
    },
  });

  const deadline = Date.now() + timeoutMs;
  const attempts: string[] = [];
  let lastError: GeminiError | null = null;

  for (const model of geminiModels()) {
    const remaining = deadline - Date.now();
    if (remaining < 2000) { attempts.push(`${model}: dilewati (waktu habis)`); break; }

    const call = (thinking: "minimal" | "low" | undefined) => fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: bodyFor(thinking),
      signal: AbortSignal.timeout(Math.min(attemptMs, remaining)),
    });

    const level = thinkingLevelFor(model);
    let res: Response;
    try {
      res = await call(level);
      if (res.status === 400 && level) res = await call(undefined); // model menolak pengaturan berpikir: ulangi tanpa itu
    } catch {
      attempts.push(`${model}: timeout`);
      lastError = new GeminiError("Gemini tidak terjangkau atau terlalu lama (timeout)");
      continue; // coba model berikutnya
    }

    if (res.ok) {
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const text = parts.filter((p) => typeof p.text === "string" && !p.thought).map((p) => p.text).join("\n").trim();
      if (!text) throw new GeminiError("Gemini mengembalikan jawaban kosong (mungkin diblokir filter keamanan)");
      return { text, model, attempts };
    }
    attempts.push(`${model}: ${res.status}`);
    lastError = new GeminiError(`Gemini ${res.status} (${model})`, res.status); // sengaja tanpa isi respons
    if (![404, 429, 503].includes(res.status)) break; // 400/401/403: masalah kunci atau permintaan, model lain tidak membantu
  }
  const err = lastError ?? new GeminiError("Gemini gagal");
  err.attempts = attempts;
  throw err;
}

export async function geminiGenerate(opts: GeminiOptions): Promise<string> {
  return (await geminiGenerateDetailed(opts)).text;
}

