import { NextResponse } from "next/server";
import { FIRST_AID_SYSTEM_PROMPT, contextBlock, fallbackGuidance, type ChatMessage, type ReportContext } from "@/lib/firstAid";
import { geminiConfigured, geminiGenerate } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Pembatas sederhana per IP (di-reset saat instance serverless dimulai ulang)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 12;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const msgs = raw
    .map((m) => ({ role: (m?.role === "assistant" ? "assistant" : "user") as ChatMessage["role"], content: str(m?.content, 600).trim() }))
    .filter((m) => m.content)
    .slice(-8);
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  return msgs;
}

function cleanContext(raw: unknown): ReportContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id, 30);
  if (!id) return null;
  return {
    id, animalType: str(r.animalType, 30), animalName: str(r.animalName, 80), count: Math.max(0, Math.min(9999, Number(r.count) || 0)),
    condition: str(r.condition, 120), province: str(r.province, 60), city: str(r.city, 80), status: str(r.status, 30),
  };
}

/** Panggil Gemini bila GEMINI_API_KEY diatur (lihat src/lib/gemini.ts). Peran "assistant" dipetakan ke "model". */
function askModel(messages: ChatMessage[], ctx: ReportContext | null): Promise<string> {
  return geminiGenerate({
    system: `${FIRST_AID_SYSTEM_PROMPT}\n\n${contextBlock(ctx)}`,
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    temperature: 0.3,
    maxOutputTokens: 1500,
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." }, { status: 429 });

  let body: { messages?: unknown; report?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 }); }

  const messages = cleanMessages(body.messages);
  if (messages.length === 0) return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  const ctx = cleanContext(body.report);
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let reason = "no_key";
  if (geminiConfigured()) {
    try {
      return NextResponse.json({ reply: await askModel(messages, ctx), source: "ai" });
    } catch (e) {
      // kuota habis, kunci salah, atau gangguan: jatuh ke panduan bawaan. Penyebab dicatat di log server (Vercel > Logs).
      reason = e instanceof Error ? e.message : "error";
      console.error("[first-aid] Gemini gagal:", reason);
    }
  }
  return NextResponse.json({ reply: fallbackGuidance(ctx, lastUser), source: "panduan", reason });
}
