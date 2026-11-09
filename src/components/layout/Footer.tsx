import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const columns = [
  { title: "Menu", links: [{ label: "Beranda", href: "/#beranda" }, { label: "Lapor", href: "/#lapor" }, { label: "Lacak", href: "/#track" }, { label: "FAQ", href: "/#faq" }] },
  { title: "Bantuan", links: [{ label: "Tanya Satwarta AI", href: "/chat" }, { label: "Donasi", href: "/donasi" }, { label: "Lembaga", href: "/lembaga" }] },
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
    <div
      className="overflow-clip"
      // Pudar panjang di atas ajakan (dari warna halaman ke hijau keabuan), lalu warna solid sampai ke bawah, seperti footer Cluely
      style={{ background: "linear-gradient(to bottom, #EDF2EC 0rem, #E1EAE3 9rem, #D3DFD6 15rem, #CFDBD2 22rem)" }}
    >
      {/* ajakan */}
      <section id="ajakan" className="relative px-4 pb-16 pt-48 sm:pt-56">
        <div className="mx-auto grid max-w-6xl items-center md:grid-cols-[3fr_2fr]">
          <div className="py-6">
            <Reveal edge>
              <h2 className="text-2xl font-bold leading-snug tracking-tight lg:text-[1.75rem]">
                <span className="block md:whitespace-nowrap">Laporan cepat, pertolongan lebih dini.</span>
                <span className="block text-primary/45 md:whitespace-nowrap">Selamatkan satwa sekarang.</span>
              </h2>
            </Reveal>
            <Reveal edge delay={0.15}>
              <Link
                href="/#lapor"
                className="mt-6 inline-flex rounded-full border border-white/40 bg-primary/80 px-6 py-2.5 text-sm font-semibold text-white shadow-nav backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-primary/95"
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
              <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto" />
            </Reveal>
            {columns.map((c, i) => (
              <Reveal key={c.title} edge delay={0.08 * (i + 1)}>
              <nav aria-label={c.title}>
                <h3 className="text-[0.8125rem] font-semibold">{c.title}</h3>
                <ul className="mt-4 space-y-2.5 text-[0.8125rem]">
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
            <p className="text-xs text-primary/60">Copyright Satwarta 2026 · <Link href="/privasi" className="underline-offset-2 hover:text-primary hover:underline">Kebijakan Privasi</Link></p>
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
