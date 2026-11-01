"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { HistoryPhoto } from "@/types/report";

interface Props { photos: HistoryPhoto[]; index: number; onClose: () => void }

export default function PhotoLightbox({ photos, index, onClose }: Props) {
  const [i, setI] = useState(index);
  const prev = () => setI((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setI((v) => (v + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setI((v) => (v + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  const photo = photos[i];
  const nav = "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/30";
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Foto laporan" className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/30"><X size={20} /></button>
      <div className="relative flex max-h-full w-full max-w-3xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.caption} className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain" />
        <p className="mt-3 text-sm text-white">{photo.caption}{photos.length > 1 ? ` · ${i + 1}/${photos.length}` : ""}</p>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Foto sebelumnya" className={`${nav} left-2`}><ChevronLeft size={22} /></button>
            <button type="button" onClick={next} aria-label="Foto berikutnya" className={`${nav} right-2`}><ChevronRight size={22} /></button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
