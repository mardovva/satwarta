"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { setRole } from "@/lib/role";

export default function OfficerHeader() {
  const router = useRouter();
  const logout = () => { setRole("pelapor"); router.push("/"); };
  return (
    <header className="sticky top-0 z-40 rounded-b-3xl bg-white shadow-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-8 w-auto sm:h-10" />
          <span className="text-lg font-bold lowercase sm:text-xl">satwarta</span>
        </Link>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent sm:text-sm">Dasbor Petugas</span>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href="/" className="hidden text-sm font-medium text-ink transition hover:text-accent sm:block">Beranda</Link>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
            <LogOut size={16} /> Keluar
          </button>
        </nav>
      </div>
    </header>
  );
}
