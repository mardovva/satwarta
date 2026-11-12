"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Angka naik dari 0 (atau dari nilai terakhir bila `value` berubah) sampai `value`, lalu berhenti.
 * Dengan prefers-reduced-motion atau `instant`, angka akhir langsung ditampilkan.
 */
export function useCountUp(value: number, active: boolean, duration = 1600, delay = 0, instant = false) {
  const [display, setDisplay] = useState(instant ? value : 0);
  const current = useRef(instant ? value : 0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const from = current.current;
    if (from === value) return;

    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 5); // easeOutQuint: sangat melambat menjelang akhir
      const v = Math.round(from + (value - from) * eased);
      current.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const startDelay = from === 0 ? delay : 0; // jeda hanya untuk hitungan pertama dari 0
    const timer = window.setTimeout(() => { raf = requestAnimationFrame(step); }, startDelay);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [value, active, duration, delay]);

  return display;
}

