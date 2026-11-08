"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, MessageCircle, Minimize2, Send, X } from "lucide-react";
import { AUTO_PROMPT, FIRST_AID_EVENT, fallbackGuidance, toContext, type ChatMessage, type ReportContext } from "@/lib/firstAid";
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

/** Asisten pertolongan pertama satwa: tombol melayang + panel obrolan. Dapat dibuka dari bagian lain lewat openFirstAid(id). */
export default function FirstAidChat() {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<ReportContext | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [full, setFull] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lift, setLift] = useState(0); // seberapa jauh footer masuk ke layar; tombol dan panel naik sebesar itu
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

  // Dibuka dari modal sukses / hasil tracking
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      setOpen(true);
      const found = id ? findReport(id) : null;
      if (found) startWith(found.report);
    };
    window.addEventListener(FIRST_AID_EVENT, onOpen);
    return () => window.removeEventListener(FIRST_AID_EVENT, onOpen);
  }, [startWith]);

  // Tombol melayang baru muncul setelah pengguna meninggalkan layar pertama (di sana sudah ada tombol AI Chat)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 500);
      const footer = document.getElementById("site-footer");
      setLift(footer ? Math.max(0, Math.round(window.innerHeight - footer.getBoundingClientRect().top)) : 0);
    };
    window.addEventListener("resize", onScroll);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  // Daftar laporan milik pengguna untuk dipilih sebagai konteks
  useEffect(() => {
    if (!open) return;
    setMine(getStoredReports().map((r) => withUpdates(r)).reverse().slice(0, 3));
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    <>
      {/* tombol melayang: muncul dengan pop lembut setelah scroll, dan berhenti di atas footer */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6" style={{ transform: `translateY(-${lift}px)` }}>
        <button
          type="button" onClick={() => setOpen(true)} aria-label="Buka AI Chat Satwarta" tabIndex={!open && scrolled ? 0 : -1}
          className={`inline-flex items-center gap-2 rounded-full bg-white/30 px-4 py-3 text-sm font-semibold text-primary shadow-nav ring-1 ring-white/50 backdrop-blur-xl backdrop-saturate-150 transition-[transform,opacity,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-white/50 motion-reduce:transition-none ${
            !open && scrolled ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-75 opacity-0"
          }`}
        >
          <MessageCircle size={20} /> <span className="hidden sm:inline">AI Chat Satwarta</span>
        </button>
      </div>

      {open && (
        <section
          role="dialog" aria-label="AI Chat Satwarta"
          className={`fixed z-[105] flex origin-bottom-right animate-pop-in flex-col overflow-hidden bg-white/35 text-primary shadow-soft ring-1 ring-white/50 backdrop-blur-xl backdrop-saturate-150 motion-reduce:animate-none ${
            full
              ? "inset-3 rounded-3xl sm:inset-6"
              : "bottom-4 right-4 w-[min(24rem,calc(100vw-2rem))] rounded-3xl sm:bottom-6 sm:right-6"
          }`}
          // di atas footer: panel ikut naik dan tingginya menyesuaikan sisa ruang
          style={full ? undefined : { transform: `translateY(-${lift}px)`, height: `min(34rem, calc(100vh - 2rem - ${lift}px))` }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-white/40 px-4 py-3">
            <h2 className="flex items-center gap-2 font-bold"><MessageCircle size={18} /> AI Chat Satwarta</h2>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setFull((v) => !v)} aria-label={full ? "Perkecil" : "Layar penuh"} className="rounded-full p-1.5 hover:bg-primary/10">
                {full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button type="button" onClick={() => { setOpen(false); setFull(false); }} aria-label="Tutup" className="rounded-full p-1.5 hover:bg-primary/10"><X size={18} /></button>
            </div>
          </header>

          {ctx && (
            <p className="border-b border-white/40 bg-white/30 px-4 py-2 text-xs">
              Laporan <strong>{ctx.id}</strong> · {ctx.animalName || ctx.animalType} · {ctx.condition}
            </p>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
            <div className={full ? "mx-auto w-full max-w-3xl space-y-3" : "space-y-3"}>
              {showGreeting && (
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/60 backdrop-blur-md px-3 py-2">
                  <p>Halo! Saya membantu memberi panduan pertolongan pertama untuk satwa terdampak sambil Anda menunggu petugas.</p>
                  <p className="mt-1">{mine.length > 0 ? "Pilih laporan Anda di bawah, atau ceritakan kondisi satwanya." : "Ceritakan jenis satwa dan kondisinya."}</p>
                </div>
              )}
              {showGreeting && mine.length > 0 && (
                <ul className="space-y-2">
                  {mine.map((r) => (
                    <li key={r.id}>
                      <button type="button" onClick={() => startWith(r)} className="w-full rounded-xl bg-white/60 px-3 py-2 text-left ring-1 ring-white/60 backdrop-blur-md transition hover:bg-white/80">
                        <span className="block font-semibold">{r.id}</span>
                        <span className="block text-xs opacity-70">{r.animal.name || r.animal.type} · {r.animal.condition}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {visible.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                  <div className={`max-w-[90%] space-y-1 rounded-2xl px-3 py-2 ${m.role === "user" ? "rounded-tr-sm bg-primary/90 text-white" : "rounded-tl-sm bg-white/60 backdrop-blur-md"}`}>
                    <Rich text={m.content} />
                  </div>
                </div>
              ))}
              {busy && <div className="w-fit rounded-2xl rounded-tl-sm bg-white/60 backdrop-blur-md px-3 py-2 opacity-70">Menyiapkan panduan…</div>}

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

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-white/40 p-3">
            <div className={`flex items-center gap-2 ${full ? "mx-auto max-w-3xl" : ""}`}>
              <label htmlFor="first-aid-input" className="sr-only">Pertanyaan</label>
              <input
                id="first-aid-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} autoComplete="off"
                placeholder="Tulis pertanyaan Anda…"
                className="min-w-0 flex-1 rounded-full bg-white/60 px-4 py-2 text-sm text-primary outline-none ring-1 ring-white/60 backdrop-blur-md placeholder:text-primary/50 focus:bg-white/75"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Kirim" className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
