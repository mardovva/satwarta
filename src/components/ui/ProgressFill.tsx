"use client";
import { useEffect, useRef, useState } from "react";

/** Isi bar progres: melebar dari 0 ke `pct` saat pertama terlihat; berubah halus bila `pct` berubah. Tanpa animasi bila reduce-motion aktif. */
export default function ProgressFill({ pct, className = "", delay = 0 }: { pct: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className={`${className} transition-[width] duration-1000 ease-out motion-reduce:transition-none`} style={{ width: `${on ? pct : 0}%`, transitionDelay: on ? `${delay}ms` : "0ms" }} />;
}
