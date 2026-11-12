import { NextResponse } from "next/server";
import { workflow } from "@/data/officerWorkflow";
import { allowShared } from "@/lib/server/rateLimit";
import { IMAGE_INFO, MAX_BODY_BYTES, MAX_PHOTOS, MAX_PHOTO_BYTES, detectImageKind } from "@/lib/server/reportInput";
import { authenticateOfficer } from "@/lib/server/officerAuth";
import { applyOfficerAction, getReportBasics, recordOfficerPhotos, removeFiles, uploadOfficerPhoto } from "@/lib/server/officerDb";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "no-store" };
const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: NO_STORE });
// eslint-disable-next-line no-control-regex
const clean = (v: unknown) => (typeof v === "string" ? v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ").trim() : "");

/**
 * Tindakan petugas pada satu laporan: multipart dengan kolom `data` (JSON {to, note}) dan `photos` (opsional, wajib untuk "Selesai").
 * Server memeriksa wilayah kerja, penanggung jawab, dan alur status; database memeriksa ulang dalam satu transaksi.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateOfficer(req);
  if ("error" in auth) return fail(auth.status, auth.error);
  const { officer } = auth;

  if (!(await allowShared(`act:${officer.id}`, 60, 10 * 60_000))) return fail(429, "Terlalu banyak tindakan dalam waktu singkat. Coba lagi sebentar lagi.");
  const id = (await params).id.toUpperCase();
  if (!/^SWT-\d{4}-\d{4}$/.test(id)) return fail(404, "Laporan tidak ditemukan.");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail(413, "Ukuran foto terlalu besar. Kecilkan foto lalu coba lagi.");

  let form: FormData;
  try { form = await req.formData(); } catch { return fail(400, "Permintaan tidak valid."); }
  let body: { to?: unknown; note?: unknown };
  try { body = JSON.parse(String(form.get("data") ?? "")); } catch { return fail(400, "Data tindakan tidak valid."); }
  const to = clean(body?.to);
  const note = clean(body?.note);
  if (note.length < 3) return fail(422, "Catatan wajib diisi (minimal 3 karakter).");
  if (note.length > 500) return fail(422, "Catatan maksimal 500 karakter.");

  let basics;
  try { basics = await getReportBasics(id); } catch (e) { console.error("[aksi]", e instanceof Error ? e.message : e); return fail(502, "Laporan belum dapat dimuat."); }
  if (!basics) return fail(404, "Laporan tidak ditemukan.");

  if (officer.role === "officer" && !officer.regions.includes(basics.province)) return fail(403, "Laporan ini di luar wilayah kerja Anda.");
  if (officer.role !== "admin" && basics.handled_by && basics.handled_by !== officer.id) return fail(403, "Laporan ini ditangani petugas lain.");

  const allowed = (workflow as Record<string, { to: string; requirePhoto?: boolean }[]>)[basics.status] ?? [];
  const action = allowed.find((a) => a.to === to);
  if (!action) return fail(422, "Tindakan ini tidak diizinkan pada status laporan saat ini.");

  const files = form.getAll("photos").filter((f): f is File => typeof f !== "string");
  if (files.length > MAX_PHOTOS) return fail(422, `Maksimal ${MAX_PHOTOS} foto.`);
  if (action.requirePhoto && files.length === 0) return fail(422, "Unggah minimal satu foto bukti penanganan.");

  const photos: { bytes: Uint8Array; mime: string; ext: string }[] = [];
  let total = 0;
  for (const f of files) {
    if (f.size > MAX_PHOTO_BYTES) return fail(422, "Salah satu foto lebih dari 5 MB.");
    const bytes = new Uint8Array(await f.arrayBuffer());
    total += bytes.length;
    const kind = detectImageKind(bytes);
    if (!kind) return fail(422, "Berkas harus berupa gambar JPG, PNG, atau WebP.");
    photos.push({ bytes, ...IMAGE_INFO[kind] });
  }
  if (total > MAX_BODY_BYTES) return fail(413, "Ukuran total foto terlalu besar. Kecilkan foto lalu coba lagi.");

  const uploaded: string[] = [];
  try {
    for (const p of photos) uploaded.push(await uploadOfficerPhoto(id, p.bytes, p.mime, p.ext)); // foto dulu: status tidak berubah bila unggahan gagal
    const historyId = await applyOfficerAction(id, officer.id, basics.status, to, note);
    if (historyId === null) {
      await removeFiles(uploaded);
      return fail(409, "Status laporan sudah berubah atau laporan ditangani petugas lain. Muat ulang halaman.");
    }
    let photosSaved = true;
    if (uploaded.length) {
      try { await recordOfficerPhotos(id, historyId, uploaded); } catch (e) { photosSaved = false; console.error("[aksi foto]", e instanceof Error ? e.message : e); }
    }
    return NextResponse.json({ ok: true, status: to, historyId, photosSaved }, { headers: NO_STORE });
  } catch (e) {
    console.error("[aksi]", e instanceof Error ? e.message : e);
    await removeFiles(uploaded);
    return fail(500, "Tindakan belum dapat disimpan. Silakan coba lagi.");
  }
}
