"use client";
import { useState } from "react";
import { dummyNews, newsCategories, type NewsArticle, type NewsCategory } from "@/data/dummyNews";
import NewsCard from "./NewsCard";
import ArticleDialog from "./ArticleDialog";

export default function NewsSection() {
  const [filter, setFilter] = useState<NewsCategory | "Semua">("Semua");
  const [open, setOpen] = useState<NewsArticle | null>(null);
  const items = filter === "Semua" ? dummyNews : dummyNews.filter((n) => n.category === filter);

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-primary/50"}`;

  return (
    <section id="berita" className="bg-white px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Berita &amp; Data</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink/70 sm:text-base">Informasi seputar karhutla, edukasi satwa liar, dan konservasi. Konten di bawah ini masih contoh.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
          {(["Semua", ...newsCategories] as const).map((c) => (
            <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} className={chip(filter === c)}>{c}</button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => <NewsCard key={a.id} article={a} onRead={() => setOpen(a)} />)}
        </div>
        {items.length === 0 && <p className="mt-8 text-center text-sm text-ink/60">Belum ada artikel pada kategori ini.</p>}
      </div>
      {open && <ArticleDialog article={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
