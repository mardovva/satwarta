"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, ShieldCheck, X } from "lucide-react";
import { enterAsOfficer } from "@/lib/auth";
import { setRole } from "@/lib/role";

interface LoginModalProps { open: boolean; onClose: () => void }

/** Pilihan masuk: Pelapor (kiri) tetap di halaman ini, Petugas (kanan) langsung ke dasbor. Tanpa login. */
export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const asPelapor = () => { setRole("pelapor"); onClose(); };
  const asPetugas = () => { enterAsOfficer(); onClose(); router.push("/petugas"); };

  const card = "flex flex-col items-center gap-3 rounded-2xl bg-cream p-5 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-primary/40";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="login-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <h2 id="login-title" className="text-2xl font-bold text-primary">Masuk</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={asPelapor} className={card}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Megaphone size={24} /></span>
            <span className="text-lg font-bold">Pelapor</span>
          </button>
          <button type="button" onClick={asPetugas} className={card}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent"><ShieldCheck size={24} /></span>
            <span className="text-lg font-bold">Petugas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
