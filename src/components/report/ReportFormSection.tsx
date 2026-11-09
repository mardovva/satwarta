"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Decor from "@/components/layout/Decor";
import Reveal from "@/components/ui/Reveal";
import type { PhotoItem, ReportFormErrors, ReportFormValues, StoredReport } from "@/types/report";
import { CONDITION_OTHER } from "@/data/formOptions";
import { savePhotos } from "@/lib/photoStore";
import { shrinkImage, type Identification } from "@/lib/identifyAnimal";
import { REPORTS_UPDATED_EVENT, saveReport } from "@/lib/reports";
import { normalizePhone, validateReportForm } from "@/lib/validateReport";
import AnimalInformationForm from "./AnimalInformationForm";
import LocationPicker from "./LocationPicker";
import FileUpload from "./FileUpload";
import SubmissionSuccess from "./SubmissionSuccess";
import { FormField, fieldProps, inputClass } from "./FormField";

const initialValues: ReportFormValues = {
  animalType: "", animalName: "", count: "", condition: "", conditionOther: "",
  province: "", city: "", location: null,
  reporterName: "", phone: "", email: "",
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
  const [result, setResult] = useState<{ report: StoredReport; persisted: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number>();
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
    setSubmitting(true);
    timer.current = window.setTimeout(async () => {
      const loc = values.location!;
      const saved = saveReport({
        animal: { type: values.animalType, name: values.animalName.trim(), count: Number(values.count), condition: values.condition === CONDITION_OTHER ? values.conditionOther.trim() : values.condition },
        location: { province: values.province, city: values.city, lat: loc.lat, lng: loc.lng },
        photos: photos.map((p) => ({ name: p.file.name, size: p.file.size, type: p.file.type })),
        reporter: { name: values.reporterName.trim(), phone: normalizePhone(values.phone), email: values.email.trim() },
      });
      if (photos.length > 0) {
        await savePhotos(saved.report.id, photos.map((p) => p.file));
        // Foto baru tersimpan sekarang: minta peta memuat ulang agar marker dan popup memakai foto tersebut
        window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
      }
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setPhotos([]);
      setValues(initialValues);
      setErrors({});
      setResult(saved);
      setSubmitting(false);
    }, 1200);
  };

  const hasErrors = Object.values(errors).some(Boolean) || !!photoError;

  return (
    <section id="lapor" className="relative min-h-[100svh] pb-12 pt-16">
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
              <AnimalInformationForm values={values} errors={errors} onChange={onChange} />
              <div className="mt-5">
                <FileUpload items={photos} onChange={(items) => { setPhotos(items); if (items.length > 0) setPhotoError(""); }} label="Dokumentasi" optional={false} required error={photoError} />
                {ai.status !== "idle" && ai.status !== "off" && (
                  <p role="status" className="mt-2 flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-primary ring-1 ring-black/5">
                    {ai.status === "loading" ? <Loader2 size={14} className="mt-0.5 flex-none animate-spin" /> : <Sparkles size={14} className="mt-0.5 flex-none" />}
                    <span>
                      {ai.status === "loading" && "Menganalisis foto dengan AI (Google Gemini) untuk mengisi formulir…"}
                      {ai.status === "done" && (ai.filled.length > 0 ? `AI mengisi ${ai.filled.join(", ")} dari foto. Periksa kembali sebelum mengirim.` : "AI selesai menganalisis foto. Isian Anda tidak diubah.")}
                      {ai.status === "none" && "AI tidak menemukan satwa pada foto ini. Isi formulir secara manual."}
                      {ai.status === "error" && "Analisis foto otomatis belum tersedia. Isi formulir secara manual."}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <LocationPicker values={values} errors={errors} onChange={onChange} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField id="field-reporterName" label="Nama pelapor" required error={errors.reporterName}>
              <input {...fieldProps("field-reporterName", errors.reporterName)} autoComplete="name" value={values.reporterName} onChange={(e) => onChange("reporterName", e.target.value)} placeholder="Masukkan nama" className={inputClass(!!errors.reporterName)} />
            </FormField>
            <FormField id="field-phone" label="Nomor telepon/WhatsApp" required error={errors.phone}>
              <input {...fieldProps("field-phone", errors.phone)} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="08XXXXXXXXXX" className={inputClass(!!errors.phone)} />
            </FormField>
            <FormField id="field-email" label="Email" error={errors.email}>
              <input {...fieldProps("field-email", errors.email)} type="email" autoComplete="email" value={values.email} onChange={(e) => onChange("email", e.target.value)} placeholder="nama@email.com" className={inputClass(!!errors.email)} />
            </FormField>
          </div>

          <div className="flex flex-col gap-3">
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
