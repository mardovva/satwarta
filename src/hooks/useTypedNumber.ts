"use client";
import { useEffect, useState } from "react";

const TYPE_MS = 150;   // jeda antar digit saat mengetik
const DELETE_MS = 90;  // jeda antar digit saat menghapus
const HOLD_MS = 2200;  // jeda saat angka penuh
const PAUSE_MS = 600;  // jeda saat kosong

/**
 * Efek mengetik berulang tanpa henti: ketik angka → tahan → hapus → ulang.
 * Dengan prefers-reduced-motion, angka akhir ditampilkan statis.
 */
export function useTypedNumber(value: number, active: boolean, startDelay = 0) {
  const target = String(value);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(target.length); return; }

    let i = 0;
    let dir: 1 | -1 = 1;
    let timer: number;
    setCount(0);

    const tick = () => {
      let delay: number;
      if (dir === 1) {
        i += 1;
        setCount(i);
        if (i >= target.length) { dir = -1; delay = HOLD_MS; } else delay = TYPE_MS;
      } else {
        i -= 1;
        setCount(i);
        if (i <= 0) { dir = 1; delay = PAUSE_MS; } else delay = DELETE_MS;
      }
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, startDelay + TYPE_MS);
    return () => window.clearTimeout(timer);
  }, [target, active, startDelay]);

  return { text: target.slice(0, count) };
}
