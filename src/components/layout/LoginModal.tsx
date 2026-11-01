"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, ShieldCheck, X } from "lucide-react";
import { setRole } from "@/lib/role";

interface LoginModalProps { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (role: "pelapor" | "petugas") => {
    setRole(role);
    onClose();
    if (role === "petugas") router.push("/petugas");
  };

  const card = "flex w-full items-start gap-4 rounded-2xl bg-cream p-4 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-primary/40";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="role-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <h2 id="role-title" className="text-2xl font-bold text-primary">Masuk sebagai</h2>
        <p className="mt-1 text-sm text-ink/65">Pilih peran Anda untuk melanjutkan.</p>

        <div className="mt-5 space-y-3">
          <button type="button" onClick={() => choose("pelapor")} className={card}>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary"><Megaphone size={24} /></span>
            <span>
              <span className="block text-lg font-bold">Pelapor</span>
              <span className="block text-sm text-ink/65">Laporkan satwa terdampak dan pantau perkembangan laporan Anda.</span>
            </span>
          </button>
          <button type="button" onClick={() => choose("petugas")} className={card}>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-accent/15 text-accent"><ShieldCheck size={24} /></span>
            <span>
              <span className="block text-lg font-bold">Petugas</span>
              <span className="block text-sm text-ink/65">Terima, verifikasi, dan tindak lanjuti laporan satwa terdampak.</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
