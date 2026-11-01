"use client";
import Image from "next/image";
import Link from "next/link";

export default function OfficerHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full transform-gpu rounded-b-3xl border-b border-white/40 bg-white/60 shadow-nav backdrop-blur-lg supports-[not(backdrop-filter:blur(1px))]:bg-white/95">
      <div className="relative mx-auto flex h-16 max-w-[1400px] items-center px-4 sm:h-[72px] sm:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto sm:h-10" />
          <span className="text-lg font-bold lowercase sm:text-xl">satwarta</span>
        </Link>
        <button type="button" onClick={onLogout} className="ml-auto rounded-full bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary-dark">
          Keluar
        </button>
      </div>
    </header>
  );
}
