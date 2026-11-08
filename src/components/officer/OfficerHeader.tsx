"use client";
import Image from "next/image";
import Link from "next/link";
import { useScrolled } from "@/hooks/useHideOnScroll";

export default function OfficerHeader({ onLogout }: { onLogout: () => void }) {
  const scrolled = useScrolled();
  return (
    <div className={`site-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out ${scrolled ? "px-3 pt-3 sm:px-6 sm:pt-4" : "px-0 pt-0"}`}>
      <header
        className={`pointer-events-auto mx-auto border backdrop-blur-sm transition-all duration-500 ease-out ${
          scrolled ? "max-w-[75rem] rounded-full border-white/40 bg-white/30 shadow-nav" : "max-w-[120rem] rounded-none border-transparent bg-transparent shadow-none backdrop-blur-none"
        }`}
      >
        <div className="relative mx-auto flex h-14 items-center px-5 sm:h-16 sm:px-7">
          <Link href="/" aria-label="Satwarta, ke beranda" className="flex items-center">
            <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto sm:h-10" />
          </Link>
          <button type="button" onClick={onLogout} className="ml-auto rounded-full bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary-dark">
            Keluar
          </button>
        </div>
      </header>
    </div>
  );
}
