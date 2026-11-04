"use client";
import Image from "next/image";
import Link from "next/link";

export default function OfficerHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full transform-gpu rounded-b-3xl border-b border-white/30 bg-white/30 shadow-nav backdrop-blur-sm supports-[not(backdrop-filter:blur(1px))]:bg-white/90">
      <div className="relative mx-auto flex h-16 max-w-[87.5rem] items-center px-4 sm:h-[4.5rem] sm:px-8">
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
