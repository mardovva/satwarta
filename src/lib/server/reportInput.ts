// Validasi masukan laporan di SERVER. Aturan sama dengan formulir (src/lib/validateReport.ts) dan constraint database
// (supabase/schema.sql), tetapi di sini tidak bisa dilewati: browser bisa dimanipulasi, server tidak.
import { animalTypes } from "@/data/formOptions";
import { provinces } from "@/data/locations";
import { normalizePhone } from "@/lib/validateReport";

export interface ReportInput {
  animalType: string;
  animalName: string;
  count: number;
  condition: string;
  province: string;
  city: string;
  /** Patokan atau alamat tambahan; boleh kosong */
  locationDetail: string;
  lat: number;
  lng: number;
  reporterName: string;
  phone: string;
  email: string | null;
}

export type ParseResult = { ok: true; value: ReportInput } | { ok: false; errors: Record<string, string> };

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/g;
const str = (v: unknown) => (typeof v === "string" ? v.replace(CONTROL, " ").replace(/\s+/g, " ").trim() : "");
/** Angka sungguhan: bilangan, atau teks angka yang tidak kosong. null, "", true, [] dan sejenisnya menjadi NaN (bukan 0). */
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);

export function parseReportInput(raw: unknown): ParseResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const animalType = str(r.animalType);
  if (!animalTypes.includes(animalType)) errors.animalType = "Jenis satwa tidak valid.";

  const animalName = str(r.animalName);
  if (animalName.length > 80) errors.animalName = "Nama satwa maksimal 80 karakter.";

  const count = num(r.count);
  if (!Number.isInteger(count) || count < 1 || count > 9999) errors.count = "Jumlah satwa harus 1 sampai 9999.";

  const condition = str(r.condition);
  if (condition.length < 1 || condition.length > 120) errors.condition = "Kondisi satwa wajib diisi (maksimal 120 karakter).";

  const province = str(r.province);
  const city = str(r.city);
  if (!Object.prototype.hasOwnProperty.call(provinces, province)) errors.province = "Provinsi tidak valid.";
  else if (!provinces[province].includes(city)) errors.city = "Kabupaten/kota tidak sesuai dengan provinsi.";

  const locationDetail = str(r.locationDetail);
  if (locationDetail.length > 300) errors.locationDetail = "Detail lokasi maksimal 300 karakter.";

  const lat = num(r.lat);
  const lng = num(r.lng);
  if (!Number.isFinite(lat) || lat < -11.5 || lat > 6.5 || !Number.isFinite(lng) || lng < 94.5 || lng > 141.5) errors.location = "Lokasi harus berada di wilayah Indonesia.";

  const reporterName = str(r.reporterName);
  if (reporterName.length < 2 || reporterName.length > 80) errors.reporterName = "Nama pelapor 2 sampai 80 karakter.";

  const phone = normalizePhone(str(r.phone));
  if (!/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone)) errors.phone = "Nomor telepon tidak valid.";

  const emailRaw = str(r.email);
  if (emailRaw && (emailRaw.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw))) errors.email = "Format email tidak valid.";

  if (r.consent !== true) errors.consent = "Persetujuan penggunaan data wajib dicentang.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { animalType, animalName, count, condition, province, city, locationDetail, lat, lng, reporterName, phone, email: emailRaw || null } };
}

// ---------- Foto ----------
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
/** Batas badan permintaan di Vercel adalah 4,5 MB; sisakan ruang untuk data JSON. */
export const MAX_BODY_BYTES = 4_400_000;

export type ImageKind = "jpeg" | "png" | "webp";
export const IMAGE_INFO: Record<ImageKind, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
};

/** Jenis gambar dari isi berkas (bukan dari nama atau tipe yang diklaim pengunggah). */
export function detectImageKind(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}
