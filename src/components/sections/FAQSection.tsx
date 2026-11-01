"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Apa itu Satwarta?", a: "Satwarta adalah platform pelaporan masyarakat untuk satwa liar yang terdampak kebakaran hutan dan lahan (karhutla) di Indonesia. Masyarakat dapat melaporkan satwa, melihat peta, dan memantau perkembangan laporan." },
  { q: "Bagaimana cara membuat laporan?", a: "Buka bagian Lapor, isi informasi satwa (jenis, jumlah, kondisi), pilih provinsi dan kabupaten/kota, tandai lokasi di peta atau gunakan lokasi Anda, tambahkan foto bila ada, isi data pelapor, lalu tekan Kirim Laporan. Anda akan mendapat ID laporan." },
  { q: "Apakah laporan harus disertai foto?", a: "Tidak wajib. Namun foto membantu petugas memverifikasi laporan dengan lebih cepat. Ambil foto dari jarak aman dan jangan mendekati satwa yang terluka atau panik." },
  { q: "Bagaimana cara melacak laporan?", a: "Masukkan ID laporan (misalnya SWT-2026-0001) pada bagian Track Laporan, lalu tekan Cari Laporan. Anda akan melihat status terkini beserta riwayatnya." },
  { q: "Apa yang terjadi setelah laporan diverifikasi?", a: "Laporan yang valid berstatus Verified, lalu ditindaklanjuti petugas atau tim lapangan (In Progress) sampai selesai (Resolved). Laporan yang tidak dapat diverifikasi berstatus Rejected beserta alasannya." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">FAQ</h2>
        <p className="mt-3 text-center text-sm text-ink/70 sm:text-base">Pertanyaan yang sering diajukan.</p>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-2xl bg-cream ring-1 ring-black/5">
                <h3>
                  <button
                    type="button" aria-expanded={isOpen} aria-controls={`faq-panel-${i}`} id={`faq-btn-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                  >
                    {f.q}
                    <ChevronDown size={20} className={`flex-none text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                {isOpen && (
                  <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} className="px-5 pb-5 text-sm leading-relaxed text-ink/75">{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
