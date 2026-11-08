"use client";
import { useMemo, useState } from "react";
import { useAllReports } from "@/hooks/useAllReports";
import { needFor } from "@/lib/donations";
import type { StoredReport } from "@/types/report";
import Decor from "@/components/layout/Decor";
import Reveal from "@/components/ui/Reveal";
import DonateModal from "./DonateModal";
import DonationCard from "./DonationCard";

/** Donasi: daftar laporan dalam grid (turun ke baris berikutnya), masing-masing dengan satu target capaian. */
export default function DonationSection() {
  const reports = useAllReports();
  const [target, setTarget] = useState<{ report: StoredReport; photo: string } | null>(null);

  const list = useMemo(
    () => reports.filter((r) => r.status !== "Rejected").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports]
  );

  return (
    <section id="donasi" className="relative pb-16 pt-24">
      {/* ranting sejajar dengan judul "Donasi" */}
      <Decor flip src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="left-0 top-16 w-[6.875rem] sm:top-12 sm:w-[10rem] lg:top-8 lg:w-[13.125rem]" />
      <Reveal><h2 className="relative z-10 px-4 text-center text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Donasi</h2></Reveal>

      {/* selebar peta dan formulir; kartu turun ke baris berikutnya */}
      <div className="relative z-10 mx-auto mt-10 grid w-[92%] max-w-[83.125rem] grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:w-[84%]">
        {list.map((r, i) => (
          <Reveal key={r.id} delay={(i % 4) * 0.08} className="w-full max-w-[21rem]">
            <DonationCard report={r} need={needFor(r)} onDonate={(photo) => setTarget({ report: r, photo })} />
          </Reveal>
        ))}
        {list.length === 0 && <p className="col-span-full text-sm text-ink/60">Belum ada laporan yang membutuhkan donasi.</p>}
      </div>

      {target && <DonateModal report={target.report} photo={target.photo} onClose={() => setTarget(null)} />}
    </section>
  );
}
