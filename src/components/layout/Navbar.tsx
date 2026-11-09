"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useScrolled } from "@/hooks/useHideOnScroll";
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

  useEffect(() => {
    if (!isHome) return;
    const els = links.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const linkCls = (id: string) =>
    isHome && id === active ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const chatCls = pathname === "/chat" ? "font-semibold text-accent" : "transition-colors hover:text-accent";
  const donasiCls = pathname.startsWith("/donasi") ? "font-semibold text-accent" : "transition-colors hover:text-accent";
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
            <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto sm:h-10" />
          </Anchor>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-base lg:flex xl:gap-9 xl:text-lg">
            {links.map((l) => (
              <li key={l.id}>
                <Anchor href={hashHref(l.id)} aria-current={isHome && l.id === active ? "page" : undefined} className={linkCls(l.id)}>{l.label}</Anchor>
              </li>
            ))}
            <li><Link href="/chat" aria-current={pathname === "/chat" ? "page" : undefined} className={chatCls}>AI Chat</Link></li>
            <li><Link href="/donasi" aria-current={pathname.startsWith("/donasi") ? "page" : undefined} className={donasiCls}>Donasi</Link></li>
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
                  <Anchor href={hashHref(l.id)} onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${linkCls(l.id)}`}>{l.label}</Anchor>
                </li>
              ))}
              <li><Link href="/chat" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${chatCls}`}>AI Chat</Link></li>
              <li><Link href="/donasi" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${donasiCls}`}>Donasi</Link></li>
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
