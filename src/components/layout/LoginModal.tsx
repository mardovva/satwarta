"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface LoginModalProps { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setDone(false); return; }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls = "mt-1 w-full rounded-xl border border-gray-200 bg-cream px-4 py-2.5 outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Masuk" className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <h2 className="text-2xl font-bold text-primary">Masuk</h2>
        {done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-ink/70">Mode demo: login hanya simulasi di sisi frontend, belum ada autentikasi sungguhan.</p>
            <button onClick={onClose} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-dark">Tutup</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-4 space-y-3">
            <label className="block text-sm font-medium">Email
              <input type="email" required autoFocus placeholder="nama@email.com" className={inputCls} />
            </label>
            <label className="block text-sm font-medium">Kata sandi
              <input type="password" required placeholder="••••••••" className={inputCls} />
            </label>
            <button type="submit" className="w-full rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark">Masuk</button>
          </form>
        )}
      </div>
    </div>
  );
}
