"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { provinceGroups } from "@/data/regions";

interface Props { initial: string[]; onSave: (regions: string[]) => void; onClose: () => void }

export default function RegionPicker({ initial, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (p: string) => {
    setError("");
    setSelected((s) => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n; });
  };
  const setGroup = (provinces: string[], on: boolean) => {
    setError("");
    setSelected((s) => { const n = new Set(s); provinces.forEach((p) => (on ? n.add(p) : n.delete(p))); return n; });
  };
  const save = () => {
    if (selected.size === 0) { setError("Pilih minimal satu provinsi."); return; }
    onSave(provinceGroups.flatMap((g) => g.provinces).filter((p) => selected.has(p)));
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="region-title" className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-black/5 p-6 pb-4">
          <div>
            <h2 id="region-title" className="text-xl font-bold text-primary">Wilayah kerja</h2>
            <p className="mt-1 text-sm text-ink/65">Anda hanya menerima laporan dari provinsi yang dipilih.</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          {provinceGroups.map((g) => {
            const all = g.provinces.every((p) => selected.has(p));
            return (
              <fieldset key={g.label}>
                <legend className="flex w-full items-center justify-between text-sm font-bold">
                  {g.label}
                  <button type="button" onClick={() => setGroup(g.provinces, !all)} className="text-xs font-semibold text-primary hover:underline">
                    {all ? "Kosongkan" : "Pilih semua"}
                  </button>
                </legend>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {g.provinces.map((p) => (
                    <label key={p} className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 transition ${selected.has(p) ? "bg-primary/10 ring-primary/40" : "bg-cream ring-black/5 hover:ring-primary/30"}`}>
                      <input type="checkbox" checked={selected.has(p)} onChange={() => toggle(p)} className="h-4 w-4 accent-[#345542]" />
                      {p}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 p-6 pt-4">
          <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold text-primary ring-1 ring-primary/40 hover:bg-primary/5">Batal</button>
            <button type="button" onClick={save} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Simpan ({selected.size})</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
