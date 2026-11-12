"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { inputClass } from "@/components/report/FormField";
import { officerFetch } from "@/lib/auth";
import { roleLabel, type OfficerListItem, type OfficerRole } from "@/types/officer";
import { CopyButton, Modal, RegionSelect, randomPassword } from "./AdminUi";

type Mode = { kind: "create" } | { kind: "edit"; officer: OfficerListItem };
interface Props { mode: Mode; isSelf?: boolean; onClose: () => void; onSaved: (message: string) => void }

const ROLE_HELP: Record<OfficerRole, string> = {
  officer: "Hanya melihat dan menangani laporan di wilayah kerja yang dipilih.",
  national: "Lembaga pusat: melihat dan menangani laporan di semua wilayah.",
  admin: "Semua wilayah, dan dapat mengelola akun petugas.",
};

/** Tambah akun petugas baru atau ubah data akun yang ada. */
export default function OfficerFormModal({ mode, isSelf, onClose, onSaved }: Props) {
  const editing = mode.kind === "edit" ? mode.officer : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => (editing ? "" : randomPassword()));
  const [showPw, setShowPw] = useState(true);
  const [fullName, setFullName] = useState(editing?.fullName ?? "");
  const [agency, setAgency] = useState(editing?.agency ?? "");
  const [role, setRole] = useState<OfficerRole>(editing?.role ?? "officer");
  const [regions, setRegions] = useState<string[]>(editing?.regions ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setErrors({});
    const body = editing
      ? { fullName, agency, role, regions: role === "officer" ? regions : [] }
      : { email, password, fullName, agency, role, regions: role === "officer" ? regions : [] };
    try {
      const res = await officerFetch(editing ? `/api/admin/officers/${editing.id}` : "/api/admin/officers", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string> };
      if (!res.ok) { setError(data.error ?? "Belum dapat disimpan."); setErrors(data.errors ?? {}); setBusy(false); return; }
      if (editing) onSaved(`Data ${editing.email ?? editing.fullName} diperbarui.`);
      else setCreated({ email: email.trim().toLowerCase(), password });
    } catch { setError("Tidak dapat terhubung ke server."); }
    setBusy(false);
  };

  if (created) {
    return (
      <Modal title="Akun berhasil dibuat" onClose={() => onSaved(`Akun ${created.email} dibuat.`)}>
        <p className="text-sm text-ink/75">Catat atau salin sekarang. Kata sandi <strong>tidak dapat dilihat lagi</strong> setelah jendela ini ditutup (bisa diatur ulang lewat menu Atur sandi).</p>
        <dl className="mt-4 space-y-3 rounded-2xl bg-cream p-4 text-sm">
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><dt className="text-xs font-semibold text-ink/55">Email</dt><dd className="break-all font-medium">{created.email}</dd></div><CopyButton text={created.email} /></div>
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><dt className="text-xs font-semibold text-ink/55">Kata sandi</dt><dd className="break-all font-mono font-medium">{created.password}</dd></div><CopyButton text={created.password} /></div>
        </dl>
        <button type="button" onClick={() => onSaved(`Akun ${created.email} dibuat.`)} className="mt-5 w-full rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark">Selesai</button>
      </Modal>
    );
  }

  const label = "mb-1.5 block text-[0.9375rem] font-semibold";
  return (
    <Modal title={editing ? "Ubah petugas" : "Tambah petugas"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="space-y-4">
        {editing ? (
          <p className="rounded-xl bg-cream px-4 py-2.5 text-sm"><span className="font-semibold">Email:</span> {editing.email ?? "-"} <span className="text-ink/55">(tidak dapat diubah)</span></p>
        ) : (
          <>
            <div>
              <label htmlFor="adm-email" className={label}>Email</label>
              <input id="adm-email" type="email" autoComplete="off" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama+kode@gmail.com" aria-invalid={errors.email ? true : undefined} className={inputClass(!!errors.email)} />
              {errors.email
                ? <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>
                : <p className="mt-1 text-xs text-ink/60">Boleh email nyata atau alias Gmail (nama+kode@gmail.com). Domain contoh/uji seperti example.com ditolak Supabase.</p>}
            </div>
            <div>
              <label htmlFor="adm-pass" className={label}>Kata sandi awal</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input id="adm-pass" type={showPw ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} className={`${inputClass(!!errors.password)} pr-11 font-mono`} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Sembunyikan" : "Tampilkan"} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/55 hover:text-ink">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <button type="button" onClick={() => { setPassword(randomPassword()); setShowPw(true); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"><RefreshCw size={14} />Acak</button>
              </div>
              {errors.password ? <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.password}</p> : <p className="mt-1 text-xs text-ink/60">Minimal 10 karakter, memuat huruf dan angka.</p>}
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="adm-name" className={label}>Nama</label>
            <input id="adm-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tim Penanganan Satwa" aria-invalid={errors.fullName ? true : undefined} className={inputClass(!!errors.fullName)} />
            {errors.fullName && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="adm-agency" className={label}>Instansi</label>
            <input id="adm-agency" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="BKSDA Kalimantan Barat" aria-invalid={errors.agency ? true : undefined} className={inputClass(!!errors.agency)} />
            {errors.agency && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.agency}</p>}
          </div>
        </div>
        <p className="-mt-2 text-xs text-ink/60">Nama dan instansi tampil di riwayat laporan yang dilihat publik.</p>

        <div>
          <label htmlFor="adm-role" className={label}>Peran</label>
          <select id="adm-role" value={role} disabled={isSelf} onChange={(e) => setRole(e.target.value as OfficerRole)} className={`${inputClass(false)} disabled:opacity-60`}>
            {(Object.keys(roleLabel) as OfficerRole[]).map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
          <p className="mt-1 text-xs text-ink/60">{isSelf ? "Peran akun Anda sendiri tidak dapat diubah." : ROLE_HELP[role]}</p>
        </div>

        {role === "officer" && (
          <div>
            <span className={label}>Wilayah kerja</span>
            <RegionSelect value={regions} onChange={setRegions} error={errors.regions} />
          </div>
        )}

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold text-ink/70 ring-1 ring-black/10 hover:bg-cream">Batal</button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70">
            {busy && <Loader2 size={16} className="animate-spin" />}{busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Buat akun"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

