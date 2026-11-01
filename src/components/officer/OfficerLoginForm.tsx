"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { inputClass } from "@/components/report/FormField";
import { login, type OfficerSession } from "@/lib/auth";

export default function OfficerLoginForm({ onSuccess }: { onSuccess: (s: OfficerSession) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!username.trim() || !password) { setError("Username dan kata sandi wajib diisi."); return; }
    setBusy(true);
    setError("");
    const res = await login(username, password);
    setBusy(false);
    if (res.ok) onSuccess(res.session);
    else { setError(res.message); setPassword(""); }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="officer-username" className="mb-1.5 block text-[15px] font-semibold">Username</label>
        <input
          id="officer-username" type="text" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="Masukkan username"
          aria-invalid={error ? true : undefined} className={inputClass(!!error)}
        />
      </div>
      <div>
        <label htmlFor="officer-password" className="mb-1.5 block text-[15px] font-semibold">Kata sandi</label>
        <div className="relative">
          <input
            id="officer-password" type={show ? "text" : "password"} autoComplete="current-password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Masukkan kata sandi"
            aria-invalid={error ? true : undefined} className={`${inputClass(!!error)} pr-11`}
          />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/55 hover:text-ink">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70">
        {busy && <Loader2 size={18} className="animate-spin" />}
        {busy ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
