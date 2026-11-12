"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { deleteReport } from "@/lib/reports";

interface Props { reportId: string; onClose: () => void; onDeleted: () => void }

export default function DeleteReportDialog({ reportId, onClose, onDeleted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const confirm = async () => {
    setBusy(true);
    setError("");
    const ok = await deleteReport(reportId);
    if (ok) onDeleted();
    else { setError("Laporan tidak dapat dihapus. Coba lagi."); setBusy(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc" className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft" onClick={(e) => e.stopPropagation()}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={26} /></span>
        <h3 id="del-title" className="mt-4 text-xl font-bold">Hapus laporan {reportId}?</h3>
        <p id="del-desc" className="mt-2 text-sm leading-relaxed text-ink/70">
          Laporan, foto, dan seluruh riwayat penanganannya akan dihapus permanen dari peta, daftar donasi, dan dasbor petugas. Tindakan ini tidak dapat dibatalkan.
        </p>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-full px-6 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/40 hover:bg-primary/5 disabled:opacity-60">Batal</button>
          <button type="button" onClick={confirm} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
