import Reveal from "@/components/ui/Reveal";

export default function HeroSection() {
  return (
    <div className="px-4 text-center">
      <Reveal><h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">Setiap Temuan Setiap Kehidupan</h1></Reveal>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-3 max-w-2xl sm:mt-4 text-sm text-ink sm:text-base">Laporkan satwa yang terdampak dan pantau proses penyelamatannya.</p>
      </Reveal>
    </div>
  );
}
