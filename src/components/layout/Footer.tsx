import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const columns = [
  { title: "Menu", links: [{ label: "Beranda", href: "/#beranda" }, { label: "Lapor", href: "/#lapor" }, { label: "Lacak", href: "/#track" }, { label: "FAQ", href: "/#faq" }] },
  { title: "Bantuan", links: [{ label: "Tanya Satwarta AI", href: "/chat" }, { label: "Donasi", href: "/donasi" }] },
  { title: "Ikuti", links: [{ label: "Instagram", href: "https://www.instagram.com/mardovva", external: true }, { label: "LinkedIn", href: "https://www.linkedin.com/in/mardova-fadhilah-11b920395", external: true }] },
];
const social = [
  { label: "Instagram", href: "https://www.instagram.com/mardovva", Icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mardova-fadhilah-11b920395", Icon: Linkedin },
];

const linkCls = "text-primary/75 transition hover:text-primary";

/**
 * Bagian ajakan (bagian dari halaman, setelah FAQ) dan footer berada di atas satu gradasi yang dimulai dari warna
 * halaman, jadi tidak ada sambungan yang kontras. id="site-footer" hanya pada footer (mulai dari garis di atas logo),
 * sehingga tombol AI Chat melayang berhenti di garis itu.
 */
export default function Footer() {
  return (
    <div className="overflow-clip bg-gradient-to-b from-[#EDF2EC] via-[#E3EBE4] to-[#D0DDD3]">
      {/* ajakan */}
      <section id="ajakan" className="relative px-4 pb-20 pt-16">
        <div className="mx-auto grid max-w-6xl items-center md:grid-cols-[3fr_2fr]">
          <div className="py-10">
            <Reveal edge>
              <h2 className="text-3xl font-bold leading-tight tracking-tight lg:text-[2rem]">
                <span className="block md:whitespace-nowrap">Laporan cepat, pertolongan lebih dini.</span>
                <span className="block text-primary/45 md:whitespace-nowrap">Selamatkan satwa sekarang.</span>
              </h2>
            </Reveal>
            <Reveal edge delay={0.15}>
              <Link
                href="/#lapor"
                className="mt-8 inline-flex rounded-full border border-white/40 bg-primary/80 px-7 py-3 font-semibold text-white shadow-nav backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-primary/95"
              >
                Buat laporan satwa terdampak
              </Link>
            </Reveal>
          </div>
        </div>
        {/* branches-with-animal menempel di tepi kanan, dicerminkan */}
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 hidden w-[24rem] -translate-y-1/2 md:block lg:w-[34rem]">
          <Image src="/images/branches/branches-with-animal.png" alt="" width={606} height={208} className="block h-auto w-full -scale-x-100 select-none" />
        </div>
      </section>

      <footer id="site-footer" className="px-4 text-primary">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 border-t border-primary/10 py-12 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <Reveal edge>
              <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-10 w-auto" />
            </Reveal>
            {columns.map((c, i) => (
              <Reveal key={c.title} edge delay={0.08 * (i + 1)}>
              <nav aria-label={c.title}>
                <h3 className="font-bold">{c.title}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {"external" in l
                        ? <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>{l.label}</a>
                        : <Link href={l.href} className={linkCls}>{l.label}</Link>}
                    </li>
                  ))}
                </ul>
              </nav>
              </Reveal>
            ))}
          </div>

          <Reveal edge delay={0.2}>
          <div className="flex items-center justify-between gap-4 border-t border-primary/10 py-6">
            <p className="text-sm text-primary/65">Copyright Satwarta 2026</p>
            <ul className="flex items-center gap-3">
              {social.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full text-primary/75 transition hover:bg-white/60 hover:text-primary">
                    <Icon size={19} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
