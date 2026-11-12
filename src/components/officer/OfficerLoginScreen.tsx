"use client";
import Image from "next/image";
import Link from "next/link";
import OfficerLoginForm from "./OfficerLoginForm";

/** Layar masuk petugas (dipakai di dasbor dan halaman admin). */
export default function OfficerLoginScreen({ notice }: { notice?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-8">
        <Link href="/" aria-label="Satwarta, ke beranda" className="mb-5 flex justify-center">
          <Image src="/images/logo-dark.svg" alt="Logo Satwarta" width={714} height={160} priority unoptimized className="h-9 w-auto" />
        </Link>
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-primary">Masuk Petugas</h1>
        {notice && <p role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">{notice}</p>}
        <OfficerLoginForm />
      </div>
    </div>
  );
}
