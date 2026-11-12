"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { officerFetch, signOut, type OfficerSession } from "@/lib/auth";
import { browserSupabase } from "@/lib/supabase/browser";

export type SessionState =
  | { status: "loading" }
  | { status: "anon"; notice?: string }
  | { status: "officer"; officer: OfficerSession };

/** Sesi petugas: masuk lewat Supabase Auth, lalu dicocokkan dengan tabel petugas di server (GET /api/petugas/me). */
export function useOfficerSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const verifying = useRef(false);

  const verify = useCallback(async () => {
    if (verifying.current) return;
    verifying.current = true;
    try {
      const res = await officerFetch("/api/petugas/me");
      const data = (await res.json().catch(() => ({}))) as { officer?: { id: string; name: string; agency: string; role: "officer" | "national" | "admin"; regions: string[] }; error?: string };
      if (res.ok && data.officer) {
        const o = data.officer;
        setState({ status: "officer", officer: { username: o.id, name: o.name, agency: o.agency, role: o.role, regions: o.regions } });
      } else if (res.status === 403) {
        await signOut();
        setState({ status: "anon", notice: "Akun ini bukan akun petugas. Hubungi admin bila Anda seharusnya memiliki akses." });
      } else if (res.status === 401) {
        setState({ status: "anon" });
      } else {
        setState({ status: "anon", notice: "Layanan belum dapat dihubungi. Coba muat ulang halaman." });
      }
    } finally { verifying.current = false; }
  }, []);

  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) { setState({ status: "anon", notice: "Layanan login belum dikonfigurasi di server ini." }); return; }
    let alive = true;
    void sb.auth.getSession().then(({ data }) => { if (alive) { if (data.session) void verify(); else setState({ status: "anon" }); } });
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (!alive) return;
      if (event === "SIGNED_IN") void verify();
      if (event === "SIGNED_OUT") setState((s) => (s.status === "anon" && s.notice ? s : { status: "anon" }));
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [verify]);

  return state;
}

