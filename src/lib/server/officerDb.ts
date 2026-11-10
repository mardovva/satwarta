// Akses database khusus petugas (SERVER). Perubahan status hanya lewat fungsi database apply_officer_action
// (satu transaksi, aturan alur dan wilayah dipaksakan di sana).
import type { StoredReport } from "@/types/report";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Officer } from "./officerAuth";
import { PHOTO_BUCKET, toOfficerReport, urlOf, type DbReportRow } from "./reportsDb";

const SELECT_OFFICER =
  "id, animal_type, animal_name, animal_count, condition, province, city, lat, lng, status, created_at, reporter_name, reporter_phone, reporter_email, handled_by, anonymized_at, location_detail, " +
  "report_history(id, status, note, officer_id, officer_name, officer_agency, created_at), report_photos(history_id, storage_path, caption)";

/** Laporan dalam wilayah kerja petugas (semua laporan untuk peran national dan admin), lengkap dengan kontak pelapor dan lokasi tepat. */
export async function listOfficerReports(officer: Officer, limit = 500): Promise<StoredReport[]> {
  const allRegions = officer.role !== "officer"; // national dan admin: semua wilayah
  if (!allRegions && officer.regions.length === 0) return [];
  let q = supabaseAdmin().from("reports").select(SELECT_OFFICER).order("created_at", { ascending: false }).limit(limit);
  if (!allRegions) q = q.in("province", officer.regions);
  const { data, error } = await q;
  if (error) throw new Error(`officer list: ${error.code ?? ""} ${error.message}`);
  return (data as unknown as DbReportRow[]).map((r) => toOfficerReport(r, urlOf));
}

export interface ReportBasics { id: string; status: string; province: string; handled_by: string | null }

export async function getReportBasics(id: string): Promise<ReportBasics | null> {
  const { data, error } = await supabaseAdmin().from("reports").select("id, status, province, handled_by").eq("id", id).maybeSingle();
  if (error) throw new Error(`basics: ${error.code ?? ""} ${error.message}`);
  return data as ReportBasics | null;
}

/** Id baris riwayat bila berhasil; null bila ditolak oleh aturan di database (lihat supabase/schema.sql, bagian 8c). */
export async function applyOfficerAction(reportId: string, officerId: string, expected: string, next: string, note: string): Promise<number | null> {
  const { data, error } = await supabaseAdmin().rpc("apply_officer_action", { p_report: reportId, p_officer: officerId, p_expected: expected, p_new: next, p_note: note });
  if (error) throw new Error(`action: ${error.code ?? ""} ${error.message}`);
  return typeof data === "number" ? data : data ? Number(data) : null;
}

export async function uploadOfficerPhoto(reportId: string, bytes: Uint8Array, mime: string, ext: string): Promise<string> {
  const path = `reports/${reportId}/officer/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error(`upload: ${error.message}`);
  return path;
}

export async function recordOfficerPhotos(reportId: string, historyId: number, paths: string[]): Promise<void> {
  const { error } = await supabaseAdmin().from("report_photos").insert(paths.map((p) => ({ report_id: reportId, history_id: historyId, storage_path: p, caption: "Dokumentasi petugas" })));
  if (error) throw new Error(`photos: ${error.code ?? ""} ${error.message}`);
}

export async function removeFiles(paths: string[]): Promise<void> {
  if (!paths.length) return;
  try { await supabaseAdmin().storage.from(PHOTO_BUCKET).remove(paths); } catch { /* abaikan */ }
}
