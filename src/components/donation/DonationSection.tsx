"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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

  // Kartu di sisi kiri dan kanan mengecil dan memburam saat digulir ke samping; kartu di tengah tampil tajam
  useEffect(() => {
    const el = scroller.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      const half = box.width / 2;
      el.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
        const r = card.getBoundingClientRect();
        const d = Math.min(Math.abs(r.left + r.width / 2 - mid) / half, 1.2);
        const t = Math.min(1, Math.max(0, (d - 0.25) / 0.75)); // 25% bagian tengah tidak terpengaruh
        card.style.transform = `scale(${1 - 0.16 * t})`;
        card.style.filter = t > 0.02 ? `blur(${(t * t * 4.5).toFixed(2)}px)` : "none";
        card.style.opacity = String(1 - 0.45 * t);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [list.length]);

  // Kartu di tepi kiri dan kanan mengecil dan memburam saat digeser ke samping (efek fokus ke tengah)
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const center = box.left + box.width / 2;
      const half = box.width / 2;
      el.querySelectorAll<HTMLElement>("[data-card-fx]").forEach((card) => {
        const r = card.getBoundingClientRect();
        const d = Math.min(Math.abs(r.left + r.width / 2 - center) / half, 1);
        const t = Math.max(0, (d - 0.4) / 0.6);
        card.style.transform = `scale(${1 - 0.16 * t})`;
        card.style.filter = t > 0.02 ? `blur(${(3.5 * t).toFixed(2)}px)` : "none";
        card.style.opacity = String(1 - 0.45 * t);
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { if (raf) cancelAnimationFrame(raf); el.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [list.length]);

  // Geser satu kartu setiap klik panah
  const scrollBy = (dir: number) => {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    el?.scrollBy({ left: dir * ((first?.offsetWidth ?? 336) + 20), behavior: "smooth" });
  };
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

        <div ref={scroller} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[calc(50%-9.5rem)] py-4 sm:px-[calc(50%-10.5rem)]" tabIndex={0} aria-label="Daftar laporan yang membutuhkan donasi">
          {list.map((r, i) => (
            <Reveal key={r.id} delay={(i % 4) * 0.08} className="flex-none snap-center">
              <div data-card className="transition-[transform,filter,opacity] duration-150 ease-out will-change-transform">
                <div data-card-fx className="origin-center transition-[transform,filter,opacity] duration-200 ease-out">
                <DonationCard report={r} need={needFor(r)} onDonate={(photo) => setTarget({ report: r, photo })} />
              </div>
              </div>
            </Reveal>
          ))}
          {list.length === 0 && <p className="text-sm text-ink/60">Belum ada laporan yang membutuhkan donasi.</p>}
        </div>
      </div>

      {target && <DonateModal report={target.report} photo={target.photo} onClose={() => setTarget(null)} />}
    </section>
  );
}
