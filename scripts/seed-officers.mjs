#!/usr/bin/env node
// Membuat akun petugas untuk 15 lembaga di halaman Lembaga (12 regional + 3 nasional) sekaligus.
//
// Pakai (dari folder proyek, setelah migrasi 003 dijalankan):
//   node scripts/seed-officers.mjs --email-base=namaanda@gmail.com
//
// Email tiap akun dibuat dari email Anda dengan alias "+": namaanda+bksda-kalbar@gmail.com, dst.
// Semua surel tetap masuk ke kotak masuk Anda, dan domain-nya nyata (Supabase menolak domain contoh/uji).
// Kata sandi dibuat acak per akun dan HANYA ditulis ke officer-accounts.csv (otomatis ditambahkan ke .gitignore).
// Aman dijalankan ulang: akun yang sudah ada tidak diubah (kecuali memakai --reset-passwords).
//
// Pilihan: --dry-run (hanya tampilkan rencana)   --reset-passwords (buat ulang kata sandi SEMUA akun ini)

import { createClient } from "@supabase/supabase-js";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";

// Nama provinsi PERSIS seperti di formulir laporan (src/data/locations.ts). Jakarta di formulir: "Daerah Khusus Ibukota Jakarta".
const PROVINCES = new Set(["Aceh", "Bali", "Banten", "Bengkulu", "Daerah Istimewa Yogyakarta", "Daerah Khusus Ibukota Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"]);

const AGENCIES = [
  // --- regional: hanya melihat dan menangani laporan di provinsinya ---
  { slug: "bksda-kalbar", agency: "BKSDA Kalimantan Barat", role: "officer", regions: ["Kalimantan Barat"] },
  { slug: "yiari-ketapang", agency: "YIARI Ketapang", role: "officer", regions: ["Kalimantan Barat"] },
  { slug: "bksda-kalteng", agency: "BKSDA Kalimantan Tengah", role: "officer", regions: ["Kalimantan Tengah"] },
  { slug: "bosf", agency: "BOS Foundation", role: "officer", regions: ["Kalimantan Tengah", "Kalimantan Timur"] },
  { slug: "ofi", agency: "Orangutan Foundation International", role: "officer", regions: ["Kalimantan Tengah"] },
  { slug: "bksda-kaltim", agency: "BKSDA Kalimantan Timur", role: "officer", regions: ["Kalimantan Timur"] },
  { slug: "bksda-jakarta", agency: "BKSDA Jakarta", role: "officer", regions: ["Daerah Khusus Ibukota Jakarta"] },
  { slug: "pps-tegal-alur", agency: "PPS Tegal Alur", role: "officer", regions: ["Daerah Khusus Ibukota Jakarta"] },
  { slug: "yiari-bogor", agency: "YIARI Bogor", role: "officer", regions: ["Jawa Barat"] },
  { slug: "alobi-babel", agency: "Alobi Foundation (PPS Bangka Belitung)", role: "officer", regions: ["Kepulauan Bangka Belitung"] },
  { slug: "aspinall-sumsel", agency: "The Aspinall Foundation (PPS Sumatera Selatan)", role: "officer", regions: ["Sumatera Selatan"] },
  { slug: "yel-socp", agency: "YEL-SOCP", role: "officer", regions: ["Sumatera Utara"] },
  // --- nasional: melihat dan menangani laporan di semua wilayah ---
  { slug: "ditjen-ksdae", agency: "Ditjen KSDAE, Kementerian Kehutanan", role: "national", regions: [] },
  { slug: "polri-110", agency: "Polri (Call Center 110)", role: "national", regions: [] },
  { slug: "posko-karhutla", agency: "Posko Karhutla Kemenhut (Manggala Agni)", role: "national", regions: [] },
];
const FULL_NAME = "Tim Penanganan Satwa";
const CSV = "officer-accounts.csv";
const BLOCKED = new Set(["test", "example", "invalid", "local", "localhost", "test.com", "example.com", "example.net", "example.org"]);

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.length ? v.join("=") : true]; }));
const die = (msg) => { console.error("\n" + msg + "\n"); process.exit(1); };

// ---- konfigurasi ----
function loadEnv() {
  const env = { ...process.env };
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}
const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) die("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY tidak ditemukan. Jalankan dari folder proyek (yang berisi .env.local).");

const base = typeof args["email-base"] === "string" ? args["email-base"].trim().toLowerCase() : "";
const m = /^([^@\s+]+)@([^@\s]+\.[^@\s]+)$/.exec(base);
if (!m) die("Berikan email dasar Anda, contoh:\n  node scripts/seed-officers.mjs --email-base=namaanda@gmail.com\n(email dasar tidak boleh memuat tanda +)");
const [, local, domain] = m;
if (BLOCKED.has(domain) || BLOCKED.has(domain.split(".").pop())) die("Supabase menolak domain contoh/uji. Pakai email dengan domain nyata, mis. Gmail.");

for (const a of AGENCIES) for (const r of a.regions) if (!PROVINCES.has(r)) die(`Nama provinsi tidak dikenal untuk ${a.slug}: ${r}`);

const emailOf = (slug) => `${local}+${slug}@${domain}`;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // tanpa karakter yang mudah tertukar (0 O 1 l I)
function newPassword() {
  for (;;) {
    const raw = Array.from({ length: 16 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    if (/[A-Za-z]/.test(raw) && /[0-9]/.test(raw)) return raw.match(/.{4}/g).join("-");
  }
}

if (args["dry-run"]) {
  console.log(`RENCANA (tanpa perubahan). Email dasar: ${base}\n`);
  for (const a of AGENCIES) console.log(`${a.role === "national" ? "nasional " : "regional "}${emailOf(a.slug).padEnd(46)} ${a.agency}  [${a.role === "national" ? "semua wilayah" : a.regions.join(", ")}]`);
  console.log(`\nTotal ${AGENCIES.length} akun.`);
  process.exit(0);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// ---- pemeriksaan awal: migrasi 003 sudah dijalankan? ----
{
  const { error } = await db.from("officers").select("active").limit(1);
  if (error) die("Tabel officers belum siap (kolom 'active' tidak ada). Jalankan supabase/migrations/003_admin_officers.sql di SQL Editor Supabase dulu.\nDetail: " + error.message);
}

// ---- akun yang sudah ada ----
const existing = new Map();
{
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) die("Tidak dapat membaca daftar akun: " + error.message);
  for (const u of data.users) existing.set((u.email || "").toLowerCase(), u.id);
}

// ---- kata sandi lama dari CSV (agar tidak hilang bila skrip dijalankan ulang) ----
const csvQ = (v) => `"${String(v).replace(/"/g, '""')}"`;
const oldPw = new Map();
if (existsSync(CSV)) {
  for (const line of readFileSync(CSV, "utf8").split("\n").slice(1)) {
    const mm = /^"([^"]*)","([^"]*)"/.exec(line);
    if (mm) oldPw.set(mm[1], mm[2]);
  }
}

const rows = [];
let created = 0, kept = 0, reset = 0, failed = 0;
for (const a of AGENCIES) {
  const email = emailOf(a.slug);
  let id = existing.get(email);
  let password;
  try {
    if (!id) {
      password = newPassword();
      const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
      if (error || !data.user) throw new Error(error?.message || "akun tidak terbentuk");
      id = data.user.id; created++;
    } else if (args["reset-passwords"]) {
      password = newPassword();
      const { error } = await db.auth.admin.updateUserById(id, { password });
      if (error) throw new Error(error.message);
      reset++;
    } else {
      password = oldPw.get(email) || "(tidak diubah)"; kept++;
    }
    const { error: upErr } = await db.from("officers").upsert({ id, full_name: FULL_NAME, agency: a.agency, role: a.role, regions: a.regions, active: true }, { onConflict: "id" });
    if (upErr) throw new Error(upErr.message);
    await db.from("officer_audit").insert({ actor_name: "Skrip seed", action: existing.has(email) ? "update" : "create", target_id: id, target_label: email, details: { agency: a.agency, role: a.role, regions: a.regions } });
    rows.push({ email, password, agency: a.agency, role: a.role, regions: a.regions });
  } catch (e) {
    failed++; console.error(`GAGAL ${email}: ${e.message}`);
  }
}

// ---- tulis CSV (kata sandi hanya di sini) dan pastikan tidak ikut ter-commit ----
if (rows.length) {
  const header = "email,kata_sandi,instansi,peran,wilayah";
  const body = rows.map((r) => [r.email, r.password, r.agency, r.role === "national" ? "nasional" : "regional", r.role === "national" ? "semua wilayah" : r.regions.join("; ")].map(csvQ).join(","));
  writeFileSync(CSV, [header, ...body].join("\n") + "\n", { mode: 0o600 });
  const ignore = existsSync(".gitignore") ? readFileSync(".gitignore", "utf8") : "";
  if (!ignore.split("\n").some((l) => l.trim() === CSV)) appendFileSync(".gitignore", `${ignore.endsWith("\n") || !ignore ? "" : "\n"}\n# kata sandi akun petugas (dibuat scripts/seed-officers.mjs): JANGAN di-commit\n${CSV}\n`);
}

console.log(`\nSelesai. Dibuat: ${created}, sudah ada (tidak diubah): ${kept}, kata sandi direset: ${reset}, gagal: ${failed}.`);
if (rows.length) console.log(`Daftar email dan kata sandi ada di ${CSV} (hanya di komputer ini; jangan dibagikan atau di-commit).`);
process.exit(failed ? 1 : 0);

