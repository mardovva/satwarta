import Reveal from "@/components/ui/Reveal";
import { INTRO } from "@/lib/intro";

export default function HeroSection() {
  return (
    <div className="px-4 text-center">
      <Reveal initialDelay={INTRO.titleDelay}>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.12)] sm:text-4xl lg:text-5xl 2xl:text-6xl">Laporkan Satwa dan Pantau Penyelamatannya</h1>
      </Reveal>
    </div>
  );
}

