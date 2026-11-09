"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import Decor from "@/components/layout/Decor";

const faqs = [
  { q: "Apa itu Satwarta?", a: "Satwarta adalah platform pelaporan masyarakat untuk satwa liar yang terdampak kebakaran hutan dan lahan (karhutla) di Indonesia. Masyarakat dapat melaporkan satwa, melihat peta, dan memantau perkembangan laporan." },
  { q: "Bagaimana cara membuat laporan?", a: "Buka bagian Lapor, isi informasi satwa (jenis, jumlah, kondisi), pilih provinsi dan kabupaten/kota, tandai lokasi di peta atau gunakan lokasi Anda, tambahkan foto bila ada, isi data pelapor, lalu tekan Kirim Laporan. Anda akan mendapat ID laporan." },
  { q: "Apakah laporan harus disertai foto?", a: "Ya, minimal satu foto dokumentasi wajib dilampirkan agar petugas dapat memverifikasi laporan dengan cepat. Ambil foto dari jarak aman dan jangan mendekati satwa yang terluka atau panik." },
  { q: "Bagaimana cara melacak laporan?", a: "Masukkan ID laporan (misalnya SWT-2026-0001) pada bagian Lacak Laporan, lalu tekan Lacak laporan. Anda akan melihat status terkini beserta riwayatnya." },
  { q: "Apa yang terjadi setelah laporan diverifikasi?", a: "Laporan yang valid berstatus Terverifikasi, lalu ditindaklanjuti petugas atau tim lapangan (Sedang Ditangani) sampai selesai (Selesai). Laporan yang tidak dapat diverifikasi berstatus Ditolak beserta alasannya." },
];

export interface FaqItem { q: string; a: string }
interface FaqProps {
  id?: string;
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
  className?: string;
  /** Awalan id tombol dan panel; harus unik bila ada lebih dari satu FAQ di halaman */
  idPrefix?: string;
  /** Dry-leaf di kiri atas judul (hanya layar md ke atas) */
  showDecor?: boolean;
}

export default function FAQSection({
  id = "faq",
  title = "Pertanyaan yang sering ditanyakan",
  subtitle = "Temukan jawaban dari pertanyaan umum seputar pelaporan, pelacakan, dan penanganan satwa.",
  items = faqs,
  className = "px-4 pb-6 pt-24",
  idPrefix = "faq",
  showDecor = true,
}: FaqProps) {
  const [open, setOpen] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Ruang yang dipesan: tinggi daftar saat semua tertutup + tinggi jawaban terpanjang, agar membesarnya kartu
  // tidak menambah tinggi halaman. Tinggi "tertutup" dihitung dari judul kartu (bukan dari tinggi daftar yang
  // sedang beranimasi), sehingga nilainya stabil dan footer tidak naik-turun saat kartu dibuka atau ditutup.
  const [reserve, setReserve] = useState<{ min: number; extra: number } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let timer = 0;
    const measure = () => {
      const heads = Array.from(list.querySelectorAll<HTMLElement>("h3"));
      const gap = parseFloat(getComputedStyle(document.documentElement).fontSize); // space-y-4 = 1rem
      const closed = heads.reduce((sum, h) => sum + h.offsetHeight, 0) + Math.max(0, heads.length - 1) * gap;
      const extra = Math.max(0, ...Array.from(list.querySelectorAll<HTMLElement>("[data-faq-inner]")).map((n) => n.scrollHeight));
      setReserve((prev) => (prev && prev.min === Math.round(closed + extra) && prev.extra === extra ? prev : { min: Math.round(closed + extra), extra }));
    };
    const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(measure, 120); };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", schedule);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", schedule); };
  }, []);

  return (
    <section id={id} className={`relative ${className}`}>
      {showDecor && <Decor src="/images/branches/dry-leaf.png" width={218} height={239} sway="left top" className="-left-3 top-3 hidden w-[7rem] md:block lg:-left-6 lg:w-[9rem]" />}
      <div
        className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14"
        style={{ "--faq-extra": `${reserve?.extra ?? 0}px` } as CSSProperties}
      >
        {/* tengah vertikal terhadap kartu-kartu (ruang cadangan di bawah daftar dikompensasi) */}
        <Reveal variant="left" className="md:mb-[var(--faq-extra)]">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-primary/80 sm:text-lg">{subtitle}</p>
          </div>
        </Reveal>

        <div style={reserve ? { minHeight: reserve.min } : undefined}>
          <div ref={listRef} className="space-y-4">
            {items.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={f.q} delay={i * 0.07}>
                  <div className={`rounded-[1.75rem] bg-white transition-shadow duration-500 ${isOpen ? "shadow-[0_12px_28px_rgba(0,0,0,0.14)]" : "shadow-[0_6px_18px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]"}`}>
                    <h3>
                      <button
                        type="button" aria-expanded={isOpen} aria-controls={`${idPrefix}-panel-${i}`} id={`${idPrefix}-btn-${i}`}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-medium text-primary sm:px-8"
                      >
                        {f.q}
                        <Plus size={22} strokeWidth={2.5} className={`flex-none transition-transform duration-500 ease-out ${isOpen ? "rotate-[135deg]" : ""}`} />
                      </button>
                    </h3>
                    <div
                      id={`${idPrefix}-panel-${i}`} role="region" aria-labelledby={`${idPrefix}-btn-${i}`} aria-hidden={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div data-faq-inner className="overflow-hidden">
                        <p className="px-6 pb-5 text-sm leading-relaxed text-ink/75 sm:px-8 sm:text-base">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
