import type { ReportFormErrors, ReportFormValues } from "@/types/report";

export function normalizePhone(raw: string) {
  return raw.replace(/[\s\-().]/g, "");
}

export function validateReportForm(v: ReportFormValues): ReportFormErrors {
  const e: ReportFormErrors = {};
  const count = Number(v.count);
  if (!v.animalType) e.animalType = "Pilih jenis satwa.";
  if (!v.count || !Number.isInteger(count) || count < 1 || count > 9999) e.count = "Masukkan jumlah satwa (minimal 1).";
  if (!v.condition) e.condition = "Pilih kondisi satwa.";
  if (!v.province) e.province = "Pilih provinsi.";
  if (!v.city) e.city = "Pilih kabupaten/kota.";
  if (!v.location) e.location = "Tandai lokasi di peta atau gunakan lokasi Anda.";
  if (v.reporterName.trim().length < 2) e.reporterName = "Nama pelapor wajib diisi.";
  if (!/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(normalizePhone(v.phone))) e.phone = "Nomor tidak valid. Contoh: 081234567890.";
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Format email tidak valid.";
  return e;
}
