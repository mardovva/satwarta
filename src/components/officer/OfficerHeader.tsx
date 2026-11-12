"use client";
import Image from "next/image";
import Link from "next/link";
import { useScrolled } from "@/hooks/useHideOnScroll";

export default function OfficerHeader({ onLogout, links = [] }: { onLogout: () => void; links?: { href: string; label: string }[] }) {
  const scrolled = useScrolled();
  return (
    <div className={`site-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out ${scrolled ? "px-3 pt-3 sm:px-6 sm:pt-4" : "px-0 pt-0"}`}>
      <header
        className={`pointer-events-auto mx-auto border transition-all duration-500 ease-out ${
          scrolled ? "max-w-[75rem] rounded-full border-white/40 bg-white/25 shadow-nav backdrop-blur-xl backdrop-saturate-150" : "max-w-[120rem] rounded-none border-transparent bg-transparent shadow-none"
        }`}
      >
        <div className="relative mx-auto flex h-14 items-center px-5 sm:h-16 sm:px-7">
          <Link href="/" aria-label="Satwarta, ke beranda" className="flex items-center">
            <Image src="/images/logo-dark.svg" alt="Logo Satwarta" width={714} height={160} priority unoptimized className="h-7 w-auto sm:h-8" />
          </Link>
          <nav className="ml-auto flex items-center gap-1 pr-2 sm:gap-3">
            {links.map((l) => <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80 transition hover:bg-white/50 hover:text-accent sm:px-4 sm:text-base">{l.label}</Link>)}
          </nav>
          <button type="button" onClick={onLogout} className=" rounded-full border border-white/60 bg-white/55 px-6 py-2 font-semibold text-ink shadow-nav backdrop-blur-xl backdrop-saturate-150 transition hover:bg-white/80">
            Keluar
          </button>
        </div>
      </header>
    </div>
  );
}

