"use client";
import { useEffect, useState } from "react";
import { dummyStats } from "@/data/dummyReports";
import Reveal from "@/components/ui/Reveal";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { computeStats, type ReportStats } from "@/lib/stats";

interface StatProps { value: number; label: string; color: string; active: boolean; delay: number }

function Stat({ value, label, color, active, delay }: StatProps) {
  const display = useCountUp(value, active, 5500, delay);
  return (
    <Reveal delay={delay / 1000 + 0.1}><div className="flex shrink-0 items-center" role="group" aria-label={`${value} ${label}`}>
      <span className="relative inline-block text-2xl font-bold tabular-nums sm:text-3xl" style={{ color }} aria-hidden>
        <span className="invisible">{value}</span>
        <span className="absolute inset-0 text-right">{display}</span>
      </span>
      <span aria-hidden className="ml-2 whitespace-nowrap text-sm text-ink sm:text-base">{label}</span>
    </div></Reveal>
  );
}

export default function StatisticsSection() {
  const { ref, inView } = useInView<HTMLElement>();
  // Nilai awal = angka dasar (sama di server dan client), lalu ditambah laporan baru
  const [stats, setStats] = useState<ReportStats>({ ...dummyStats });

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
    <section ref={ref} className="mx-auto mt-2 flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:mt-4 lg:flex-nowrap lg:gap-x-8 xl:gap-x-12">
      <Stat value={stats.dead} label="satwa mati terbakar" color="#F04B50" active={inView} delay={0} />
      <Stat value={stats.inCare} label="satwa dalam penanganan" color="#EBAA78" active={inView} delay={300} />
      <Stat value={stats.rescued} label="satwa terselamatkan" color="#345542" active={inView} delay={600} />
    </section>
  );
}
