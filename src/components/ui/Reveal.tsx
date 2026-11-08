"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Jeda (detik) sebelum animasi mulai, untuk efek bertahap */
  delay?: number;
  variant?: "up" | "left" | "right" | "zoom";
  className?: string;
}

/**
 * Muncul dengan gerakan naik yang memantul lembut saat masuk layar. Mengulang setiap kali elemen
 * kembali masuk dari bawah (scroll turun). Gaya ada di globals.css. Dimatikan bila reduce-motion aktif.
 */
export default function Reveal({ children, delay = 0, variant = "up", className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
        else if (e.boundingClientRect.top > 0) setInView(false); // keluar lewat bawah: siap animasi lagi
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-in={inView} data-variant={variant} className={`reveal ${className}`} style={{ "--d": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
