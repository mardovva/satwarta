"use client";
import { useEffect, useState } from "react";
import { dummyStats } from "@/data/dummyReports";
import { useInView } from "@/hooks/useInView";
import { useTypedNumber } from "@/hooks/useTypedNumber";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { computeStats, type ReportStats } from "@/lib/stats";

interface StatProps { value: number; label: string; color: string; active: boolean; delay: number }

function Stat({ value, label, color, active, delay }: StatProps) {
  const { text } = useTypedNumber(value, active, delay);
  return (
    <div className="flex shrink-0 items-center" role="group" aria-label={`${value} ${label}`}>
      <span className="relative inline-block pr-2 text-2xl font-bold sm:text-3xl" style={{ color }} aria-hidden>
        <span className="invisible">{value}</span>
        <span className="absolute left-0 top-0 flex h-full items-center whitespace-nowrap">
          {text}
          <span className="ml-[3px] inline-block h-[0.85em] w-[3px] motion-safe:animate-blink" style={{ backgroundColor: color }} />
        </span>
      </span>
      <span aria-hidden className="whitespace-nowrap text-sm text-ink sm:text-base">{label}</span>
    </div>
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
    <section ref={ref} className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:mt-10 lg:flex-nowrap lg:gap-x-8 xl:gap-x-12">
      <Stat value={stats.dead} label="satwa mati terbakar" color="#F04B50" active={inView} delay={0} />
      <Stat value={stats.inCare} label="satwa dalam penanganan" color="#EBAA78" active={inView} delay={350} />
      <Stat value={stats.rescued} label="satwa terselamatkan" color="#345542" active={inView} delay={700} />
    </section>
  );
}
