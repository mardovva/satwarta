// Pemanggil Gemini API (Google AI Studio) dari server. Kunci dibaca dari GEMINI_API_KEY dan tidak pernah dikirim ke browser.
// Memakai endpoint generateContent (v1beta). Nama model bisa diganti lewat GEMINI_MODEL
// (daftar model yang masih gratis ada di https://ai.google.dev/gemini-api/docs/pricing).

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export const geminiConfigured = () => !!process.env.GEMINI_API_KEY;

export interface GeminiPart { text?: string; inlineData?: { mimeType: string; data: string } }
export interface GeminiContent { role: "user" | "model"; parts: GeminiPart[] }

interface GeminiOptions {
  system?: string;
  contents: GeminiContent[];
  /** Minta keluaran JSON murni */
  json?: boolean;
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export async function geminiGenerate({ system, contents, json = false, maxOutputTokens = 1500, temperature = 0.3, timeoutMs = 25_000 }: GeminiOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY belum diatur");
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  const res = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents,
      generationConfig: { maxOutputTokens, temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`); // sengaja tanpa isi respons agar tidak membocorkan data

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter((p) => typeof p.text === "string" && !p.thought).map((p) => p.text).join("\n").trim();
  if (!text) throw new Error("Gemini mengembalikan jawaban kosong (mungkin diblokir filter keamanan)");
  return text;
}
