"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, ShieldCheck, X } from "lucide-react";
import { getSession } from "@/lib/auth";
import { setRole } from "@/lib/role";
import OfficerLoginForm from "@/components/officer/OfficerLoginForm";

interface LoginModalProps { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "petugas">("role");

  useEffect(() => {
    if (!open) { setStep("role"); return; }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const choosePelapor = () => { setRole("pelapor"); onClose(); };
  const choosePetugas = () => {
    // Sesi masih berlaku: langsung ke dasbor tanpa login ulang
    if (getSession()) { onClose(); router.push("/petugas"); return; }
    setStep("petugas");
  };

  const card = "flex w-full items-start gap-4 rounded-2xl bg-cream p-4 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-primary/40";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="role-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>

        {step === "role" ? (
          <>
            <h2 id="role-title" className="text-2xl font-bold text-primary">Masuk sebagai</h2>
            <p className="mt-1 text-sm text-ink/65">Pilih peran Anda untuk melanjutkan.</p>
            <div className="mt-5 space-y-3">
              <button type="button" onClick={choosePelapor} className={card}>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary"><Megaphone size={24} /></span>
                <span>
                  <span className="block text-lg font-bold">Pelapor</span>
                  <span className="block text-sm text-ink/65">Laporkan satwa terdampak dan pantau perkembangan laporan Anda.</span>
                </span>
              </button>
              <button type="button" onClick={choosePetugas} className={card}>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-accent/15 text-accent"><ShieldCheck size={24} /></span>
                <span>
                  <span className="block text-lg font-bold">Petugas</span>
                  <span className="block text-sm text-ink/65">Terima, verifikasi, dan tindak lanjuti laporan satwa terdampak.</span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setStep("role")} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <ArrowLeft size={16} /> Kembali
            </button>
            <h2 id="role-title" className="text-2xl font-bold text-primary">Masuk Petugas</h2>
            <p className="mb-5 mt-1 text-sm text-ink/65">Gunakan akun petugas Anda.</p>
            <OfficerLoginForm onSuccess={() => { onClose(); router.push("/petugas"); }} />
          </>
        )}
      </div>
    </div>
  );
}
