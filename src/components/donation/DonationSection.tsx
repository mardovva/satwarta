"use client";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAllReports } from "@/hooks/useAllReports";
import { needFor } from "@/lib/donations";
import type { StoredReport } from "@/types/report";
import Decor from "@/components/layout/Decor";
import Reveal from "@/components/ui/Reveal";
import DonateModal from "./DonateModal";
import DonationCard from "./DonationCard";

/** Donasi: daftar laporan dalam satu baris yang dapat digeser ke samping, masing-masing dengan satu target capaian. */
export default function DonationSection() {
  const reports = useAllReports();
  const [target, setTarget] = useState<{ report: StoredReport; photo: string } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () => reports.filter((r) => r.status !== "Rejected").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports]
  );

  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  const arrow = "flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-black/5 transition hover:bg-primary hover:text-white";

  return (
    <section id="donasi" className="relative pb-16 pt-24">
      {/* ranting sejajar dengan judul "Donasi" */}
      <Decor flip src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="left-0 top-16 w-[6.875rem] sm:top-12 sm:w-[10rem] lg:top-8 lg:w-[13.125rem]" />
      <Reveal><h2 className="relative z-10 px-4 text-center text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Donasi</h2></Reveal>

      {/* Panah kiri-kanan sejajar dengan baris kartu */}
      <div className="relative z-10 mt-10">
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Geser ke kiri" className={`${arrow} absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex`}><ChevronLeft size={20} /></button>
        <button type="button" onClick={() => scrollBy(1)} aria-label="Geser ke kanan" className={`${arrow} absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex`}><ChevronRight size={20} /></button>

        <div ref={scroller} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-[max(4rem,calc((100vw-72rem)/2+1rem))]" tabIndex={0} aria-label="Daftar laporan yang membutuhkan donasi">
          {list.map((r, i) => (
            <Reveal key={r.id} delay={(i % 4) * 0.08} className="flex-none snap-start">
              <DonationCard report={r} need={needFor(r)} onDonate={(photo) => setTarget({ report: r, photo })} />
            </Reveal>
          ))}
          {list.length === 0 && <p className="text-sm text-ink/60">Belum ada laporan yang membutuhkan donasi.</p>}
        </div>
      </div>

      {target && <DonateModal report={target.report} photo={target.photo} onClose={() => setTarget(null)} />}
    </section>
  );
}
