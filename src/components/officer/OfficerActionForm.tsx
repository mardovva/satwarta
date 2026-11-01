"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/report/FileUpload";
import { inputClass } from "@/components/report/FormField";
import { workflow } from "@/data/officerWorkflow";
import { savePhotos } from "@/lib/photoStore";
import { getHandler } from "@/lib/handler";
import type { OfficerSession } from "@/lib/auth";
import { addStatusUpdate } from "@/lib/reports";
import type { PhotoItem, StoredReport } from "@/types/report";

export default function OfficerActionForm({ report, session }: { report: StoredReport; session: OfficerSession }) {
  const actions = workflow[report.status];
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const photosRef = useRef<PhotoItem[]>([]);
  photosRef.current = photos;

  // Ganti laporan atau status berubah: reset pilihan tindakan dan isian
  useEffect(() => {
    setIndex(0);
    setNote("");
    setError("");
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
  }, [report.id, report.status]);

  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);
  useEffect(() => { setMessage(""); }, [report.id]);

  if (actions.length === 0) {
    return (
      <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-ink/70">
        Laporan ini berstatus {report.status} dan sudah final. Tidak ada tindakan lanjutan.
      </p>
    );
  }

  const handler = getHandler(report);
  if (handler && handler.username !== session.username) {
    return (
      <p className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-black/5">
        Laporan ini ditangani oleh <strong>{handler.name}</strong> ({handler.agency}). Hanya petugas penanggung jawab yang dapat memperbarui statusnya.
      </p>
    );
  }

  const action = actions[Math.min(index, actions.length - 1)];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (note.trim().length < 3) { setError("Catatan wajib diisi."); return; }
    if (action.requirePhoto && photos.length === 0) { setError("Unggah minimal satu foto bukti penanganan."); return; }

    setBusy(true);
    setError("");
    const at = new Date().toISOString();
    const files = photos.map((p) => p.file);
    if (files.length > 0 && !(await savePhotos(`${report.id}:o:${at}`, files))) {
      setError("Foto tidak dapat disimpan di browser ini. Coba lagi.");
      setBusy(false);
      return;
    }
    const ok = addStatusUpdate(report.id, { status: action.to, at, note: note.trim(), officer: { username: session.username, name: session.name, agency: session.agency }, ...(files.length > 0 ? { storedPhotos: files.length } : {}) });
    if (!ok) { setError("Pembaruan tidak dapat disimpan. Coba lagi."); setBusy(false); return; }

    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setNote("");
    setBusy(false);
    setMessage(`${report.id} diperbarui: ${action.to}.`);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {actions.length > 1 && (
        <div role="radiogroup" aria-label="Pilih tindakan" className="flex flex-wrap gap-2">
          {actions.map((a, i) => (
            <button
              key={a.label} type="button" role="radio" aria-checked={i === index} onClick={() => { setIndex(i); setError(""); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                i === index ? (a.tone === "danger" ? "bg-red-600 text-white" : "bg-primary text-white") : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/50"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-ink/70">{action.description}</p>

      <div>
        <label htmlFor="officer-note" className="mb-1.5 block text-[15px] font-semibold">Catatan <span className="font-normal text-ink/55">(tampil di riwayat laporan)</span></label>
        <textarea
          id="officer-note" rows={3} maxLength={500} value={note} onChange={(e) => { setNote(e.target.value); setError(""); }}
          placeholder="Contoh: Tim lapangan tiba di lokasi dan mulai evakuasi."
          className={`${inputClass(!!error && note.trim().length < 3)} resize-y`}
        />
      </div>

      <FileUpload items={photos} onChange={(i) => { setPhotos(i); setError(""); }} label={action.requirePhoto ? "Foto bukti penanganan" : "Foto update"} optional={!action.requirePhoto} />

      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      {message && !error && <p role="status" className="text-sm font-medium text-primary">{message}</p>}

      <button
        type="submit" disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full px-7 py-2.5 font-semibold text-white shadow-md transition disabled:opacity-70 ${action.tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"}`}
      >
        {busy && <Loader2 size={18} className="animate-spin" />}
        {busy ? "Menyimpan…" : action.label}
      </button>
    </form>
  );
}
