"use client";
import { dummyStats } from "@/data/dummyReports";
import { useInView } from "@/hooks/useInView";
import { useTypedNumber } from "@/hooks/useTypedNumber";

interface StatProps { value: number; label: string; color: string; active: boolean; delay: number }

function Stat({ value, label, color, active, delay }: StatProps) {
  const { text } = useTypedNumber(value, active, delay);
  return (
    <div className="flex shrink-0 items-center" role="group" aria-label={`${value} ${label}`}>
      <span className="relative inline-block pr-2 text-4xl font-bold sm:text-5xl" style={{ color }} aria-hidden>
        <span className="invisible">{value}</span>
        <span className="absolute left-0 top-0 flex h-full items-center whitespace-nowrap">
          {text}
          <span className="ml-[3px] inline-block h-[0.85em] w-[3px] motion-safe:animate-blink" style={{ backgroundColor: color }} />
        </span>
      </span>
      <span aria-hidden className="whitespace-nowrap text-base text-ink sm:text-xl">{label}</span>
    </div>
  );
}

// Data dummy, bukan data aktual.
const stats = [
  { value: dummyStats.dead, label: "satwa mati terbakar", color: "#F04B50" },
  { value: dummyStats.inCare, label: "satwa dalam penanganan", color: "#EBAA78" },
  { value: dummyStats.rescued, label: "satwa terselamatkan", color: "#345542" },
];

export default function StatisticsSection() {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section ref={ref} className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:mt-10 lg:flex-nowrap lg:gap-x-8 xl:gap-x-12">
      {stats.map((s, i) => <Stat key={s.label} {...s} active={inView} delay={i * 350} />)}
    </section>
  );
}
