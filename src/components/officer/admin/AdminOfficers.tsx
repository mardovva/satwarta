"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { inputClass } from "@/components/report/FormField";
import { officerFetch, signOut } from "@/lib/auth";
import { useOfficerSession } from "@/hooks/useOfficerSession";
import { roleLabel, type AuditAction, type AuditItem, type OfficerListItem, type OfficerRole } from "@/types/officer";
import OfficerHeader from "../OfficerHeader";
import OfficerLoginScreen from "../OfficerLoginScreen";
import OfficerFormModal from "./OfficerFormModal";
import { CopyButton, Modal, randomPassword } from "./AdminUi";

type Dialog =
  | { type: "create" }
  | { type: "edit"; officer: OfficerListItem }
  | { type: "password"; officer: OfficerListItem }
  | { type: "toggle"; officer: OfficerListItem }
  | { type: "delete"; officer: OfficerListItem };

const AUDIT_LABEL: Record<AuditAction, string> = {
  create: "Menambah akun", update: "Mengubah data", reset_password: "Mengatur ulang kata sandi",
  deactivate: "Menonaktifkan akun", reactivate: "Mengaktifkan kembali", delete: "Menghapus akun",
};
const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Belum pernah");

async function api(method: string, path: string, body?: unknown): Promise<{ ok: boolean; error?: string; data: Record<string, unknown> }> {
  try {
    const res = await officerFetch(path, { method, ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, error: typeof data.error === "string" ? data.error : undefined, data };
  } catch { return { ok: false, error: "Tidak dapat terhubung ke server.", data: {} }; }
}

function PasswordDialog({ officer, onClose, onDone }: { officer: OfficerListItem; onClose: () => void; onDone: (m: string) => void }) {
  const [password, setPassword] = useState(() => randomPassword());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setBusy(true); setError("");
    const r = await api("PATCH", `/api/admin/officers/${officer.id}`, { password });
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Belum dapat disimpan."); else setSaved(true);
  };
  return (
    <Modal title={saved ? "Kata sandi diperbarui" : "Atur ulang kata sandi"} onClose={() => (saved ? onDone(`Kata sandi ${officer.email ?? officer.fullName} diperbarui.`) : onClose())}>
      <p className="text-sm text-ink/75">Akun: <strong>{officer.email ?? officer.fullName}</strong> ({officer.agency}).{saved ? " Salin sekarang: kata sandi tidak dapat dilihat lagi." : " Kata sandi lama langsung tidak berlaku."}</p>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cream p-4">
        {saved
          ? <span className="min-w-0 break-all font-mono text-sm font-medium">{password}</span>
          : <input value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Kata sandi baru" className={`${inputClass(!!error)} font-mono`} />}
        <CopyButton text={password} />
      </div>
      {!saved && <button type="button" onClick={() => setPassword(randomPassword())} className="mt-2 text-xs font-semibold text-primary hover:underline">Buat acak lagi</button>}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        {saved
          ? <button type="button" onClick={() => onDone(`Kata sandi ${officer.email ?? officer.fullName} diperbarui.`)} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Selesai</button>
          : <>
              <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold text-ink/70 ring-1 ring-black/10 hover:bg-cream">Batal</button>
              <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70">{busy && <Loader2 size={16} className="animate-spin" />}Simpan kata sandi</button>
            </>}
      </div>
    </Modal>
  );
}

function ConfirmDialog({ kind, officer, onClose, onDone }: { kind: "toggle" | "delete"; officer: OfficerListItem; onClose: () => void; onDone: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const name = officer.email ?? officer.fullName;
  const deactivating = kind === "toggle" && officer.active;
  const run = async () => {
    setBusy(true); setError("");
    const r = kind === "delete" ? await api("DELETE", `/api/admin/officers/${officer.id}`) : await api("PATCH", `/api/admin/officers/${officer.id}`, { active: !officer.active });
    setBusy(false);
    if (!r.ok) { setError(r.error ?? "Belum dapat diproses."); return; }
    onDone(kind === "delete" ? `Akun ${name} dihapus.` : deactivating ? `Akun ${name} dinonaktifkan.` : `Akun ${name} diaktifkan kembali.`);
  };
  const title = kind === "delete" ? "Hapus akun petugas?" : deactivating ? "Nonaktifkan akun?" : "Aktifkan kembali akun?";
  const text = kind === "delete"
    ? "Akun login dan profil petugas dihapus permanen. Riwayat laporan yang pernah ia tangani tetap tersimpan dengan namanya, tetapi laporan yang ia pegang dilepas dari penanggung jawab."
    : deactivating ? "Petugas langsung tidak dapat membuka dasbor atau menangani laporan. Akunnya tidak dihapus dan dapat diaktifkan kembali kapan saja."
    : "Petugas dapat masuk dan menangani laporan di wilayahnya lagi.";
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-ink/75"><strong>{name}</strong> ({officer.agency})</p>
      <p className="mt-2 text-sm text-ink/75">{text}</p>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold text-ink/70 ring-1 ring-black/10 hover:bg-cream">Batal</button>
        <button type="button" onClick={run} disabled={busy} className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-white disabled:opacity-70 ${kind === "delete" || deactivating ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"}`}>
          {busy && <Loader2 size={16} className="animate-spin" />}{kind === "delete" ? "Hapus akun" : deactivating ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </Modal>
  );
}

function AdminContent({ selfId, onLogout }: { selfId: string; onLogout: () => void }) {
  const [officers, setOfficers] = useState<OfficerListItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<OfficerRole | "all">("all");

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([api("GET", "/api/admin/officers"), api("GET", "/api/admin/audit")]);
    if (a.ok) { setOfficers(a.data.officers as OfficerListItem[]); setError(""); } else setError(a.error ?? "Daftar petugas belum dapat dimuat.");
    if (b.ok) setAudit(b.data.entries as AuditItem[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const done = (message: string) => { setDialog(null); setNotice(message); void load(); window.setTimeout(() => setNotice(""), 6000); };

  const counts = useMemo(() => ({
    total: officers.length, officer: officers.filter((o) => o.role === "officer").length, national: officers.filter((o) => o.role === "national").length,
    admin: officers.filter((o) => o.role === "admin").length, inactive: officers.filter((o) => !o.active).length,
  }), [officers]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return officers.filter((o) => (roleFilter === "all" || o.role === roleFilter) && (!q || [o.email ?? "", o.fullName, o.agency, ...o.regions].some((v) => v.toLowerCase().includes(q))));
  }, [officers, query, roleFilter]);

  const iconBtn = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="min-h-screen bg-cream">
      <OfficerHeader onLogout={onLogout} links={[{ href: "/petugas", label: "Dasbor" }]} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-8 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Kelola Petugas</h1>
            <p className="mt-1 text-sm text-ink/70">Tambah, ubah, atau nonaktifkan akun petugas. Semua perubahan dicatat di log kegiatan.</p>
          </div>
          <button type="button" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark"><Plus size={18} />Tambah petugas</button>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          {[["Total", counts.total], ["Regional", counts.officer], ["Nasional", counts.national], ["Admin", counts.admin], ["Nonaktif", counts.inactive]].map(([k, v]) => (
            <li key={k as string} className="rounded-full bg-white px-3.5 py-1.5 text-ink/80 ring-1 ring-black/5">{k}: <span className="text-primary">{v}</span></li>
          ))}
        </ul>

        {notice && <p role="status" className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">{notice}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error} <button type="button" onClick={() => void load()} className="font-semibold underline">Coba lagi</button></p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, instansi, email, atau wilayah…" aria-label="Cari petugas" className="min-w-0 flex-1 rounded-full bg-white px-5 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as OfficerRole | "all")} aria-label="Filter peran" className="rounded-full bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-primary">
            <option value="all">Semua peran</option>
            {(Object.keys(roleLabel) as OfficerRole[]).map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
        </div>

        <section aria-label="Daftar petugas" className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          {loading && <p className="p-6 text-sm text-ink/60">Memuat…</p>}
          {!loading && visible.length === 0 && <p className="p-6 text-sm text-ink/60">Tidak ada petugas yang cocok.</p>}
          <ul className="divide-y divide-primary/10">
            {visible.map((o) => {
              const self = o.id === selfId;
              return (
                <li key={o.id} className={`grid gap-x-6 gap-y-2 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_auto] lg:items-center ${o.active ? "" : "bg-red-50/40"}`}>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                      {o.agency}
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-primary">{roleLabel[o.role]}</span>
                      {!o.active && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-red-700">Nonaktif</span>}
                      {self && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-amber-800">Anda</span>}
                    </p>
                    <p className="text-sm text-ink/70">{o.fullName}</p>
                    <p className="break-all text-xs text-ink/55">{o.email ?? "(email tidak terbaca)"} · masuk terakhir: {dt(o.lastSignInAt)}</p>
                  </div>
                  <p className="text-sm text-ink/75">{o.role === "officer" ? (o.regions.length ? o.regions.join(", ") : <span className="text-amber-700">Belum ada wilayah</span>) : "Semua wilayah"}</p>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button type="button" onClick={() => setDialog({ type: "edit", officer: o })} className={`${iconBtn} text-primary ring-primary/30 hover:bg-primary/10`}><Pencil size={13} />Ubah</button>
                    <button type="button" onClick={() => setDialog({ type: "password", officer: o })} className={`${iconBtn} text-ink/75 ring-black/15 hover:bg-cream`}><KeyRound size={13} />Atur sandi</button>
                    <button type="button" disabled={self} title={self ? "Tidak dapat menonaktifkan akun sendiri" : undefined} onClick={() => setDialog({ type: "toggle", officer: o })} className={`${iconBtn} ${o.active ? "text-amber-800 ring-amber-300 hover:bg-amber-50" : "text-primary ring-primary/30 hover:bg-primary/10"}`}><Power size={13} />{o.active ? "Nonaktifkan" : "Aktifkan"}</button>
                    <button type="button" disabled={self} title={self ? "Tidak dapat menghapus akun sendiri" : undefined} onClick={() => setDialog({ type: "delete", officer: o })} className={`${iconBtn} text-red-700 ring-red-200 hover:bg-red-50`}><Trash2 size={13} />Hapus</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label="Log kegiatan" className="mt-10">
          <h2 className="mb-3 text-xl font-bold">Log kegiatan</h2>
          <div className="rounded-3xl bg-white p-2 shadow-sm ring-1 ring-black/5">
            {audit.length === 0 && <p className="p-4 text-sm text-ink/60">Belum ada kegiatan tercatat.</p>}
            <ul className="divide-y divide-primary/10">
              {audit.map((e) => {
                const d = e.details as { agency?: string; role?: string; regions?: string[]; fullName?: string };
                const bits = [d.fullName, d.agency, d.role && (roleLabel[d.role as OfficerRole] ?? d.role), d.regions?.length ? d.regions.join(", ") : undefined].filter(Boolean);
                return (
                  <li key={e.id} className="px-4 py-2.5 text-sm">
                    <span className="font-semibold">{AUDIT_LABEL[e.action]}</span> <span className="break-all">{e.targetLabel}</span>
                    <span className="block text-xs text-ink/55">{dt(e.at)} · oleh {e.actorName}{bits.length ? ` · ${bits.join(" · ")}` : ""}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      {dialog?.type === "create" && <OfficerFormModal mode={{ kind: "create" }} onClose={() => setDialog(null)} onSaved={done} />}
      {dialog?.type === "edit" && <OfficerFormModal mode={{ kind: "edit", officer: dialog.officer }} isSelf={dialog.officer.id === selfId} onClose={() => setDialog(null)} onSaved={done} />}
      {dialog?.type === "password" && <PasswordDialog officer={dialog.officer} onClose={() => setDialog(null)} onDone={done} />}
      {(dialog?.type === "toggle" || dialog?.type === "delete") && <ConfirmDialog kind={dialog.type} officer={dialog.officer} onClose={() => setDialog(null)} onDone={done} />}
    </div>
  );
}

/** Halaman Kelola Petugas: hanya admin. Pemeriksaan sebenarnya dilakukan server di setiap permintaan. */
export default function AdminOfficers() {
  const router = useRouter();
  const state = useOfficerSession();
  if (state.status === "loading") return <div className="min-h-screen bg-cream" />;
  if (state.status === "anon") return <OfficerLoginScreen notice={state.notice} />;
  if (state.officer.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-black/5">
          <h1 className="text-xl font-bold text-primary">Khusus admin</h1>
          <p className="mt-2 text-sm text-ink/70">Halaman ini hanya dapat dibuka oleh akun admin.</p>
          <Link href="/petugas" className="mt-5 inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Kembali ke dasbor</Link>
        </div>
      </div>
    );
  }
  return <AdminContent selfId={state.officer.username} onLogout={() => { void signOut().then(() => router.push("/")); }} />;
}

