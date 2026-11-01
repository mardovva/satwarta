import Image from "next/image";

const nav = [
  { label: "Beranda", href: "#beranda" },
  { label: "Lapor", href: "#lapor" },
  { label: "Track Laporan", href: "#track" },
  { label: "Berita dan Data", href: "#berita" },
  { label: "Tentang", href: "#tentang" },
  { label: "FAQ", href: "#faq" },
];

export default function Footer() {
  return (
    <footer className="bg-primary px-4 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-7 w-auto" />
            </span>
            <span className="text-xl font-bold lowercase">satwarta</span>
          </div>
          <p className="mt-3 font-semibold">Jaga Satwa, Jaga Kita.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
            Platform pelaporan masyarakat untuk satwa liar yang terdampak kebakaran hutan dan lahan di Indonesia.
          </p>
        </div>
        <nav aria-label="Navigasi footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}><a href={n.href} className="text-white/85 transition hover:text-accent">{n.label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/15 pt-5 text-xs leading-relaxed text-white/65">
        <p>Citra satelit: Esri World Imagery. Peta: © OpenStreetMap contributors. Data hotspot: NASA FIRMS. © 2026 Satwarta.</p>
      </div>
    </footer>
  );
}
