// Mengirim laporan ke server (POST /api/reports). Foto dikecilkan dulu di browser: batas badan permintaan di Vercel
// 4,5 MB. Mengubah gambar lewat canvas juga membuang metadata EXIF (termasuk koordinat GPS asli di foto).
import type { PhotoItem, ReportFormValues } from "@/types/report";
import { CONDITION_OTHER } from "@/data/formOptions";

const TOTAL_BUDGET = 3_600_000;
const STEPS: { side: number; quality: number }[] = [
  { side: 1600, quality: 0.82 }, { side: 1400, quality: 0.74 }, { side: 1200, quality: 0.66 }, { side: 1000, quality: 0.58 }, { side: 800, quality: 0.5 },
];

async function toJpeg(file: File, side: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); // PNG transparan -> latar putih
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", quality));
}

/** Kecilkan semua foto sampai total muat di anggaran; null bila ada foto yang tidak bisa dibaca. */
export async function compressPhotos(files: File[]): Promise<Blob[] | null> {
  try {
    for (const step of STEPS) {
      const blobs = await Promise.all(files.map((f) => toJpeg(f, step.side, step.quality)));
      if (blobs.reduce((n, b) => n + b.size, 0) <= TOTAL_BUDGET) return blobs;
    }
    return null;
  } catch { return null; }
}

export type SubmitResult = { ok: true; id: string } | { ok: false; message: string };

export async function submitReport(v: ReportFormValues, photos: PhotoItem[], captchaToken?: string | null): Promise<SubmitResult> {
  const blobs = await compressPhotos(photos.map((p) => p.file));
  if (!blobs) return { ok: false, message: "Foto tidak dapat diproses atau terlalu besar. Gunakan foto JPG, PNG, atau WebP." };

  const fd = new FormData();
  fd.append("data", JSON.stringify({
    animalType: v.animalType, animalName: v.animalName.trim(), count: Number(v.count),
    condition: v.condition === CONDITION_OTHER ? v.conditionOther.trim() : v.condition,
    province: v.province, city: v.city, locationDetail: v.locationDetail.trim(), lat: v.location?.lat, lng: v.location?.lng,
    reporterName: v.reporterName.trim(), phone: v.phone, email: v.email.trim(), consent: v.consent,
  }));
  blobs.forEach((b, i) => fd.append("photos", b, `foto-${i + 1}.jpg`));

  try {
    const res = await fetch("/api/reports", { method: "POST", body: fd, ...(captchaToken ? { headers: { "X-Turnstile-Token": captchaToken } } : {}) });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string; errors?: Record<string, string> };
    if (res.ok && data.id) return { ok: true, id: data.id };
    if (res.status === 503) return { ok: false, message: "Layanan penyimpanan laporan belum aktif. Silakan coba lagi nanti." };
    const first = data.errors ? Object.values(data.errors)[0] : "";
    return { ok: false, message: [data.error, first && first !== data.error ? first : ""].filter(Boolean).join(" ") || "Laporan belum dapat dikirim. Silakan coba lagi." };
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi." };
  }
}
