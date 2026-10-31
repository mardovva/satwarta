"use client";
import { useEffect, useRef, useState } from "react";

/** Mengembalikan ref dan flag `inView` yang menjadi true sekali saat elemen pertama kali terlihat. */
export function useInView<T extends Element>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
