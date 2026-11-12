"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { provinces } from "@/data/locations";

export const PROVINCE_NAMES = Object.keys(provinces);

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`relative my-6 w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-3xl bg-white p-6 shadow-soft`}>
        <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1.5 text-ink/60 transition hover:bg-cream hover:text-ink"><X size={20} /></button>
        <h2 className="pr-8 text-xl font-bold text-primary">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // tanpa karakter yang mudah tertukar

/** Kata sandi acak 4x4 (mis. Xk7p-Rm4q-Tz9w-Bn3c): selalu memuat huruf dan angka. */
export function randomPassword(): string {
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const raw = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
    if (/[A-Za-z]/.test(raw) && /[0-9]/.test(raw)) return raw.match(/.{4}/g)!.join("-");
  }
}

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); window.setTimeout(() => setDone(false), 1600); } catch { /* izin clipboard ditolak */ } }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30 transition hover:bg-primary/10"
    >
      {done ? <Check size={14} /> : <Copy size={14} />}{done ? "Tersalin" : label}
    </button>
  );
}

/** Pilih beberapa provinsi: kolom cari + daftar centang. */
export function RegionSelect({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => PROVINCE_NAMES.filter((p) => p.toLowerCase().includes(q.trim().toLowerCase())), [q]);
  const toggle = (p: string) => onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  return (
    <div>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari provinsi…" aria-label="Cari provinsi" className="mb-2 w-full rounded-full bg-cream px-4 py-2 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
      <div className={`max-h-44 overflow-y-auto rounded-2xl p-2 ring-1 ${error ? "ring-red-400" : "ring-black/10"}`}>
        {list.length === 0 && <p className="p-2 text-sm text-ink/55">Tidak ada provinsi yang cocok.</p>}
        {list.map((p) => (
          <label key={p} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-sm hover:bg-cream">
            <input type="checkbox" checked={value.includes(p)} onChange={() => toggle(p)} className="h-4 w-4 accent-[#345542]" />{p}
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink/60">{value.length > 0 ? `${value.length} wilayah dipilih: ${value.join(", ")}` : "Belum ada wilayah dipilih."}</p>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

