"use client";
import { dummyStats } from "@/data/dummyReports";
import { useInView } from "@/hooks/useInView";
import { useTypedNumber } from "@/hooks/useTypedNumber";

interface StatProps { value: number; label: string; color: string; active: boolean }

function Stat({ value, label, color, active }: StatProps) {
  const { text, done } = useTypedNumber(value, active);
  return (
    <div className="flex items-center" role="group" aria-label={`${value} ${label}`}>
      <span className="relative inline-block text-4xl font-bold sm:text-5xl" style={{ color }} aria-hidden>
        <span className="invisible">{value}</span>
        <span className="absolute left-0 top-0">{text}</span>
      </span>
      <span aria-hidden className={`mx-1.5 h-9 w-[2px] sm:h-11 ${done ? "" : "animate-blink"}`} style={{ backgroundColor: color }} />
      <span aria-hidden className="text-base text-ink sm:text-xl">{label}</span>
    </div>
  );
}

// Data dummy, bukan data aktual.
const stats = [
  { value: dummyStats.dead, label: "satwa mati terbakar", color: "#F04B50" },
  { value: dummyStats.affected, label: "satwa terdampak", color: "#EBAA78" },
  { value: dummyStats.rescued, label: "satwa terselamatkan", color: "#345542" },
];

export default function StatisticsSection() {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section ref={ref} className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:mt-10 md:flex-nowrap md:gap-x-14">
      {stats.map((s) => <Stat key={s.label} {...s} active={inView} />)}
    </section>
  );
}
