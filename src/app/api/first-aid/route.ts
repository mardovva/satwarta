import { NextResponse } from "next/server";
import { fallbackGuidance, type ChatMessage, type ReportContext } from "@/lib/firstAid";
import { geminiConfigured } from "@/lib/gemini";
import { askFirstAid } from "@/lib/firstAidAI";
import { allowDaily, allowShared, clientIp, dailyCap } from "@/lib/server/rateLimit";

/** Batas pemanggilan Gemini per hari untuk seluruh pengunjung (ubah lewat AI_DAILY_CHAT; 0 = tanpa batas). */
const DAILY_CHAT = () => dailyCap("AI_DAILY_CHAT", 800);

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

/** Panggil Gemini bila GEMINI_API_KEY diatur (lihat src/lib/firstAidAI.ts). */
async function askModel(messages: ChatMessage[], ctx: ReportContext | null): Promise<string> {
  const r = await askFirstAid(messages, ctx);
  if (r.attempts.length) console.warn(`[first-aid] dijawab oleh ${r.model}; gagal sebelumnya: ${r.attempts.join(", ")}`);
  return r.text;
}

export async function POST(req: Request) {
  if (!(await allowShared(`chat:${clientIp(req)}`, 12, 60_000))) return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." }, { status: 429 });

  let body: { messages?: unknown; report?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 }); }

  const messages = cleanMessages(body.messages);
  if (messages.length === 0) return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
  const ctx = cleanContext(body.report);
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let reason = "no_key";
  if (geminiConfigured()) {
    if (!(await allowDaily("ai-chat-day", DAILY_CHAT()))) {
      console.warn("[first-aid] batas harian AI tercapai: memakai panduan bawaan");
      return NextResponse.json({ reply: fallbackGuidance(ctx, lastUser), source: "panduan", reason: "kuota_harian" });
    }
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
