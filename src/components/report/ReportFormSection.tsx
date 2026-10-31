"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import Decor from "@/components/layout/Decor";
import type { PhotoItem, ReportFormErrors, ReportFormValues, StoredReport } from "@/types/report";
import { saveReport } from "@/lib/reports";
import { normalizePhone, validateReportForm } from "@/lib/validateReport";
import AnimalInformationForm from "./AnimalInformationForm";
import LocationPicker from "./LocationPicker";
import FileUpload from "./FileUpload";
import SubmissionSuccess from "./SubmissionSuccess";
import { FormField, fieldProps, inputClass } from "./FormField";

const initialValues: ReportFormValues = {
  animalType: "", animalName: "", count: "", condition: "",
  province: "", city: "", location: null,
  reporterName: "", phone: "", email: "",
};

export default function ReportFormSection() {
  const [values, setValues] = useState<ReportFormValues>(initialValues);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ report: StoredReport; persisted: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number>();
  const photosRef = useRef<PhotoItem[]>([]);
  photosRef.current = photos;

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
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus()
      );
      return;
    }
    setSubmitting(true);
    timer.current = window.setTimeout(() => {
      const loc = values.location!;
      const saved = saveReport({
        animal: { type: values.animalType, name: values.animalName.trim(), count: Number(values.count), condition: values.condition },
        location: { province: values.province, city: values.city, lat: loc.lat, lng: loc.lng },
        photos: photos.map((p) => ({ name: p.file.name, size: p.file.size, type: p.file.type })),
        reporter: { name: values.reporterName.trim(), phone: normalizePhone(values.phone), email: values.email.trim() },
      });
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setPhotos([]);
      setValues(initialValues);
      setErrors({});
      setResult(saved);
      setSubmitting(false);
    }, 1200);
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <section id="lapor" className="relative px-4 pb-44 pt-24 sm:pt-32">
      <Decor src="/images/branches/branch-leaf.png" width={505} height={262} className="-bottom-10 left-0 w-[210px] sm:w-[340px] lg:w-[420px]" />
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Formulir Laporan Satwa Terdampak</h2>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="md:border-r md:border-ink/10 md:pr-12">
              <AnimalInformationForm values={values} errors={errors} onChange={onChange} />
            </div>
            <LocationPicker values={values} errors={errors} onChange={onChange} />
          </div>

          <FileUpload items={photos} onChange={setPhotos} />

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField id="field-reporterName" label="Nama pelapor" required error={errors.reporterName}>
              <input {...fieldProps("field-reporterName", errors.reporterName)} autoComplete="name" value={values.reporterName} onChange={(e) => onChange("reporterName", e.target.value)} placeholder="Masukkan nama" className={inputClass(!!errors.reporterName)} />
            </FormField>
            <FormField id="field-phone" label="Nomor telepon/WhatsApp" required error={errors.phone}>
              <input {...fieldProps("field-phone", errors.phone)} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="08XXXXXXXXXX" className={inputClass(!!errors.phone)} />
            </FormField>
            <FormField id="field-email" label="Email (opsional)" error={errors.email}>
              <input {...fieldProps("field-email", errors.email)} type="email" autoComplete="email" value={values.email} onChange={(e) => onChange("email", e.target.value)} placeholder="nama@email.com" className={inputClass(!!errors.email)} />
            </FormField>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink/60" role={hasErrors ? "alert" : undefined}>
              {hasErrors ? "Periksa kembali isian yang ditandai merah." : "Mode demo: laporan disimpan di browser Anda dan belum dikirim ke instansi mana pun."}
            </p>
            <button
              type="submit" disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-70"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? "Mengirim…" : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>

      {result && <SubmissionSuccess report={result.report} persisted={result.persisted} onClose={() => setResult(null)} />}
    </section>
  );
}
