import { ArrowRight, BarChart3, Flame, Leaf, MapPinned, PawPrint } from "lucide-react";
import type { NewsArticle, NewsCategory } from "@/data/dummyNews";
import { formatDate } from "@/lib/tracking";

const thumb: Record<NewsCategory, { gradient: string; Icon: typeof Flame }> = {
  "Berita Karhutla": { gradient: "linear-gradient(135deg,#D87938,#7A3B12)", Icon: Flame },
  "Edukasi Satwa": { gradient: "linear-gradient(135deg,#6B8F71,#345542)", Icon: PawPrint },
  Konservasi: { gradient: "linear-gradient(135deg,#8DB08F,#3F6B4F)", Icon: Leaf },
  "Data Hotspot": { gradient: "linear-gradient(135deg,#E0884A,#A33A1B)", Icon: MapPinned },
  Statistik: { gradient: "linear-gradient(135deg,#4F7A62,#2A4535)", Icon: BarChart3 },
};

export default function NewsCard({ article, onRead }: { article: NewsArticle; onRead: () => void }) {
  const { gradient, Icon } = thumb[article.category];
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-36 items-center justify-center" style={article.image ? undefined : { background: gradient }}>
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon size={54} strokeWidth={1.4} className="text-white/80" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-3 py-0.5 font-semibold text-primary">{article.category}</span>
          <time dateTime={article.date} className="text-ink/55">{formatDate(article.date)}</time>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug">{article.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink/70">{article.summary}</p>
        <button type="button" onClick={onRead} className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary hover:text-accent">
          Baca selengkapnya <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
