"use client";
import { useEffect, useState } from "react";
import { PLEDGES_EVENT, getPledges, type Pledge } from "@/lib/donations";

/** Donasi yang tercatat di browser ini (simulasi); diperbarui otomatis saat ada donasi baru. */
export function usePledges(): Pledge[] {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  useEffect(() => {
    const load = () => setPledges(getPledges());
    load();
    window.addEventListener(PLEDGES_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(PLEDGES_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return pledges;
}

