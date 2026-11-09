import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { allowShared, clientIp } from "@/lib/server/rateLimit";
import { IMAGE_INFO, MAX_BODY_BYTES, MAX_PHOTOS, MAX_PHOTO_BYTES, detectImageKind, parseReportInput } from "@/lib/server/reportInput";
import { insertReport, listPublicReports, recordPhotos, rollbackReport, uploadPhoto } from "@/lib/server/reportsDb";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const dbReady = () => { const c = supabaseConfigured(); return c.url && c.secretKey; };
const fail = (status: number, error: string, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status });

/** Daftar laporan untuk peta, statistik, donasi, dan Lacak. Tanpa kontak pelapor; koordinat dibulatkan. */
export async function GET() {
  if (!dbReady()) return NextResponse.json({ reports: [], configured: false });
  try {
    const reports = await listPublicReports();
    return NextResponse.json({ reports, configured: true }, { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } });
  } catch (e) {
    console.error("[reports GET]", e instanceof Error ? e.message : e);
    return fail(502, "Data laporan belum dapat dimuat.");
  }
}

/** Kirim laporan baru: multipart/form-data dengan kolom `data` (JSON) dan `photos` (1 sampai 8 gambar). */
export async function POST(req: Request) {
  if (!dbReady()) return fail(503, "db_off");

  if (!(await allowShared(`submit:${clientIp(req)}`, 5, 10 * 60_000))) return fail(429, "Terlalu banyak laporan dari perangkat ini. Coba lagi beberapa menit lagi.");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail(413, "Ukuran foto terlalu besar. Kecilkan foto lalu coba lagi.");

  // CAPTCHA diperiksa sebelum isi permintaan (foto) dibaca, supaya bot ditolak murah
  const captcha = await verifyTurnstile(req.headers.get("x-turnstile-token"), clientIp(req));
  if (!captcha.ok) return fail(403, captcha.reason === "missing" ? "Verifikasi keamanan belum selesai. Tunggu sebentar lalu coba lagi." : "Verifikasi keamanan gagal. Silakan coba lagi.", { captcha: true });

  let form: FormData;
  try { form = await req.formData(); } catch { return fail(400, "Permintaan tidak valid."); }

  let parsedJson: unknown;
  try { parsedJson = JSON.parse(String(form.get("data") ?? "")); } catch { return fail(400, "Data laporan tidak valid."); }
  const parsed = parseReportInput(parsedJson);
  if (!parsed.ok) return fail(422, "Data laporan belum lengkap atau tidak valid.", { errors: parsed.errors });

  const files = form.getAll("photos").filter((f): f is File => typeof f !== "string");
  if (files.length < 1) return fail(422, "Unggah minimal satu foto dokumentasi.", { errors: { photos: "Foto wajib." } });
  if (files.length > MAX_PHOTOS) return fail(422, `Maksimal ${MAX_PHOTOS} foto.`, { errors: { photos: "Terlalu banyak foto." } });

  // Baca dan periksa isi setiap foto sebelum menyimpan apa pun
  const photos: { bytes: Uint8Array; mime: string; ext: string }[] = [];
  let total = 0;
  for (const f of files) {
    if (f.size > MAX_PHOTO_BYTES) return fail(422, "Salah satu foto lebih dari 5 MB.", { errors: { photos: "Foto terlalu besar." } });
    const bytes = new Uint8Array(await f.arrayBuffer());
    total += bytes.length;
    const kind = detectImageKind(bytes);
    if (!kind) return fail(422, "Berkas harus berupa gambar JPG, PNG, atau WebP.", { errors: { photos: "Format foto tidak didukung." } });
    photos.push({ bytes, ...IMAGE_INFO[kind] });
  }
  if (total > MAX_BODY_BYTES) return fail(413, "Ukuran total foto terlalu besar. Kecilkan foto lalu coba lagi.");

  let id = "";
  const uploaded: string[] = [];
  try {
    id = await insertReport(parsed.value);
    for (const p of photos) uploaded.push(await uploadPhoto(id, p.bytes, p.mime, p.ext));
    await recordPhotos(id, uploaded);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    console.error("[reports POST]", e instanceof Error ? e.message : e);
    if (id) await rollbackReport(id, uploaded);
    return fail(500, "Laporan belum dapat disimpan. Silakan coba lagi.");
  }
}
