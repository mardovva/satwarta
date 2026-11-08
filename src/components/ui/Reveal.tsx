"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Jeda (detik) sebelum animasi mulai, untuk efek bertahap */
  delay?: number;
  variant?: "up" | "left" | "right" | "zoom" | "stick";
  className?: string;
  /** Jeda (detik) hanya untuk kemunculan pertama, mis. untuk urutan animasi saat halaman dibuka */
  initialDelay?: number;
  /** Untuk elemen di dasar halaman: terpicu begitu sedikit saja terlihat (tanpa margin bawah) */
  edge?: boolean;
}

/**
 * Muncul dengan gerakan naik yang memantul lembut saat masuk layar. Mengulang setiap kali elemen
 * kembali masuk dari bawah (scroll turun). Gaya ada di globals.css. Dimatikan bila reduce-motion aktif.
 */
export default function Reveal({ children, delay = 0, variant = "up", className = "", initialDelay, edge = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [shownOnce, setShownOnce] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
        else if (e.boundingClientRect.top > 0) setInView(false); // keluar lewat bawah: siap animasi lagi
      },
      { threshold: edge ? 0 : 0.05, rootMargin: edge ? "0px" : "0px 0px -4% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [edge]);

  // Setelah muncul pertama kali, jeda awal tidak dipakai lagi (animasi berikutnya memakai `delay` biasa)
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setShownOnce(true), 100);
    return () => window.clearTimeout(t);
  }, [inView]);
  const d = !shownOnce && initialDelay !== undefined ? initialDelay : delay;

  return (
    <div ref={ref} data-in={inView} data-variant={variant} className={`reveal ${className}`} style={{ "--d": `${d}s` } as CSSProperties}>
      {children}
    </div>
  );
}
