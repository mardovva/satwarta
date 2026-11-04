"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import OfficerLoginForm from "@/components/officer/OfficerLoginForm";

interface LoginModalProps { open: boolean; onClose: () => void }

/** Form login petugas. Berhasil masuk: arahkan ke dasbor petugas. */
export default function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="login-title" className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <h2 id="login-title" className="text-2xl font-bold text-primary">Masuk sebagai petugas</h2>
        <p className="mb-5 mt-1 text-sm text-ink/65">Gunakan akun petugas Anda.</p>
        <OfficerLoginForm onSuccess={() => { onClose(); router.push("/petugas"); }} />
      </div>
    </div>
  );
}
