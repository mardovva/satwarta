// Akses database donasi (SERVER). Yang keluar ke publik hanya donasi berstatus 'paid'; nama donatur anonim tidak pernah ikut keluar.
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Pledge } from "@/lib/donations";

export const PLEDGE_METHODS = ["QRIS", "Transfer Bank (Virtual Account)", "E-Wallet"] as const;
export const PLEDGE_MIN = 10_000;
export const PLEDGE_MAX = 100_000_000;

export interface PledgeInput { reportId: string; amount: number; name: string; anonymous: boolean; message: string; method: string }

interface Row { code: string; report_id: string; amount: number; donor_name: string; anonymous: boolean; message: string; method: string; created_at: string }
const COLUMNS = "code, report_id, amount, donor_name, anonymous, message, method, created_at";

const toPledge = (r: Row): Pledge => ({
  code: r.code, reportId: r.report_id, amount: r.amount,
  name: r.anonymous ? "" : r.donor_name, anonymous: r.anonymous,
  ...(r.message ? { message: r.message } : {}), ...(r.method ? { method: r.method } : {}),
  at: new Date(r.created_at).toISOString(),
});

export async function listPublicPledges(limit = 1000): Promise<Pledge[]> {
  const { data, error } = await supabaseAdmin().from("pledges").select(COLUMNS).eq("status", "paid").order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`list: ${error.code ?? ""} ${error.message}`);
  return (data as unknown as Row[]).map(toPledge);
}

/** "ok" bila laporan ada dan penggalangannya masih berjalan; "closed" bila ditolak atau sudah selesai. */
export async function reportPledgeState(id: string): Promise<"ok" | "closed" | "missing"> {
  const { data, error } = await supabaseAdmin().from("reports").select("status").eq("id", id).maybeSingle();
  if (error) throw new Error(`report: ${error.code ?? ""} ${error.message}`);
  if (!data) return "missing";
  return data.status === "Rejected" || data.status === "Resolved" ? "closed" : "ok";
}

/** Simpan donasi. Pembayaran masih simulasi, jadi langsung 'paid'. Kodenya (DNS-XXXXXXXX) dibuat database. */
export async function insertPledge(i: PledgeInput): Promise<Pledge> {
  const { data, error } = await supabaseAdmin().from("pledges").insert({
    report_id: i.reportId, amount: i.amount, donor_name: i.anonymous ? "" : i.name, anonymous: i.anonymous,
    message: i.message, method: i.method, status: "paid",
  }).select(COLUMNS).single();
  if (error || !data) throw new Error(`insert: ${error?.code ?? ""} ${error?.message ?? "kosong"}`);
  return toPledge(data as unknown as Row);
}
