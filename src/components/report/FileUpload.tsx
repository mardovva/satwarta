"use client";
import { useState, type ReactNode } from "react";
import { UploadCloud, X } from "lucide-react";
import type { PhotoItem } from "@/types/report";

const MAX_FILES = 8;
const MAX_MB = 5;

interface Props { items: PhotoItem[]; onChange: (items: PhotoItem[]) => void; label?: string; optional?: boolean; required?: boolean; error?: string; /** Keterangan di sebelah kanan label (mis. status analisis AI) */ labelExtra?: ReactNode }

export default function FileUpload({ items, onChange, label = "Dokumentasi", optional = true, required = false, error, labelExtra }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileProblem, setFileProblem] = useState("");

  const addFiles = (list: FileList | File[]) => {
    const next = [...items];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) { problems.push(`${f.name}: bukan file gambar.`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { problems.push(`${f.name}: lebih dari ${MAX_MB} MB.`); continue; }
      if (next.length >= MAX_FILES) { problems.push(`Maksimal ${MAX_FILES} foto.`); break; }
      next.push({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, file: f, url: URL.createObjectURL(f) });
    }
    setFileProblem(problems.join(" "));
    onChange(next);
  };

  const remove = (item: PhotoItem) => {
    URL.revokeObjectURL(item.url);
    onChange(items.filter((i) => i.id !== item.id));
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
        <p className="text-[0.9375rem] font-semibold">{label}{required && <span aria-hidden className="ml-0.5 text-accent">*</span>}{optional && !required && <span className="font-normal text-ink/55"> (opsional)</span>}</p>
        {labelExtra}
      </div>
      <label
        htmlFor="field-photos"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center shadow-sm ring-1 transition focus-within:ring-2 focus-within:ring-primary ${dragging ? "bg-primary/5 ring-2 ring-primary" : error ? "bg-white ring-2 ring-red-400" : "bg-white ring-black/5"}`}
      >
        <UploadCloud size={34} strokeWidth={1.5} className="text-ink/70" />
        <span className="text-base text-ink/80">Unggah foto dokumentasi</span>
        <input
          id="field-photos" type="file" accept="image/*" multiple className="sr-only" aria-invalid={error ? true : undefined} aria-describedby={error ? "field-photos-error" : undefined}
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </label>
      {(error || fileProblem) && <p id="field-photos-error" className="mt-1 text-xs font-medium text-red-600" role="alert">{fileProblem || error}</p>}

      {items.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={`Pratinjau ${item.file.name}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => remove(item)} aria-label={`Hapus foto ${item.file.name}`} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

