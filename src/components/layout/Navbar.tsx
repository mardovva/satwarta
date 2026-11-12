"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useScrolled } from "@/hooks/useHideOnScroll";
import { pickActive, spyLine } from "@/lib/scrollSpy";
import LoginModal from "./LoginModal";

const links = [
  { label: "Beranda", id: "beranda" },
  { label: "Lapor", id: "lapor" },
  { label: "Lacak", id: "track" },
  { label: "FAQ", id: "faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [active, setActive] = useState("beranda");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolled = useScrolled();
  const floating = scrolled || menuOpen;

  // Bagian yang dipilih lewat klik menu "dikunci" sebagai yang aktif sampai pengguna menggulir sendiri. Tanpa ini, bagian pendek
  // (mis. Lacak saat belum ada hasil) membuat bagian di bawahnya (FAQ) ikut masuk garis penentu dan menu salah menyorot.
  const lockRef = useRef<string | null>(null);
  const pick = (id: string) => { lockRef.current = id; setActive(id); };

  useEffect(() => {
    if (!isHome) return;
    const ids = links.map((l) => l.id);
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (lockRef.current) return;
      // Bagian aktif = yang batas atasnya terakhir melewati garis penentu dekat bagian atas layar (bukan garis di tengah layar)
      const tops = ids.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? null);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(pickActive(ids, tops, spyLine(window.innerHeight), atBottom));
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(compute); };
    const unlock = () => { lockRef.current = null; }; // pengguna mengambil alih: roda mouse, sentuhan, atau tombol keyboard

    const hash = window.location.hash.slice(1);
    if (ids.includes(hash)) { lockRef.current = hash; setActive(hash); } // dibuka lewat tautan /#bagian
    else compute();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [isHome]);

  const linkCls = (id: string) =>
    isHome && id === active ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const chatCls = pathname === "/chat" ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const donasiCls = pathname.startsWith("/donasi") ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const lembagaCls = pathname.startsWith("/lembaga") ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const hashHref = (id: string) => `${isHome ? "" : "/"}#${id}`;
  // Di Beranda: tautan anchor biasa. Dari halaman lain: Link (navigasi di dalam aplikasi), sehingga Beranda tidak dimuat ulang
  // dan tidak mengulang animasi untuk bagian yang sudah pernah dilihat.
  const Anchor = (isHome ? "a" : Link) as typeof Link;

  const openLogin = () => { setMenuOpen(false); setLoginOpen(true); };

  return (
    <>
      <div className={`site-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding,color] duration-500 ease-out ${floating ? "px-3 pt-3 text-ink sm:px-6 sm:pt-4" : "px-0 pt-0 text-white"}`}>
      <header
        className={`pointer-events-auto mx-auto border transition-all duration-500 ease-out ${
          floating
            ? `max-w-[75rem] border-white/40 shadow-nav backdrop-blur-xl backdrop-saturate-150 ${menuOpen ? "rounded-3xl bg-white/95" : "rounded-full bg-white/25"}`
            : "max-w-[120rem] rounded-none border-transparent bg-transparent shadow-none"
        }`}
      >
        <nav className="relative mx-auto flex h-14 items-center px-5 sm:h-16 sm:px-7" aria-label="Navigasi utama">
          <Anchor href={isHome ? "#beranda" : "/"} className="flex items-center gap-2 sm:gap-3">
            {/* Dua logo bertumpuk yang saling memudar, selaras dengan perubahan warna teks header (putih di atas, gelap saat melayang) */}
            <span className="relative block">
              <Image src="/images/logo-dark.svg" alt="Logo Satwarta" width={714} height={160} loading="eager" unoptimized className={`h-7 w-auto transition-opacity duration-500 ease-out motion-reduce:transition-none sm:h-8 ${floating ? "opacity-100" : "opacity-0"}`} />
              <Image src="/images/logo-white.svg" alt="" aria-hidden width={714} height={160} priority unoptimized className={`absolute left-0 top-0 h-7 w-auto transition-opacity duration-500 ease-out motion-reduce:transition-none sm:h-8 ${floating ? "opacity-0" : "opacity-100"}`} />
            </span>
          </Anchor>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 whitespace-nowrap text-base lg:flex xl:gap-9 xl:text-lg">
            {links.map((l) => (
              <li key={l.id}>
                <Anchor href={hashHref(l.id)} onClick={() => pick(l.id)} aria-current={isHome && l.id === active ? "page" : undefined} className={linkCls(l.id)}>{l.label}</Anchor>
              </li>
            ))}
            <li><Link href="/chat" aria-current={pathname === "/chat" ? "page" : undefined} className={chatCls}>AI Chat</Link></li>
            <li><Link href="/donasi" aria-current={pathname.startsWith("/donasi") ? "page" : undefined} className={donasiCls}>Donasi</Link></li>
            <li><Link href="/lembaga" aria-current={pathname.startsWith("/lembaga") ? "page" : undefined} className={lembagaCls}>Lembaga</Link></li>
          </ul>

          <button onClick={openLogin} className="ml-auto hidden rounded-full border border-white/50 bg-white/25 px-6 py-2 font-semibold text-current backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/45 lg:block">
            Masuk
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} className="ml-auto rounded-full p-2 hover:bg-mist lg:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-black/5 px-2 pb-4 pt-3 lg:hidden">
            <ul className="space-y-1 text-lg">
              {links.map((l) => (
                <li key={l.id}>
                  <Anchor href={hashHref(l.id)} onClick={() => { pick(l.id); setMenuOpen(false); }} className={`block rounded-xl px-3 py-2 ${linkCls(l.id)}`}>{l.label}</Anchor>
                </li>
              ))}
              <li><Link href="/chat" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${chatCls}`}>AI Chat</Link></li>
              <li><Link href="/donasi" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${donasiCls}`}>Donasi</Link></li>
              <li><Link href="/lembaga" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${lembagaCls}`}>Lembaga</Link></li>
            </ul>
            <button onClick={openLogin} className="mt-3 w-full rounded-full bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark">Masuk</button>
          </div>
        )}
      </header>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
