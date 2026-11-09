"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";
import { MIN_DONATION, PRESET_AMOUNTS, type Campaign } from "@/lib/campaigns";
import { formatRupiah, savePledge, type Pledge } from "@/lib/donations";

const METHODS = [
  { id: "QRIS", label: "QRIS", hint: "Semua aplikasi dompet digital dan m-banking" },
  { id: "Transfer Bank (Virtual Account)", label: "Transfer Bank (Virtual Account)", hint: "BCA, BNI, BRI, Mandiri" },
  { id: "E-Wallet", label: "E-Wallet", hint: "GoPay, OVO, DANA, ShopeePay" },
];

interface Props { campaign: Campaign; onShare: () => void }

/** Panel donasi: nominal, data donatur, doa, dan metode pembayaran. */
export default function DonateForm({ campaign: c, onShare }: Props) {
  const [raw, setRaw] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState(METHODS[0].id);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");
  const [receipt, setReceipt] = useState<Pledge | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const amount = Number(raw || 0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < MIN_DONATION) { setError(`Nominal donasi minimal ${formatRupiah(MIN_DONATION)}.`); return; }
    setError("");
    setPhase("processing");
    timer.current = window.setTimeout(() => {
      const saved = savePledge({ reportId: c.id, needId: "total", amount, name: anonymous ? "" : name.trim(), contact: "", anonymous, message: message.trim(), method });
      setReceipt(saved);
      setPhase("done");
    }, 1500);
  };

  const again = () => { setRaw(""); setMessage(""); setReceipt(null); setPhase("form"); };

  if (c.done) {
    return (
      <div className="rounded-2xl bg-cream p-5 text-center ring-1 ring-black/5">
        <p className="font-bold text-primary">Penanganan sudah selesai</p>
        <p className="mt-1 text-sm text-ink/70">Terima kasih kepada semua donatur. Lihat tab Kabar Terbaru untuk perkembangan penanganan.</p>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-cream px-6 py-14 text-center ring-1 ring-black/5">
        <Loader2 size={44} className="animate-spin text-primary" />
        <p className="font-semibold text-primary">Memproses pembayaran…</p>
      </div>
    );
  }

  if (phase === "done" && receipt) {
    return (
      <div className="space-y-4 rounded-2xl bg-cream px-5 py-8 text-center ring-1 ring-black/5">
        <div className="relative mx-auto h-20 w-20">
          <span aria-hidden className="pay-ring absolute inset-0 rounded-full bg-primary/30" />
          <svg viewBox="0 0 52 52" className="pay-pop relative h-20 w-20" aria-hidden>
            <circle cx="26" cy="26" r="24" fill="#345542" />
            <path className="pay-check" d="M15 27 l8 8 l15 -16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary">Terima kasih{receipt.name ? `, ${receipt.name}` : ""}!</h3>
        <p className="text-sm text-ink/75">Donasi <strong>{formatRupiah(receipt.amount)}</strong> untuk {c.title} telah tercatat.</p>
        <dl className="mx-auto max-w-xs space-y-1 rounded-xl bg-white px-4 py-3 text-left text-sm ring-1 ring-black/5">
          <div className="flex justify-between gap-3"><dt className="text-ink/60">Kode donasi</dt><dd className="font-semibold">{receipt.code}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-ink/60">Metode</dt><dd className="text-right font-semibold">{receipt.method}</dd></div>
        </dl>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5"><Share2 size={15} /> Bagikan</button>
          <button type="button" onClick={again} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Donasi lagi</button>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-xl bg-white px-3.5 py-2.5 text-[0.9375rem] shadow-sm outline-none ring-1 ring-black/10 placeholder:text-ink/40 focus:ring-2 focus:ring-primary";

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl bg-cream p-4 ring-1 ring-black/5 sm:p-5">
      <h3 className="text-lg font-bold text-primary">Donasi untuk {c.title}</h3>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Pilih nominal</legend>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a} type="button" aria-pressed={amount === a} onClick={() => { setRaw(String(a)); setError(""); }}
              className={`rounded-xl px-2 py-2 text-sm font-semibold ring-1 transition ${amount === a ? "bg-primary text-white ring-primary" : "bg-white text-ink ring-black/10 hover:ring-primary/50"}`}
            >
              {new Intl.NumberFormat("id-ID").format(a)}
            </button>
          ))}
        </div>
        <label htmlFor="donate-amount" className="sr-only">Nominal lain</label>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/60">Rp</span>
          <input
            id="donate-amount" inputMode="numeric" autoComplete="off" placeholder="Nominal lain" value={raw ? new Intl.NumberFormat("id-ID").format(amount) : ""}
            onChange={(e) => { setRaw(e.target.value.replace(/\D/g, "").slice(0, 9)); setError(""); }}
            aria-invalid={!!error} className={`${field} pl-10`}
          />
        </div>
        {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </fieldset>

      <div>
        <label htmlFor="donate-name" className="mb-1 block text-sm font-semibold">Nama <span className="font-normal text-ink/50">(opsional)</span></label>
        <input id="donate-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" disabled={anonymous} placeholder={anonymous ? "Donatur anonim" : "Nama Anda"} className={`${field} disabled:bg-ink/5`} />
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-[#345542]" />
          Sembunyikan nama saya (donasi anonim)
        </label>
      </div>

      <div>
        <label htmlFor="donate-message" className="mb-1 block text-sm font-semibold">Doa atau dukungan <span className="font-normal text-ink/50">(opsional)</span></label>
        <textarea id="donate-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} rows={2} placeholder="Semoga cepat pulih dan kembali ke habitatnya" className={`${field} resize-none`} />
        <p className="mt-0.5 text-right text-xs text-ink/45">{message.length}/200</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Metode pembayaran</legend>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 transition ${method === m.id ? "ring-2 ring-primary" : "ring-black/10 hover:ring-primary/40"}`}>
              <input type="radio" name="donate-method" checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 accent-[#345542]" />
              <span><span className="block text-sm font-semibold">{m.label}</span><span className="block text-xs text-ink/60">{m.hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between border-t border-black/10 pt-3 text-sm">
        <span className="text-ink/70">Total donasi</span>
        <span className="text-lg font-bold text-primary">{formatRupiah(amount)}</span>
      </div>

      <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-white shadow-md transition hover:bg-primary-dark">
        <Check size={18} /> Donasi sekarang
      </button>
    </form>
  );
}
