"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { REVISIT_ANIMATE, pathVisited } from "@/lib/intro";
import { useRevealStarted } from "@/components/ui/Reveal";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  value: number;
  /** Mengubah angka menjadi teks, mis. formatRupiah. Bawaan: bilangan bulat. */
  format?: (n: number) => string;
  /** Lama hitungan pertama (ms) */
  duration?: number;
  /** Jeda tambahan (ms) sebelum hitungan pertama. Bawaan 0: mulai begitu Reveal pembungkusnya mulai muncul */
  delay?: number;
}

/**
 * Angka yang menghitung naik dari 0 saat pertama terlihat. Bila `value` berubah kemudian (data baru tiba, ada donasi),
 * angka bergeser halus ke nilai baru. Langsung menampilkan nilai akhir bila reduce-motion aktif atau halaman dibuka ulang
 * di sesi ini (sama seperti Reveal). Pembaca layar hanya mendengar nilai akhir.
 */
export default function CountUp({ value, format = (n) => String(Math.round(n)), duration = 1400, delay = 0 }: Props) {
  const pathname = usePathname();
  const [skip] = useState(() => (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) || (!REVISIT_ANIMATE && pathVisited(pathname)));
  const [shown, setShown] = useState(value);
  const [visible, setVisible] = useState(false); // sudah terlihat (atau animasi dilewati)
  const revealStarted = useRevealStarted();
  const armed = visible && (skip || revealStarted);
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const raf = useRef(0);
  const timer = useRef(0);
  const started = useRef(false);

  const animateTo = useCallback((target: number, ms: number, wait: number) => {
    window.cancelAnimationFrame(raf.current);
    window.clearTimeout(timer.current);
    const from = current.current;
    const run = () => {
      if (ms <= 0 || from === target) { current.current = target; setShown(target); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        current.current = from + (target - from) * ease(p);
        setShown(current.current);
        if (p < 1) raf.current = window.requestAnimationFrame(step);
      };
      raf.current = window.requestAnimationFrame(step);
    };
    if (wait > 0) timer.current = window.setTimeout(run, wait); else run();
  }, []);

  // Mulai dari 0 (di balik elemen yang masih tersembunyi oleh Reveal), lalu tunggu sampai terlihat
  useEffect(() => {
    if (skip) { setVisible(true); return; }
    current.current = 0; setShown(0);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [skip]);

  useEffect(() => {
    if (!armed) return;
    const first = !started.current;
    started.current = true;
    animateTo(value, skip ? 0 : first ? duration : 700, skip || !first ? 0 : delay);
  }, [armed, value, skip, duration, delay, animateTo]);

  useEffect(() => () => { window.cancelAnimationFrame(raf.current); window.clearTimeout(timer.current); }, []);

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden>{format(shown)}</span>
    </>
  );
}

