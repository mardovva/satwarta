"use client";
import { useEffect, useState, type RefObject } from "react";

/**
 * Header tersembunyi (naik ke atas) selama halaman digulir, ke atas maupun ke bawah, dan muncul lagi
 * setelah berhenti. Klik di dalam header menahan header tetap tampil selama halaman bergulir ke tujuan.
 * Tetap terlihat di bagian paling atas halaman, bila `enabled` false, atau bila pengguna mengaktifkan
 * prefers-reduced-motion.
 */
export function useHideOnScroll(ref: RefObject<HTMLElement>, enabled = true, threshold = 80, idleMs = 200) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) { setHidden(false); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let pinnedUntil = 0;
    const onClick = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) { pinnedUntil = Date.now() + 1500; setHidden(false); }
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      if (Date.now() < pinnedUntil || window.scrollY <= threshold) { setHidden(false); return; }
      setHidden(true);
      timer = window.setTimeout(() => setHidden(false), idleMs);
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

/** True setelah halaman digulir sedikit; dipakai agar header berubah dari menempel menjadi melayang. */
export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}
