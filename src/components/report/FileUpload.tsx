"use client";
import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import type { PhotoItem } from "@/types/report";

const MAX_FILES = 8;
const MAX_MB = 5;

interface Props { items: PhotoItem[]; onChange: (items: PhotoItem[]) => void; label?: string; optional?: boolean }

export default function FileUpload({ items, onChange, label = "Dokumentasi", optional = true }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (list: FileList | File[]) => {
    const next = [...items];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) { problems.push(`${f.name}: bukan file gambar.`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { problems.push(`${f.name}: lebih dari ${MAX_MB} MB.`); continue; }
      if (next.length >= MAX_FILES) { problems.push(`Maksimal ${MAX_FILES} foto.`); break; }
      next.push({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, file: f, url: URL.createObjectURL(f) });
    }
    setError(problems.join(" "));
    onChange(next);
  };

  const remove = (item: PhotoItem) => {
    URL.revokeObjectURL(item.url);
    onChange(items.filter((i) => i.id !== item.id));
  };

  return (
    <div>
      <p className="mb-1.5 text-[15px] font-semibold">{label}{optional && <span className="font-normal text-ink/55"> (opsional)</span>}</p>
      <label
        htmlFor="field-photos"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-4 py-6 text-center shadow-sm ring-1 transition focus-within:ring-2 focus-within:ring-primary ${dragging ? "bg-primary/5 ring-2 ring-primary" : "bg-white ring-black/5"}`}
      >
        <UploadCloud size={34} strokeWidth={1.5} className="text-ink/70" />
        <span className="text-base text-ink/80">Unggah foto dokumentasi</span>
        <span className="text-xs text-ink/55">Seret &amp; lepas atau klik untuk memilih · maks. {MAX_FILES} foto, {MAX_MB} MB per foto</span>
        <input
          id="field-photos" type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </label>
      {error && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{error}</p>}

      {items.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
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
