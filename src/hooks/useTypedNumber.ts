"use client";
import { useEffect, useState } from "react";

/** Efek mengetik: digit muncul satu per satu sampai angka akhir, lalu berhenti. Ulang bila `value` berubah. */
export function useTypedNumber(value: number, active: boolean, stepMs = 140) {
  const target = String(value);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(target.length); return; }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= target.length) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, active, stepMs]);

  return { text: target.slice(0, count), done: active && count >= target.length };
}
