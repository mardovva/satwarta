"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRound, UserRoundCheck, X } from "lucide-react";
import { setRole } from "@/lib/role";

interface LoginModalProps { open: boolean; onClose: () => void }

/** Pilihan masuk: Pelapor (kiri) tetap di halaman ini tanpa login; Petugas (kanan) menuju halaman login petugas. */
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
  const asPetugas = () => { onClose(); router.push("/petugas"); };

  const card = "flex flex-col items-center gap-3 rounded-2xl bg-cream p-5 text-center ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-primary/40";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Pilih peran: Pelapor atau Petugas" className="relative w-full max-w-md rounded-3xl bg-white p-6 pt-14 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={asPelapor} className={card}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound size={32} strokeWidth={1.75} /></span>
            <span className="text-lg font-bold">Pelapor</span>
          </button>
          <button type="button" onClick={asPetugas} className={card}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRoundCheck size={32} strokeWidth={1.75} /></span>
            <span className="text-lg font-bold">Petugas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
