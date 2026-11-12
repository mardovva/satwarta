"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const easeOutQuint = (p: number) => 1 - Math.pow(1 - p, 5); // sangat melambat menjelang akhir

/**
 * Angka naik dari 0 sampai `value`, lalu berhenti. Dengan prefers-reduced-motion atau `instant`, angka akhir langsung tampil.
 *
 * Bila `value` berubah saat hitungan masih berjalan (mis. data laporan dari database baru tiba), hitungan TIDAK diulang dari
 * awal: ia dibelokkan ke target baru dari angka yang sedang tampil, dengan sisa waktu yang sama. Mengulang animasi di tengah
 * jalan membuat angka terlihat tersentak/patah-patah.
 */
export function useCountUp(value: number, active: boolean, duration = 1600, delay = 0, instant = false) {
  const [display, setDisplay] = useState(instant ? value : 0);
  const shown = useRef(instant ? value : 0); // angka yang sedang tampil (bisa pecahan)
  const anim = useRef<{ from: number; to: number; t0: number; ms: number } | null>(null);
  const raf = useRef(0);
  const timer = useRef(0);
  const started = useRef(instant);

  const step = useCallback((now: number) => {
    const a = anim.current;
    if (!a) { raf.current = 0; return; }
    const p = Math.min(1, (now - a.t0) / a.ms);
    shown.current = p < 1 ? a.from + (a.to - a.from) * easeOutQuint(p) : a.to;
    setDisplay(Math.round(shown.current)); // React melewati render ulang bila angka bulatnya sama
    if (p < 1) raf.current = window.requestAnimationFrame(step);
    else { anim.current = null; raf.current = 0; }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.cancelAnimationFrame(raf.current); raf.current = 0; anim.current = null;
      started.current = true; shown.current = value; setDisplay(value);
      return;
    }
    const go = () => {
      const now = performance.now();
      const from = shown.current;
      const a = anim.current;
      if (!a && from === value) return;
      const first = !started.current;
      started.current = true;
      // Sedang berjalan: lanjutkan dengan sisa waktu (minimal 0,6 dtk). Selesai: perubahan berikutnya 0,7 dtk.
      const ms = a ? Math.max(600, a.t0 + a.ms - now) : first ? duration : 700;
      anim.current = { from, to: value, t0: now, ms };
      if (!raf.current) raf.current = window.requestAnimationFrame(step);
    };
    if (!started.current && delay > 0) timer.current = window.setTimeout(go, delay); // jeda hanya untuk hitungan pertama
    else go();
    return () => window.clearTimeout(timer.current); // hanya jeda yang dibatalkan; animasi yang berjalan dibiarkan
  }, [value, active, duration, delay, step]);

  useEffect(() => () => { window.cancelAnimationFrame(raf.current); raf.current = 0; }, []);

  return display;
}
