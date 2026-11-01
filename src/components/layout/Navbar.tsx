"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import LoginModal from "./LoginModal";

const links = [
  { label: "Beranda", id: "beranda" },
  { label: "Lapor", id: "lapor" },
  { label: "Track", id: "track" },
  { label: "Berita dan Data", id: "berita" },
  { label: "Tentang", id: "tentang" },
  { label: "FAQ", id: "faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [active, setActive] = useState("beranda");

  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const linkCls = (id: string) =>
    id === active ? "font-semibold text-accent" : "text-ink transition-colors hover:text-accent";

  const openLogin = () => { setMenuOpen(false); setLoginOpen(true); };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full rounded-b-3xl border-b border-white/40 bg-white/60 shadow-nav backdrop-blur-lg supports-[not(backdrop-filter:blur(1px))]:bg-white/95">
        <nav className="relative mx-auto flex h-16 max-w-[1400px] items-center px-4 sm:h-[72px] sm:px-8" aria-label="Navigasi utama">
          <a href="#beranda" className="flex items-center gap-2 sm:gap-3">
            <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto sm:h-10" />
            <span className="text-lg font-bold lowercase sm:text-xl">satwarta</span>
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-base lg:flex xl:gap-9 xl:text-lg">
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={l.id === active ? "page" : undefined} className={linkCls(l.id)}>{l.label}</a>
              </li>
            ))}
          </ul>

          <button onClick={openLogin} className="ml-auto hidden rounded-full bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary-dark lg:block">
            Masuk
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen} className="ml-auto rounded-full p-2 hover:bg-mist lg:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-gray-100 px-4 pb-5 pt-3 lg:hidden">
            <ul className="space-y-1 text-lg">
              {links.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={() => setMenuOpen(false)} className={`block rounded-xl px-3 py-2 ${linkCls(l.id)}`}>{l.label}</a>
                </li>
              ))}
            </ul>
            <button onClick={openLogin} className="mt-3 w-full rounded-full bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark">Masuk</button>
          </div>
        )}
      </header>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
