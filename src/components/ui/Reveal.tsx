"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { REVISIT_ANIMATE, markPathVisited, pathVisited, seenDepthY, trackSeenDepth } from "@/lib/intro";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
 * Muncul dengan gerakan naik yang memantul lembut saat pertama kali masuk layar; setelah muncul tidak beranimasi
 * lagi (scroll naik lalu turun tidak mengulang). Bila Beranda dibuka lagi di sesi ini (mis. kembali dari AI Chat),
 * bagian yang sudah pernah dilihat langsung tampil tanpa animasi. Gaya ada di globals.css. Dimatikan bila reduce-motion aktif.
 */
export default function Reveal({ children, delay = 0, variant = "up", className = "", initialDelay, edge = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const pathname = usePathname();
  // Halaman ini pernah dibuka di sesi ini? Ditetapkan saat render pertama (stabil walau efek dijalankan dua kali oleh StrictMode)
  const [revisit] = useState(() => pathVisited(pathname));
  useEffect(() => { markPathVisited(pathname); trackSeenDepth(); }, [pathname]);
  // Dibuka lagi pada bagian yang sudah pernah dilihat: tanpa jeda awal (dan tanpa transisi bila REVISIT_ANIMATE = false)
  const [skipped, setSkipped] = useState(false);
  const [shownOnce, setShownOnce] = useState(false);

  // Beranda dibuka lagi: bila elemen ini ada di bagian yang sudah pernah dilihat, langsung tampil (sebelum frame digambar)
  useIsoLayoutEffect(() => {
    if (!revisit) return;
    const el = ref.current;
    // Catatan: membaca posisi memaksa browser menghitung gaya tersembunyi lebih dulu, sehingga perubahan ke tampil akan
    // memicu transisi (beserta transition-delay). Karena itu transisi dimatikan lewat data-instant, bukan hanya jeda 0.
    if (el && el.getBoundingClientRect().top + window.scrollY < seenDepthY(pathname)) { setSkipped(true); setInView(true); }
  }, [revisit, pathname]);

  useEffect(() => {
    if (inView) return; // sudah tampil: tidak perlu mengamati lagi
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: edge ? 0 : 0.05, rootMargin: edge ? "0px" : "0px 0px -4% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [edge, inView]);

  // Setelah muncul pertama kali, jeda awal tidak dipakai lagi (animasi berikutnya memakai `delay` biasa)
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setShownOnce(true), 100);
    return () => window.clearTimeout(t);
  }, [inView]);
  const d = skipped ? 0 : !shownOnce && initialDelay !== undefined ? initialDelay : delay;

  return (
    <div ref={ref} data-in={inView} data-variant={variant} data-instant={skipped && !REVISIT_ANIMATE ? "true" : undefined} className={`reveal ${className}`} style={{ "--d": `${d}s` } as CSSProperties}>
      {children}
    </div>
  );
}
