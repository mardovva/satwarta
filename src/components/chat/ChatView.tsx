"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { AUTO_PROMPT, fallbackGuidance, toContext, type ChatMessage, type ReportContext } from "@/lib/firstAid";
import { getStoredReports, withUpdates } from "@/lib/reports";
import { findReport } from "@/lib/tracking";
import type { StoredReport } from "@/types/report";

type UiMessage = ChatMessage & { hidden?: boolean };

const QUICK = ["Apa yang boleh saya lakukan?", "Apa yang tidak boleh dilakukan?", "Kapan petugas datang?"];

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className={line.trim() ? "" : "h-2"}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part
          )}
        </p>
      ))}
    </>
  );
}

/** Halaman AI Chat: panduan pertolongan pertama satwa. Dapat dibuka dengan ?laporan=ID untuk memakai isi laporan. */
export default function ChatView() {
  const router = useRouter();
  const [ctx, setCtx] = useState<ReportContext | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<StoredReport[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = useCallback(async (history: UiMessage[], context: ReportContext | null) => {
    setBusy(true);
    const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
    let reply: string;
    try {
      const res = await fetch("/api/first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), report: context }),
      });
      const data = await res.json();
      reply = res.ok && typeof data.reply === "string" ? data.reply : fallbackGuidance(context, lastUser);
    } catch {
      reply = fallbackGuidance(context, lastUser);
    }
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setBusy(false);
  }, []);

  const startWith = useCallback((report: StoredReport) => {
    const context = toContext(report);
    const first: UiMessage = { role: "user", content: AUTO_PROMPT, hidden: true };
    setCtx(context);
    setMessages([first]);
    ask([first], context);
  }, [ask]);

  useEffect(() => {
    setMine(getStoredReports().map((r) => withUpdates(r)).reverse().slice(0, 3));
    const id = new URLSearchParams(window.location.search).get("laporan");
    const found = id ? findReport(id) : null;
    if (found) startWith(found.report);
    else inputRef.current?.focus();
  }, [startWith]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, busy]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const history: UiMessage[] = [...messages, { role: "user", content: t }];
    setMessages(history);
    setInput("");
    ask(history, ctx);
  };

  const visible = messages.filter((m) => !m.hidden);
  const showGreeting = visible.length === 0 && !busy;

  return (
    <section
      aria-label="Tanya Satwarta AI"
      className="mx-auto flex h-[calc(100svh-8rem)] min-h-[26rem] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white/35 text-primary backdrop-blur-xl backdrop-saturate-150"
    >
      <header className="flex items-center gap-3 border-b border-white/40 px-4 py-3">
        <button
          type="button" aria-label="Kembali"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-3 py-1.5 text-sm font-semibold backdrop-blur-xl transition hover:bg-white/65"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="flex items-center gap-2 text-lg font-bold"><MessageCircle size={20} /> Tanya Satwarta AI</h1>
      </header>

      {ctx && (
        <p className="border-b border-white/40 bg-white/30 px-5 py-2 text-xs">
          Laporan <strong>{ctx.id}</strong> · {ctx.animalName || ctx.animalType} · {ctx.condition}
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 text-sm" aria-live="polite">
        <div className="space-y-3">
          {showGreeting && (
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/60 px-4 py-3 backdrop-blur-md">
              <p>Halo! Saya membantu memberi panduan pertolongan pertama untuk satwa terdampak sambil Anda menunggu petugas.</p>
              <p className="mt-1">{mine.length > 0 ? "Pilih laporan Anda di bawah, atau ceritakan kondisi satwanya." : "Ceritakan jenis satwa dan kondisinya."}</p>
            </div>
          )}
          {showGreeting && mine.length > 0 && (
            <ul className="space-y-2">
              {mine.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => startWith(r)} className="w-full rounded-xl bg-white/60 px-4 py-2 text-left ring-1 ring-white/60 backdrop-blur-md transition hover:bg-white/80">
                    <span className="block font-semibold">{r.id}</span>
                    <span className="block text-xs opacity-70">{r.animal.name || r.animal.type} · {r.animal.condition}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {visible.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div className={`max-w-[90%] space-y-1 rounded-2xl px-4 py-3 ${m.role === "user" ? "rounded-tr-sm bg-primary/90 text-white" : "rounded-tl-sm bg-white/60 backdrop-blur-md"}`}>
                <Rich text={m.content} />
              </div>
            </div>
          ))}
          {busy && <div className="w-fit rounded-2xl rounded-tl-sm bg-white/60 px-4 py-3 opacity-70 backdrop-blur-md">Menyiapkan panduan…</div>}

          {ctx && !busy && visible.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium ring-1 ring-white/60 backdrop-blur-md hover:bg-white/80">{q}</button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-white/40 p-4">
        <div className="flex items-center gap-2">
          <label htmlFor="first-aid-input" className="sr-only">Pertanyaan</label>
          <input
            id="first-aid-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} autoComplete="off"
            placeholder="Tulis pertanyaan Anda…"
            className="min-w-0 flex-1 rounded-full bg-white/60 px-5 py-2.5 text-sm text-primary outline-none ring-1 ring-white/60 backdrop-blur-md placeholder:text-primary/50 focus:bg-white/75"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Kirim" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50">
            <Send size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}
