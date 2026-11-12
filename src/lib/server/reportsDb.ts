// Akses database laporan (SERVER). Menjaga bentuk data ke publik: kontak pelapor tidak pernah ikut keluar,
// dan koordinat dibulatkan agar lokasi pasti satwa (terutama yang dilindungi) tidak terbuka untuk umum.
import type { StoredReport, StatusHistoryEntry, TrackingStatus } from "@/types/report";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ReportInput } from "./reportInput";

export const PHOTO_BUCKET = "report-photos";
/** 2 desimal = sekitar 1 km. Lokasi tepat hanya untuk petugas (Tahap 2). */
export const PUBLIC_COORD_DECIMALS = 2;

export interface DbHistoryRow { id: number; status: TrackingStatus; note: string; officer_id?: string | null; officer_name: string | null; officer_agency: string | null; created_at: string }
export interface DbPhotoRow { history_id: number | null; storage_path: string; caption: string }
export interface DbReportRow {
  id: string; animal_type: string; animal_name: string; animal_count: number; condition: string; province: string; city: string;
  lat: number; lng: number; status: TrackingStatus; created_at: string;
  /** Hanya ada pada kueri petugas */
  reporter_name?: string; reporter_phone?: string; reporter_email?: string | null; handled_by?: string | null; anonymized_at?: string | null; location_detail?: string;
  report_history: DbHistoryRow[]; report_photos: DbPhotoRow[];
}

const round = (n: number) => { const f = 10 ** PUBLIC_COORD_DECIMALS; return Math.round(n * f) / f; };
const iso = (s: string) => new Date(s).toISOString();

type View = "public" | "officer";

/**
 * Baris database -> bentuk StoredReport yang dipakai seluruh tampilan.
 *  - "public": TANPA kontak pelapor, koordinat dibulatkan.
 *  - "officer": kontak pelapor dan koordinat tepat; officer.username berisi ID akun petugas (untuk mengenali penanggung jawab).
 */
function toReport(row: DbReportRow, photoUrl: (path: string) => string, view: View): StoredReport {
  const hist = [...row.report_history].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
  const photosOf = (hid: number | null) =>
    row.report_photos.filter((p) => p.history_id === hid).map((p) => ({ url: photoUrl(p.storage_path), caption: p.caption || (hid === null ? "Foto dari pelapor" : "Dokumentasi petugas") }));
  const officerView = view === "officer";

  const history: StatusHistoryEntry[] = hist.map((h, i) => {
    const photos = [...(i === 0 ? photosOf(null) : []), ...photosOf(h.id)]; // foto pelapor melekat pada langkah pertama
    return {
      status: h.status, at: iso(h.created_at), note: h.note,
      ...(photos.length ? { photos } : {}),
      ...(h.officer_name ? { officer: { username: officerView ? h.officer_id ?? "" : "", name: h.officer_name, agency: h.officer_agency ?? "" } } : {}),
    };
  });

  return {
    id: row.id, createdAt: iso(row.created_at), status: row.status,
    animal: { type: row.animal_type, name: row.animal_name, count: row.animal_count, condition: row.condition },
    location: {
      province: row.province, city: row.city, lat: officerView ? row.lat : round(row.lat), lng: officerView ? row.lng : round(row.lng),
      ...(officerView && row.location_detail ? { detail: row.location_detail } : {}), // detail lokasi: hanya untuk petugas
    },
    photos: [],
    // laporan yang sudah dianonimkan (lihat supabase/schema.sql 8e): nama tampil "Dianonimkan", tanpa telepon dan email
    reporter: officerView ? (row.anonymized_at ? { name: row.reporter_name ?? "Dianonimkan", phone: "", email: "" } : { name: row.reporter_name ?? "", phone: row.reporter_phone ?? "", email: row.reporter_email ?? "" }) : { name: "", phone: "", email: "" },
    history,
  };
}

export const toPublicReport = (row: DbReportRow, photoUrl: (path: string) => string) => toReport(row, photoUrl, "public");
export const toOfficerReport = (row: DbReportRow, photoUrl: (path: string) => string) => toReport(row, photoUrl, "officer");

const SELECT =
  "id, animal_type, animal_name, animal_count, condition, province, city, lat, lng, status, created_at, " +
  "report_history(id, status, note, officer_name, officer_agency, created_at), report_photos(history_id, storage_path, caption)";

export const urlOf = (path: string) => supabaseAdmin().storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;

export async function listPublicReports(limit = 300): Promise<StoredReport[]> {
  const { data, error } = await supabaseAdmin().from("reports").select(SELECT).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`list: ${error.code ?? ""} ${error.message}`);
  return (data as unknown as DbReportRow[]).map((r) => toPublicReport(r, urlOf));
}

export async function getPublicReport(id: string): Promise<StoredReport | null> {
  const { data, error } = await supabaseAdmin().from("reports").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`get: ${error.code ?? ""} ${error.message}`);
  return data ? toPublicReport(data as unknown as DbReportRow, urlOf) : null;
}

/** Simpan laporan baru; mengembalikan ID yang dibuat database (SWT-TAHUN-NNNN). Riwayat awal dibuat oleh trigger. */
export async function insertReport(i: ReportInput): Promise<string> {
  const { data, error } = await supabaseAdmin().from("reports").insert({
    animal_type: i.animalType, animal_name: i.animalName, animal_count: i.count, condition: i.condition,
    province: i.province, city: i.city, location_detail: i.locationDetail, lat: i.lat, lng: i.lng,
    reporter_name: i.reporterName, reporter_phone: i.phone, reporter_email: i.email, consent: true,
  }).select("id").single();
  if (error || !data) throw new Error(`insert: ${error?.code ?? ""} ${error?.message ?? "kosong"}`);
  return data.id as string;
}

export async function uploadPhoto(reportId: string, bytes: Uint8Array, mime: string, ext: string): Promise<string> {
  const path = `reports/${reportId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error(`upload: ${error.message}`);
  return path;
}

export async function recordPhotos(reportId: string, paths: string[]): Promise<void> {
  const { error } = await supabaseAdmin().from("report_photos").insert(paths.map((p) => ({ report_id: reportId, history_id: null, storage_path: p, caption: "Foto dari pelapor" })));
  if (error) throw new Error(`photos: ${error.code ?? ""} ${error.message}`);
}

/** Pembersihan bila pengiriman gagal di tengah jalan: hapus berkas dan laporannya (riwayat dan foto ikut terhapus berantai). */
export async function rollbackReport(reportId: string, paths: string[]): Promise<void> {
  const db = supabaseAdmin();
  try { if (paths.length) await db.storage.from(PHOTO_BUCKET).remove(paths); } catch { /* abaikan */ }
  try { await db.from("reports").delete().eq("id", reportId); } catch { /* abaikan */ }
}

