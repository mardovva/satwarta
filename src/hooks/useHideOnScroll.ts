"use client";
import { useEffect, useState, type RefObject } from "react";

/**
 * Header naik ke atas (tersembunyi) hanya saat halaman digulir ke bawah, dan muncul lagi saat
 * digulir ke atas atau setelah berhenti. Klik di dalam header menahan header tetap tampil selama
 * halaman bergulir menuju tujuan. Tetap terlihat di bagian paling atas halaman, bila `enabled`
 * false, atau bila pengguna mengaktifkan prefers-reduced-motion.
 */
export function useHideOnScroll(ref: RefObject<HTMLElement>, enabled = true, threshold = 80, idleMs = 180) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) { setHidden(false); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let timer = 0;
    let pinnedUntil = 0;

    const onClick = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) { pinnedUntil = Date.now() + 1500; setHidden(false); }
    };
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      window.clearTimeout(timer);
      if (Date.now() < pinnedUntil || y <= threshold || delta < 0) { setHidden(false); return; }
      if (delta > 2) {
        setHidden(true);
        timer = window.setTimeout(() => setHidden(false), idleMs);
      }
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [ref, enabled, threshold, idleMs]);

  return hidden;
}
