"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { NewsArticle } from "@/data/dummyNews";
import { formatDate } from "@/lib/tracking";

export default function ArticleDialog({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <article role="dialog" aria-modal="true" aria-labelledby="article-title" className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-soft sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 rounded-full p-1 hover:bg-mist"><X size={18} /></button>
        <p className="text-xs font-semibold text-accent">{article.category}</p>
        <h3 id="article-title" className="mt-1 pr-8 text-xl font-bold text-primary sm:text-2xl">{article.title}</h3>
        <time dateTime={article.date} className="mt-1 block text-xs text-ink/55">{formatDate(article.date)}</time>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <button onClick={onClose} className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Tutup</button>
      </article>
    </div>,
    document.body
  );
}
