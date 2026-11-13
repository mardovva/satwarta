"use client";
import { useEffect, useState } from "react";
import { dummyStats } from "@/data/dummyReports";
import Reveal, { useRevealStarted } from "@/components/ui/Reveal";
import { INTRO, introPlayed } from "@/lib/intro";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { computeStats, type ReportStats } from "@/lib/stats";

interface StatProps { value: number; label: string; color?: string; active: boolean; index: number }

/** Angka mulai menghitung tepat saat Reveal pembungkusnya mulai muncul, jadi tidak lama tertahan di 0 */
function StatNumber({ value, active }: { value: number; active: boolean }) {
  const [instant] = useState(() => introPlayed());
  const started = useRevealStarted();
  const display = useCountUp(value, active && started, INTRO.countDurationMs, 0, instant);
  return <span className="absolute inset-0 text-right">{display}</span>;
}

function Stat({ value, label, active, index }: StatProps) {
  return (
    <Reveal initialDelay={INTRO.titleDelay} delay={index * 0.1}>
      <div className="flex shrink-0 items-center text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.12)]" role="group" aria-label={`${value} ${label}`}>
        <span className="relative inline-block text-2xl font-bold tabular-nums sm:text-3xl" aria-hidden>
          <span className="invisible">{value}</span>
          <StatNumber value={value} active={active} />
        </span>
        <span aria-hidden className="ml-3 whitespace-nowrap text-base font-semibold text-white">{label}</span>
      </div>
    </Reveal>
  );
}

export default function StatisticsSection() {
  const { ref, inView } = useInView<HTMLElement>();
  // Nilai awal = angka dasar (sama di server dan client), lalu ditambah laporan baru. Bila Beranda dibuka lagi di sesi ini
  // (mis. kembali dari AI Chat atau Donasi), langsung mulai dari angka sebenarnya: kalau tidak, angka tampil sebagai angka dasar dulu
  // lalu "naik" ke angka sebenarnya, dan itu terlihat seperti animasi hitung yang diulang. (Ini hanya terjadi pada navigasi di
  // dalam aplikasi, tidak pada pemuatan halaman pertama, jadi tidak memicu hydration mismatch.)
  const [stats, setStats] = useState<ReportStats>(() => (introPlayed() ? computeStats() : { ...dummyStats }));

  useEffect(() => {
    const load = () => setStats(computeStats());
    load();
    window.addEventListener(REPORTS_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <section ref={ref} className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:mt-8 lg:flex-nowrap lg:gap-x-8 xl:gap-x-12">
      <Stat value={stats.dead} label="satwa mati terbakar" active={inView} index={0} />
      <Stat value={stats.inCare} label="satwa dalam penanganan" active={inView} index={1} />
      <Stat value={stats.rescued} label="satwa terselamatkan" active={inView} index={2} />
    </section>
  );
}

