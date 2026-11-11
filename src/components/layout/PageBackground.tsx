"use client";
import { useEffect, useState } from "react";
import { BACKGROUND_SWITCH_MS, introPlayed, markIntroPlayed } from "@/lib/intro";

const FADE = "linear-gradient(to bottom, rgba(237,242,236,0) 18%, rgba(237,242,236,0.88) 52%, #EDF2EC 72%)";
const SHADE = "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0) 30%)";
const layer = (src: string) => `${FADE}, ${SHADE}, url('${src}')`;
const base = "hero-bg pointer-events-none absolute inset-x-0 top-0 bg-cover bg-[center_top] bg-no-repeat";

export default function PageBackground({ children, morph = false, burnt: staticBurnt = false }: { children: React.ReactNode; morph?: boolean; burnt?: boolean }) {
  const [burnt, setBurnt] = useState(() => morph && introPlayed());

  useEffect(() => {
    if (!morph) return;
    markIntroPlayed();
    if (burnt) return;
    const t = window.setTimeout(() => setBurnt(true), BACKGROUND_SWITCH_MS);
    return () => window.clearTimeout(t);
  }, [morph, burnt]);

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
