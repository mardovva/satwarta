"use client";
import { useEffect, useState } from "react";
import { PLEDGES_EVENT, type Pledge } from "@/lib/donations";
import { ensureRemotePledges, getRemotePledges } from "@/lib/remotePledges";

/** Donasi dari database (dibagi ke semua perangkat); diperbarui otomatis saat ada donasi baru, dari perangkat ini maupun lain. */
export function usePledges(): Pledge[] {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  useEffect(() => {
    const load = () => setPledges(getRemotePledges());
    window.addEventListener(PLEDGES_EVENT, load);
    ensureRemotePledges();
    load();
    return () => window.removeEventListener(PLEDGES_EVENT, load);
  }, []);
  return pledges;
}
