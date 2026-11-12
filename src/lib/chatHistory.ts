// Riwayat AI Chat yang tersimpan di perangkat (localStorage), agar percakapan tidak hilang saat pindah halaman.
// Hanya berisi teks percakapan dan konteks laporan (tanpa data kontak). Tidak pernah dikirim ke server kami.
import type { ChatMessage, ReportContext } from "./firstAid";

export type StoredMessage = ChatMessage & { hidden?: boolean; note?: string };
export interface StoredChat { ctx: ReportContext | null; messages: StoredMessage[] }

export const CHAT_KEY = "satwarta:first-aid:v2";
const VERSION = 2;
const MAX_MESSAGES = 40;
const MAX_CONTENT = 4000;

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const browserStore = (): Store | null => { try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; } };

const isCtx = (v: unknown): v is ReportContext => !!v && typeof v === "object" && typeof (v as ReportContext).id === "string" && (v as ReportContext).id.length > 0;

/** Bersihkan data hasil baca: buang entri yang bukan pesan sah, potong yang terlalu panjang atau terlalu banyak. */
export function sanitize(raw: unknown): StoredChat | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { v?: unknown; ctx?: unknown; messages?: unknown };
  if (r.v !== VERSION || !Array.isArray(r.messages)) return null;
  const messages: StoredMessage[] = [];
  for (const m of r.messages) {
    if (!m || typeof m !== "object") continue;
    const { role, content, hidden, note } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) continue;
    messages.push({ role, content: content.slice(0, MAX_CONTENT), ...(hidden === true ? { hidden: true } : {}), ...(typeof note === "string" && note ? { note: note.slice(0, 300) } : {}) });
  }
  const kept = messages.slice(-MAX_MESSAGES);
  while (kept.length && kept[0].role !== "user") kept.shift(); // percakapan selalu diawali pesan pengguna
  if (kept.length === 0) return null;
  return { ctx: isCtx(r.ctx) ? r.ctx : null, messages: kept };
}

export function loadChat(store: Store | null = browserStore()): StoredChat | null {
  if (!store) return null;
  try { return sanitize(JSON.parse(store.getItem(CHAT_KEY) ?? "null")); } catch { return null; }
}

/** Simpan; percakapan kosong menghapus data. Galat penyimpanan (penuh/dimatikan) diabaikan. */
export function saveChat(chat: StoredChat, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    if (chat.messages.length === 0) { store.removeItem(CHAT_KEY); return; }
    store.setItem(CHAT_KEY, JSON.stringify({ v: VERSION, ctx: chat.ctx, messages: chat.messages.slice(-MAX_MESSAGES), savedAt: Date.now() }));
  } catch { /* abaikan */ }
}

export function clearChat(store: Store | null = browserStore()): void {
  try { store?.removeItem(CHAT_KEY); } catch { /* abaikan */ }
}

/** Pesan terakhir dari pengguna tanpa jawaban (mis. pindah halaman saat AI sedang menjawab): perlu diminta ulang. */
export const needsReply = (messages: StoredMessage[]): boolean => messages.length > 0 && messages[messages.length - 1].role === "user";

