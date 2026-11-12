// Pemanggilan Gemini untuk AI Chat (hanya di server). Dipakai oleh /api/first-aid dan /api/ai-status?test=chat.
import { FIRST_AID_SYSTEM_PROMPT, contextBlock, type ChatMessage, type ReportContext } from "@/lib/firstAid";
import { geminiGenerateDetailed } from "@/lib/gemini";
import { cleanReply } from "@/lib/cleanReply";

/** Peran "assistant" dipetakan ke "model" sesuai format Gemini. */
export async function askFirstAid(messages: ChatMessage[], ctx: ReportContext | null) {
  const r = await geminiGenerateDetailed({
    system: `${FIRST_AID_SYSTEM_PROMPT}\n\n${contextBlock(ctx)}`,
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    temperature: 0.3,
    maxOutputTokens: 1500,
  });
  return { ...r, text: cleanReply(r.text) };
}

