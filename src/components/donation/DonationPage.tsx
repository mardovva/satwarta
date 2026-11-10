"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Decor from "@/components/layout/Decor";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import FAQSection, { type FaqItem } from "@/components/sections/FAQSection";
import { useAllReports } from "@/hooks/useAllReports";
import { usePledges } from "@/hooks/usePledges";
import { buildCampaign, filterCampaigns, summarize, type CampaignFilter, type CampaignSort } from "@/lib/campaigns";
import { formatRupiah } from "@/lib/donations";
import CampaignCard from "./CampaignCard";
import CampaignDetail from "./CampaignDetail";

const FILTERS: { id: CampaignFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "mendesak", label: "Mendesak" },
  { id: "hampir", label: "Hampir tercapai" },
  { id: "selesai", label: "Selesai" },
];
const SORTS: { id: CampaignSort; label: string }[] = [
  { id: "terbaru", label: "Terbaru" },
  { id: "mendesak", label: "Paling mendesak" },
  { id: "hampir", label: "Hampir tercapai" },
  { id: "donatur", label: "Donatur terbanyak" },
];
const DONASI_FAQ: FaqItem[] = [
  { q: "Bagaimana cara berdonasi?", a: "Pilih penggalangan yang ingin Anda bantu, tekan Donasi sekarang, lalu pilih atau tulis nominal, isi nama dan doa (opsional), pilih metode pembayaran, dan konfirmasi. Setelah berhasil, donasi Anda tercatat di daftar donatur." },
  { q: "Siapa yang bisa berdonasi?", a: "Siapa saja, tanpa perlu membuat laporan. Halaman ini terbuka untuk publik, tidak hanya untuk pelapor." },
  { q: "Berapa donasi minimal?", a: "Rp 10.000. Anda boleh memilih nominal yang tersedia atau menulis nominal sendiri." },
  { q: "Ke mana dana akan disalurkan?", a: "Dana digunakan untuk kebutuhan penanganan yang tertera di tab Rencana Dana pada setiap penggalangan, dan perkembangannya dilaporkan petugas di tab Kabar Terbaru." },
  { q: "Bolehkah berdonasi secara anonim?", a: "Boleh. Centang “Sembunyikan nama saya” dan nama Anda tidak akan ditampilkan di daftar donatur." },
];

/** Halaman Donasi (publik): ringkasan, pencarian, filter, urutan, semua kartu, rincian penggalangan, dan cara kerja. */
export default function DonationPage() {
  const reports = useAllReports();
  const pledges = usePledges();
  const campaigns = useMemo(() => reports.filter((r) => r.status !== "Rejected").map((r) => buildCampaign(r, pledges)), [reports, pledges]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CampaignFilter>("semua");
  const [type, setType] = useState("semua");
  const [sort, setSort] = useState<CampaignSort>("terbaru");
  const [openId, setOpenId] = useState<string | null>(null);
  // Data dimuat di efek setelah render pertama; tampilkan keadaan kosong hanya setelah itu (hindari kedipan "belum ada")
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const pendingRef = useRef<string | null>(null);

  const types = useMemo(() => Array.from(new Set(campaigns.map((c) => c.report.animal.type))), [campaigns]);
  const visible = useMemo(() => filterCampaigns(campaigns, { q, filter, type, sort }), [campaigns, q, filter, type, sort]);
  const stats = useMemo(() => summarize(campaigns), [campaigns]);
  const opened = campaigns.find((c) => c.id === openId) ?? null;
  const count = (f: CampaignFilter) => filterCampaigns(campaigns, { q: "", filter: f, type: "semua", sort: "terbaru" }).length;

  // Tautan bagikan: /donasi?kampanye=ID membuka rincian penggalangan tersebut
  useEffect(() => { pendingRef.current = new URLSearchParams(window.location.search).get("kampanye"); }, []);
  useEffect(() => {
    if (pendingRef.current && campaigns.some((c) => c.id === pendingRef.current)) { setOpenId(pendingRef.current); pendingRef.current = null; }
  }, [campaigns]);

  const setParam = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("kampanye", id); else url.searchParams.delete("kampanye");
    window.history.replaceState(null, "", url);
  };
  const open = (id: string) => { setOpenId(id); setParam(id); };
  const close = () => { setOpenId(null); setParam(null); };

  const field = "rounded-xl bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary";

  return (
    <div className="relative px-0 pb-10 pt-24 sm:pt-28">
      <Decor flip src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-left-3 top-24 hidden w-[8rem] md:block lg:-left-5 lg:w-[13.125rem]" />
      <Decor src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-right-3 top-24 hidden w-[8rem] md:block lg:-right-5 lg:w-[13.125rem]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[83.125rem] md:w-[84%]">
        {/* judul dan ringkasan */}
        <header className="text-center">
          <Reveal initialDelay={0.1}>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.12)] sm:text-5xl">Donasi untuk Satwa Terdampak</h1>
          </Reveal>
          <Reveal initialDelay={0.25}>
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)] sm:text-lg">Bantuanmu sangat berharga untuk kehidupan satwa</p>
          </Reveal>
          <dl className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Total terkumpul", value: stats.collected, format: (n: number) => formatRupiah(Math.round(n)) },
              { label: "Donatur", value: stats.donors, format: (n: number) => new Intl.NumberFormat("id-ID").format(Math.round(n)) },
              { label: "Penggalangan aktif", value: stats.active, format: (n: number) => String(Math.round(n)) },
            ].map((s, i) => (
              <Reveal key={s.label} initialDelay={0.4 + i * 0.12} className="rounded-2xl border border-white/50 bg-white/25 px-5 py-4 text-white backdrop-blur-xl backdrop-saturate-150">
                <dd className="text-2xl font-bold tabular-nums"><CountUp value={s.value} format={s.format} duration={1600} delay={Math.round((0.45 + i * 0.12) * 1000)} /></dd>
                <dt className="text-sm font-semibold text-white/90">{s.label}</dt>
              </Reveal>
            ))}
          </dl>
        </header>

        {/* pencarian, filter, urutan */}
        <Reveal initialDelay={0.85}>
        <section aria-label="Cari dan saring penggalangan" className="mt-8 space-y-3 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <label htmlFor="donasi-cari" className="sr-only">Cari satwa, lokasi, atau ID</label>
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input id="donasi-cari" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari satwa, lokasi, atau ID laporan" autoComplete="off" className={`${field} w-full pl-10 pr-10`} />
              {q && <button type="button" aria-label="Hapus pencarian" onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/50 hover:bg-mist"><X size={16} /></button>}
            </div>
            <label className="sr-only" htmlFor="donasi-jenis">Jenis satwa</label>
            <select id="donasi-jenis" value={type} onChange={(e) => setType(e.target.value)} className={field}>
              <option value="semua">Semua jenis satwa</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="sr-only" htmlFor="donasi-urut">Urutkan</label>
            <select id="donasi-urut" value={sort} onChange={(e) => setSort(e.target.value as CampaignSort)} className={field}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>Urutkan: {s.label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Status penggalangan">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition ${filter === f.id ? "bg-primary text-white ring-primary" : "bg-white text-ink ring-black/10 hover:ring-primary/50"}`}>
                {f.label} <span className={filter === f.id ? "text-white/80" : "text-ink/45"}>{count(f.id)}</span>
              </button>
            ))}
          </div>
        </section>
        </Reveal>

        {/* semua kartu */}
        <p className="mt-6 text-sm font-semibold text-ink/70" aria-live="polite">{visible.length} penggalangan ditampilkan</p>
        <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((c, i) => (
            <li key={c.id} className="flex">
              {/* baris pertama menyusul urutan pembuka halaman; selebihnya bergantian saat masuk layar */}
              <Reveal className="flex w-full" initialDelay={i < 4 ? 1.05 + i * 0.09 : undefined} delay={(i % 4) * 0.07}>
                <CampaignCard campaign={c} onOpen={() => open(c.id)} />
              </Reveal>
            </li>
          ))}
        </ul>
        {ready && visible.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white/80 px-6 py-12 text-center ring-1 ring-black/5">
            <p className="font-bold text-primary">{campaigns.length === 0 ? "Belum ada penggalangan" : "Tidak ada penggalangan yang cocok"}</p>
            <p className="mt-1 text-sm text-ink/65">{campaigns.length === 0 ? "Penggalangan muncul otomatis dari laporan satwa yang masuk." : "Coba ubah kata kunci atau filter."}</p>
            {campaigns.length > 0 && <button type="button" onClick={() => { setQ(""); setFilter("semua"); setType("semua"); }} className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Atur ulang</button>}
          </div>
        )}
      </div>

      {/* FAQ: tata letak dan animasi sama dengan FAQ di Beranda */}
      <FAQSection
        id="faq-donasi" idPrefix="faq-donasi" showDecor={false} className="relative z-10 px-4 pb-6 pt-24"
        title="Pertanyaan seputar donasi" subtitle="Temukan jawaban dari pertanyaan umum seputar berdonasi untuk satwa terdampak."
        items={DONASI_FAQ}
      />

      {opened && <CampaignDetail campaign={opened} pledges={pledges} onClose={close} />}
    </div>
  );
}
