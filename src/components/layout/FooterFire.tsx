// Efek api yang membakar sisi atas footer. Murni dekoratif (aria-hidden); animasi di globals.css.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Posisi dibuat deterministik agar sama di server dan client.
const r = rng(7);
const COUNT = 30;
const flames = Array.from({ length: COUNT }, (_, i) => ({
  left: ((i + 0.5 + (r() - 0.5) * 0.7) / COUNT) * 100,
  width: 3.2 + r() * 3,
  dur: 0.9 + r() * 1,
  delay: r() * 2,
}));
const embers = Array.from({ length: 16 }, () => ({
  left: r() * 100,
  size: 0.2 + r() * 0.25,
  dur: 2.4 + r() * 2.6,
  delay: r() * 4,
  dx: (r() - 0.5) * 4,
}));

// Bentuk satu lidah api (ujung di atas) dengan tiga lapisan: merah, oranye, kuning.
const OUTER = "M50 0 C60 40 95 60 90 110 C88 140 70 160 50 160 C30 160 12 140 10 110 C5 70 40 55 50 0 Z";

export default function FooterFire() {
  return (
    <div aria-hidden className="pointer-events-none">
      {/* nyala di dalam footer */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FF6A1A]/60 via-[#D87938]/20 to-transparent" />

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="fireOuter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF9A2E" /><stop offset="1" stopColor="#E8330C" /></linearGradient>
          <linearGradient id="fireInner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD24A" /><stop offset="1" stopColor="#FF7A1A" /></linearGradient>
          <linearGradient id="fireCore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6C2" /><stop offset="1" stopColor="#FFC53A" /></linearGradient>
        </defs>
      </svg>

      {/* lidah api di tepi atas footer */}
      <div className="absolute inset-x-0 bottom-full h-40" style={{ filter: "drop-shadow(0 0 0.6rem rgba(255,106,26,0.65))" }}>
        {flames.map((f, i) => (
          <svg
            key={i} viewBox="0 0 100 160" className="flame absolute bottom-0"
            style={{ left: `${f.left}%`, width: `${f.width}rem`, height: `${f.width * 1.6}rem`, marginLeft: `-${f.width / 2}rem`, "--dur": `${f.dur}s`, "--delay": `-${f.delay}s` } as React.CSSProperties}
          >
            <path d={OUTER} fill="url(#fireOuter)" />
            <path d={OUTER} fill="url(#fireInner)" transform="translate(19 60.8) scale(.62)" />
            <path d={OUTER} fill="url(#fireCore)" transform="translate(34 108.8) scale(.32)" />
          </svg>
        ))}
        {embers.map((e, i) => (
          <span
            key={i} className="ember absolute bottom-6 rounded-full bg-[#FFB347]"
            style={{ left: `${e.left}%`, width: `${e.size}rem`, height: `${e.size}rem`, "--dur": `${e.dur}s`, "--delay": `-${e.delay}s`, "--dx": `${e.dx}rem` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
