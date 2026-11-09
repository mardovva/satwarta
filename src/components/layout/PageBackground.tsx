"use client";
import { useEffect, useState } from "react";
import { BACKGROUND_SWITCH_MS, introPlayed, markIntroPlayed, trackSeenDepth } from "@/lib/intro";

// Gambar hero berada di bagian atas halaman dan ikut tergulir. Di bagian bawahnya gambar memudar ke warna solid
// (#EDF2EC, sama dengan warna body). Dengan `morph`, setelah animasi peta selesai latar perlahan berganti ke
// hero-2.jpg (hutan setelah karhutla). Letakkan kedua gambar di /public/images/background/.
const FADE = "linear-gradient(to bottom, rgba(237,242,236,0) 18%, rgba(237,242,236,0.88) 52%, #EDF2EC 72%)";
const SHADE = "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0) 30%)";
const layer = (src: string) => `${FADE}, ${SHADE}, url('${src}')`;
const base = "hero-bg pointer-events-none absolute inset-x-0 top-0 bg-cover bg-[center_top] bg-no-repeat";

/** `burnt`: langsung memakai hero-2 (sama dengan keadaan akhir Beranda), mis. untuk halaman AI Chat. */
export default function PageBackground({ children, morph = false, burnt: staticBurnt = false }: { children: React.ReactNode; morph?: boolean; burnt?: boolean }) {
  // Bila Beranda pernah tampil di sesi ini, langsung hero-2 tanpa transisi
  const [burnt, setBurnt] = useState(() => morph && introPlayed());

  useEffect(() => {
    if (!morph) return;
    markIntroPlayed();
    trackSeenDepth();
    if (burnt) return;
    const t = window.setTimeout(() => setBurnt(true), BACKGROUND_SWITCH_MS);
    return () => window.clearTimeout(t);
  }, [morph, burnt]);

  // overflow-clip (bukan hidden) agar wrapper tidak menjadi scroll container yang ikut tergulir saat anchor.
  return (
    <div className="relative overflow-clip">
      <div aria-hidden className={base} style={{ backgroundImage: layer(staticBurnt ? "/images/background/hero-2.jpg" : "/images/background/hero.jpg") }} />
      {morph && (
        <div
          aria-hidden
          className={`${base} transition-opacity duration-[2500ms] ease-in-out motion-reduce:transition-none`}
          style={{ backgroundImage: layer("/images/background/hero-2.jpg"), opacity: burnt ? 1 : 0 }}
        />
      )}
      {children}
    </div>
  );
}
