"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Decor from "@/components/layout/Decor";
import Reveal from "@/components/ui/Reveal";
import type { PhotoItem, ReportFormErrors, ReportFormValues, StoredReport } from "@/types/report";
import { CONDITION_OTHER } from "@/data/formOptions";
import { shrinkImage, type Identification } from "@/lib/identifyAnimal";
import { submitReport } from "@/lib/submitReport";
import { rememberMyReport } from "@/lib/myReports";
import { refreshRemoteReports } from "@/lib/remoteReports";
import { validateReportForm } from "@/lib/validateReport";
import AnimalInformationForm from "./AnimalInformationForm";
import LocationPicker from "./LocationPicker";
import FileUpload from "./FileUpload";
import TurnstileWidget, { TURNSTILE_SITE_KEY } from "./TurnstileWidget";
import SubmissionSuccess from "./SubmissionSuccess";
import { FormField, fieldProps, inputClass } from "./FormField";

const initialValues: ReportFormValues = {
  animalType: "", animalName: "", count: "", condition: "", conditionOther: "",
  province: "", city: "", locationDetail: "", location: null,
  reporterName: "", phone: "", email: "", consent: false,
};

type AiState =
  | { status: "idle" | "off" | "loading" | "none" | "error" }
  | { status: "done"; filled: string[] };

export default function ReportFormSection() {
  const [values, setValues] = useState<ReportFormValues>(initialValues);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0); // mengganti key widget = meminta token baru (token hanya sekali pakai)
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const [result, setResult] = useState<{ report: StoredReport; persisted: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const photosRef = useRef<PhotoItem[]>([]);
  photosRef.current = photos;
  const [ai, setAi] = useState<AiState>({ status: "idle" });
  const analyzedRef = useRef("");            // ID foto pertama yang sudah dianalisis AI
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Foto pertama dianalisis Gemini: jenis, nama, jumlah, dan kondisi diisi otomatis HANYA pada kolom yang masih kosong.
  useEffect(() => {
    const first = photos[0];
    if (!first) { analyzedRef.current = ""; setAi((a) => (a.status === "off" ? a : { status: "idle" })); return; }
    if (analyzedRef.current === first.id || ai.status === "off") return;
    analyzedRef.current = first.id;
    (async () => {
      setAi({ status: "loading" });
      try {
        const img = await shrinkImage(first.file);
        const res = await fetch("/api/identify-animal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: img.data, mimeType: img.mimeType }) });
        if (!mountedRef.current) return;
        if (res.status === 503) { setAi({ status: "off" }); return; }  // kunci Gemini belum diatur: fitur dimatikan
        const data = await res.json();
        if (!mountedRef.current) return;
        if (!res.ok || !data.result) { setAi({ status: "error" }); return; }
        const r = data.result as Identification;
        if (!r.isAnimal) { setAi({ status: "none" }); return; }

        const v = valuesRef.current;
        const filled: string[] = [];
        if (!v.animalType && r.animalType) filled.push("jenis");
        if (!v.animalName.trim() && r.animalName) filled.push("nama");
        if (!v.count && r.count > 0) filled.push("jumlah");
        if (!v.condition && r.condition) filled.push("kondisi");
        setValues((cur) => {
          const next = { ...cur };
          if (!cur.animalType && r.animalType) next.animalType = r.animalType;
          if (!cur.animalName.trim() && r.animalName) next.animalName = r.animalName;
          if (!cur.count && r.count > 0) next.count = String(r.count);
          if (!cur.condition && r.condition) { next.condition = r.condition; if (r.conditionOther) next.conditionOther = r.conditionOther; }
          return next;
        });
        setErrors((e) => ({ ...e, ...(filled.includes("jenis") ? { animalType: undefined } : {}), ...(filled.includes("jumlah") ? { count: undefined } : {}), ...(filled.includes("kondisi") ? { condition: undefined, conditionOther: undefined } : {}) }));
        setAi({ status: "done", filled });
      } catch {
        if (mountedRef.current) setAi({ status: "error" });
      }
    })();
  }, [photos, ai.status]);

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const onChange = <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = validateReportForm(values);
    const missingPhoto = photos.length === 0;
    setErrors(found);
    setPhotoError(missingPhoto ? "Unggah minimal satu foto dokumentasi." : "");
    if (Object.keys(found).length > 0 || missingPhoto) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus()
      );
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setSubmitError(captchaFailed ? "Verifikasi keamanan tidak dapat dimuat. Nonaktifkan pemblokir iklan untuk situs ini atau muat ulang halaman, lalu coba lagi." : "Verifikasi keamanan sedang berjalan. Tunggu beberapa detik lalu tekan Kirim lagi.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    void (async () => {
      const res = await submitReport(values, photos, captchaToken);
      setCaptchaToken(null); setCaptchaNonce((n) => n + 1); // token sudah terpakai: minta yang baru untuk percobaan berikutnya
      if (!mountedRef.current) return;
      if (!res.ok) { setSubmitError(res.message); setSubmitting(false); return; } // isian dan foto tetap ada agar bisa dicoba lagi

      rememberMyReport(res.id);
      void refreshRemoteReports(true); // peta, statistik, dan Lacak memuat laporan baru dari server
      const loc = values.location!;
      const now = new Date().toISOString();
      const report: StoredReport = {
        id: res.id, createdAt: now, status: "Submitted",
        animal: { type: values.animalType, name: values.animalName.trim(), count: Number(values.count), condition: values.condition === CONDITION_OTHER ? values.conditionOther.trim() : values.condition },
        location: { province: values.province, city: values.city, lat: loc.lat, lng: loc.lng },
        photos: photos.map((p) => ({ name: p.file.name, size: p.file.size, type: p.file.type })),
        reporter: { name: values.reporterName.trim(), phone: values.phone, email: values.email.trim() },
        history: [{ status: "Submitted", at: now, note: "Laporan berhasil dikirim." }],
      };
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setPhotos([]);
      setValues(initialValues);
      setErrors({});
      setResult({ report, persisted: true });
      setSubmitting(false);
    })();
  };

  const hasErrors = Object.values(errors).some(Boolean) || !!photoError;

  // Status analisis AI: tampil di sebelah kanan label "Dokumentasi"
  // Keterangan tetap di kanan label "Dokumentasi"; berganti menjadi status analisis saat AI bekerja. Disembunyikan bila fitur AI mati.
  const aiHint = ai.status === "off" ? null : (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
      <Sparkles size={13} className="flex-none" />AI membantu mendeteksi satwa melalui gambar
    </span>
  );
  const aiNotice = ai.status === "idle" || ai.status === "off" ? null : (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
      {ai.status === "loading" ? <Loader2 size={13} className="flex-none animate-spin" /> : <Sparkles size={13} className="flex-none" />}
      {ai.status === "loading" && "AI sedang menganalisis foto…"}
      {ai.status === "done" && (ai.filled.length > 0 ? `AI mengisi ${ai.filled.join(", ")}. Periksa kembali.` : "Analisis AI selesai. Isian Anda tidak diubah.")}
      {ai.status === "none" && "AI tidak menemukan satwa pada foto."}
      {ai.status === "error" && "Analisis otomatis belum tersedia."}
    </span>
  );

  return (
    <section id="lapor" className="relative pb-12 pt-16">
      <Decor src="/images/branches/dry-leaf.png" width={218} height={239} sway="left top" className="-left-2 top-4 hidden w-[5.625rem] sm:block lg:-left-3 lg:top-2 lg:w-[7.3125rem]" />
      <Decor src="/images/branches/dry-leaf-2.png" width={117} height={125} sway="right top" className="-right-2 top-4 hidden w-[5.625rem] sm:block lg:-right-3 lg:top-2 lg:w-[7.3125rem]" />
      <div className="relative z-10">
        <Reveal>
          <h2 className="px-4 text-center text-3xl font-bold tracking-tight text-primary sm:text-5xl">Formulir Laporan Satwa Terdampak</h2>
        </Reveal>

        <Reveal delay={0.1}>
        <form ref={formRef} noValidate onSubmit={handleSubmit} className="mx-auto mt-6 w-[92%] max-w-[83.125rem] space-y-4 rounded-[1.25rem] bg-white/60 p-5 shadow-soft ring-1 ring-black/5 backdrop-blur-sm sm:p-6 md:w-[84%] md:p-7">
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="md:border-r md:border-ink/10 md:pr-12">
              <div>
                <FileUpload items={photos} onChange={(items) => { setPhotos(items); if (items.length > 0) setPhotoError(""); }} label="Dokumentasi" optional={false} required error={photoError} labelExtra={aiNotice ?? aiHint} />
              </div>
              <div className="mt-5">
                <AnimalInformationForm values={values} errors={errors} onChange={onChange} />
              </div>
            </div>
            <LocationPicker values={values} errors={errors} onChange={onChange} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField id="field-reporterName" label="Nama pelapor" required error={errors.reporterName}>
              <input {...fieldProps("field-reporterName", errors.reporterName)} autoComplete="name" value={values.reporterName} onChange={(e) => onChange("reporterName", e.target.value)} placeholder="Masukkan nama" className={inputClass(!!errors.reporterName)} />
            </FormField>
            <FormField id="field-phone" label="Nomor telepon/WhatsApp" required error={errors.phone}>
              <input {...fieldProps("field-phone", errors.phone)} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="08" className={inputClass(!!errors.phone)} />
            </FormField>
            <FormField id="field-email" label="Email" error={errors.email}>
              <input {...fieldProps("field-email", errors.email)} type="email" autoComplete="email" value={values.email} onChange={(e) => onChange("email", e.target.value)} placeholder="nama@email.com" className={inputClass(!!errors.email)} />
            </FormField>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/80">
              <input
                type="checkbox" checked={values.consent} aria-invalid={errors.consent ? true : undefined}
                onChange={(e) => { setValues((v) => ({ ...v, consent: e.target.checked })); if (e.target.checked) setErrors((er) => ({ ...er, consent: undefined })); }}
                className="mt-0.5 h-4 w-4 flex-none accent-[#345542]"
              />
              <span>
                Saya setuju data saya (nama, nomor telepon, email, dan lokasi) dipakai petugas untuk menindaklanjuti laporan ini. Baca <a href="/privasi" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">Kebijakan Privasi</a>.
                {errors.consent && <span role="alert" className="mt-0.5 block text-xs font-medium text-red-600">{errors.consent}</span>}
              </span>
            </label>
            {TURNSTILE_SITE_KEY && <TurnstileWidget key={captchaNonce} onToken={(t) => { setCaptchaToken(t); if (t) setCaptchaFailed(false); }} onError={() => setCaptchaFailed(true)} />}
            {submitError && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700" role="alert">{submitError}</p>}
            <p className="text-xs font-medium text-red-600" role={hasErrors ? "alert" : undefined}>
              {hasErrors ? "Periksa kembali isian yang ditandai merah." : ""}
            </p>
            <button
              type="submit" disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-70"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? "Mengirim…" : "Kirim Laporan"}
            </button>
          </div>
        </form>
        </Reveal>
      </div>

      {result && <SubmissionSuccess report={result.report} persisted={result.persisted} onClose={() => setResult(null)} />}
    </section>
  );
}
