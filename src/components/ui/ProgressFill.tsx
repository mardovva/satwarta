"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Isi bar progres: melebar dari 0 ke `pct` saat pertama terlihat; berubah halus bila `pct` berubah. Tanpa animasi bila reduce-motion aktif.
 *
 * Bar selebar penuh yang digeser dengan transform (diproses compositor, tetap mulus saat halaman sibuk), bukan mengubah `width`
 * (memicu layout tiap frame dan patah-patah). Pembungkusnya harus `overflow-hidden` dan membulat (beri juga `isolate` agar sudut
 * membulat tetap memotong elemen yang ditransformasi di Safari).
 */
export default function ProgressFill({ pct, className = "", delay = 0 }: { pct: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    // Amati trek (pembungkus) bukan bar-nya: bar yang digeser keluar dipotong oleh overflow-hidden milik trek, sehingga tidak pernah dianggap terlihat
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el.parentElement ?? el);
    return () => io.disconnect();
  }, []);

  const shown = Math.min(100, Math.max(0, pct));
  return (
    <div
      ref={ref}
      className={`${className} w-full transition-transform duration-1000 ease-out will-change-transform motion-reduce:transition-none`}
      style={{ transform: `translate3d(${on ? shown - 100 : -100}%, 0, 0)`, transitionDelay: on ? `${delay}ms` : "0ms" }}
    />
  );
}
