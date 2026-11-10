-- =====================================================================================================
-- SATWARTA: skema database untuk Supabase (PostgreSQL)
--
-- Cara memakai:
--   Supabase Dashboard > SQL Editor > New query > tempel SELURUH isi file ini > Run.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / OR REPLACE), jadi tidak merusak data yang sudah ada.
--
-- Prinsip keamanan (penting):
--   * Semua tabel memakai Row Level Security (RLS) TANPA policy untuk pengunjung (anon/authenticated).
--     Artinya: dari browser, tabel tidak bisa dibaca atau ditulis sama sekali, walaupun kunci publik bocor.
--   * Semua akses data lewat server Next.js (API route) memakai SECRET KEY, yang melewati RLS.
--     Server-lah yang memeriksa siapa boleh melakukan apa dan memvalidasi isian.
--   * Data kontak pelapor (nama, telepon, email) tidak pernah dikirim ke publik: server hanya mengirim kolom aman.
-- =====================================================================================================

-- 1. PETUGAS -----------------------------------------------------------------------------------------
-- Satu baris per akun petugas. Akunnya dibuat di Authentication > Users; baris ini menambah peran dan wilayah kerja.
create table if not exists public.officers (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 1 and 80),
  agency      text not null check (char_length(agency) between 1 and 120),
  role        text not null default 'officer' check (role in ('officer', 'national', 'admin')),   -- national = lembaga pusat, semua wilayah
  active      boolean not null default true,                                                       -- false = dinonaktifkan
  regions     text[] not null default '{}',            -- provinsi wilayah kerja, mis. {'Riau','Jambi'}
  created_at  timestamptz not null default now()
);

-- 2. NOMOR LAPORAN -----------------------------------------------------------------------------------
-- ID berbentuk SWT-TAHUN-NNNN, dibuat oleh database agar tidak ada nomor ganda walau dua orang melapor bersamaan.
create table if not exists public.report_counters (
  year        integer primary key,
  last_value  integer not null default 0
);

create or replace function public.next_report_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y integer := extract(year from (now() at time zone 'Asia/Jakarta'))::integer;
  n integer;
begin
  insert into public.report_counters as c (year, last_value) values (y, 1)
  on conflict (year) do update set last_value = c.last_value + 1
  returning c.last_value into n;
  return 'SWT-' || y::text || '-' || lpad(n::text, 4, '0');
end;
$$;

-- 3. LAPORAN -----------------------------------------------------------------------------------------
create table if not exists public.reports (
  id              text primary key default public.next_report_id(),
  animal_type     text not null check (animal_type in ('Mamalia', 'Burung', 'Reptil', 'Amfibi', 'Lainnya', 'Tidak diketahui')),
  animal_name     text not null default '' check (char_length(animal_name) <= 80),
  animal_count    integer not null check (animal_count between 1 and 9999),
  condition       text not null check (char_length(condition) between 1 and 120),
  province        text not null check (char_length(province) between 1 and 60),
  city            text not null check (char_length(city) between 1 and 80),
  location_detail text not null default '' check (char_length(location_detail) <= 300),   -- patokan/alamat tambahan dari pelapor; hanya untuk petugas
  lat             double precision not null check (lat between -11.5 and 6.5),
  lng             double precision not null check (lng between 94.5 and 141.5),
  reporter_name   text not null check (char_length(reporter_name) between 1 and 80),
  reporter_phone  text not null check (char_length(reporter_phone) between 5 and 20),
  reporter_email  text check (reporter_email is null or char_length(reporter_email) <= 120),
  status          text not null default 'Submitted'
                  check (status in ('Submitted', 'Under Review', 'Verified', 'In Progress', 'Resolved', 'Rejected')),
  handled_by      uuid references public.officers (id) on delete set null,   -- petugas pertama yang menindaklanjuti
  consent         boolean not null default false,                            -- pelapor menyetujui penggunaan datanya
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists reports_province_idx on public.reports (province);
create index if not exists reports_status_idx   on public.reports (status);
create index if not exists reports_created_idx  on public.reports (created_at desc);

-- 4. RIWAYAT STATUS ----------------------------------------------------------------------------------
create table if not exists public.report_history (
  id              bigint generated always as identity primary key,
  report_id       text not null references public.reports (id) on delete cascade,
  status          text not null check (status in ('Submitted', 'Under Review', 'Verified', 'In Progress', 'Resolved', 'Rejected')),
  note            text not null default '' check (char_length(note) <= 1000),
  officer_id      uuid references public.officers (id) on delete set null,
  officer_name    text,
  officer_agency  text,
  created_at      timestamptz not null default now()
);
create index if not exists report_history_report_idx on public.report_history (report_id, created_at);

-- 5. FOTO --------------------------------------------------------------------------------------------
-- File fotonya ada di Storage (bucket report-photos); tabel ini hanya mencatat lokasinya.
-- history_id kosong = foto dari pelapor; terisi = foto tindakan petugas pada langkah riwayat tersebut.
create table if not exists public.report_photos (
  id            uuid primary key default gen_random_uuid(),
  report_id     text not null references public.reports (id) on delete cascade,
  history_id    bigint references public.report_history (id) on delete cascade,
  storage_path  text not null unique,
  caption       text not null default '' check (char_length(caption) <= 200),
  created_at    timestamptz not null default now()
);
create index if not exists report_photos_report_idx on public.report_photos (report_id);

-- 6. DONASI (dipakai pada tahap pembayaran) ----------------------------------------------------------
create table if not exists public.pledges (
  code        text primary key default ('DNS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  report_id   text not null references public.reports (id) on delete cascade,
  amount      integer not null check (amount between 10000 and 100000000),
  donor_name  text not null default '' check (char_length(donor_name) <= 60),
  anonymous   boolean not null default false,
  message     text not null default '' check (char_length(message) <= 200),
  method      text not null default '' check (char_length(method) <= 60),
  status      text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at  timestamptz not null default now()
);
create index if not exists pledges_report_idx on public.pledges (report_id);

-- 7. PEMICU OTOMATIS ---------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- Setiap laporan baru otomatis punya langkah pertama "Terkirim" di riwayat.
create or replace function public.log_initial_status()
returns trigger language plpgsql as $$
begin
  insert into public.report_history (report_id, status, note) values (new.id, 'Submitted', 'Laporan berhasil dikirim.');
  return new;
end;
$$;

drop trigger if exists reports_log_initial_status on public.reports;
create trigger reports_log_initial_status after insert on public.reports
  for each row execute function public.log_initial_status();

-- 8. KEAMANAN: RLS AKTIF, TANPA AKSES DARI BROWSER ----------------------------------------------------
alter table public.officers        enable row level security;
alter table public.report_counters enable row level security;
alter table public.reports         enable row level security;
alter table public.report_history  enable row level security;
alter table public.report_photos   enable row level security;
alter table public.pledges         enable row level security;

-- Cabut hak bawaan Supabase untuk pengunjung (anon) dan pengguna masuk (authenticated).
-- Catatan: bila nanti membuat tabel baru, ulangi langkah RLS, pencabutan hak, dan pemberian izin service_role untuk tabel itu.
revoke all on public.officers, public.report_counters, public.reports, public.report_history, public.report_photos, public.pledges
  from anon, authenticated;
revoke all on function public.next_report_id() from public, anon, authenticated;

-- 8b. HAK AKSES UNTUK SERVER (service_role) ------------------------------------------------------------
-- Sejak 2026, Supabase TIDAK lagi memberi hak akses otomatis ke tabel baru di schema public, bahkan untuk secret key:
-- service_role melewati RLS, tetapi tetap membutuhkan GRANT. Tanpa baris-baris ini server menerima galat 42501
-- "permission denied for table ...". Hak diberikan seperlunya saja, dan hanya untuk service_role (server kita).
-- anon dan authenticated tetap tidak punya hak apa pun.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.officers, public.reports, public.report_history, public.report_photos, public.pledges to service_role;
grant select on public.report_counters to service_role;          -- penghitung diubah oleh fungsi next_report_id(), bukan langsung
grant usage, select on sequence public.report_history_id_seq to service_role;
grant execute on function public.next_report_id() to service_role;

-- 8c. TINDAKAN PETUGAS (dipaksakan di database) -------------------------------------------------------
-- Satu-satunya jalan mengubah status laporan. Berjalan dalam SATU transaksi dengan kunci baris (FOR UPDATE), sehingga
-- dua petugas yang bertindak bersamaan tidak bisa saling menimpa: yang pertama berhasil, yang kedua ditolak.
-- Mengembalikan id baris riwayat bila berhasil, atau NULL bila ditolak karena salah satu aturan ini dilanggar:
--   * laporan atau petugas tidak ditemukan
--   * status laporan saat ini bukan p_expected (sudah diubah petugas lain)
--   * perpindahan status tidak termasuk alur yang diizinkan
--   * akun petugas dinonaktifkan
--   * petugas berperan 'officer' bertindak di luar wilayah kerjanya (peran 'national' dan 'admin' berwenang di semua wilayah)
--   * laporan sudah ditangani petugas lain (petugas pertama yang bertindak menjadi penanggung jawab; admin boleh menimpa)
create or replace function public.apply_officer_action(
  p_report text, p_officer uuid, p_expected text, p_new text, p_note text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  o   public.officers%rowtype;
  r   public.reports%rowtype;
  hid bigint;
begin
  select * into o from public.officers where id = p_officer;
  if not found or not o.active then return null; end if;

  select * into r from public.reports where id = p_report for update;
  if not found then return null; end if;

  if r.status <> p_expected then return null; end if;

  if not exists (
    select 1 from (values
      ('Submitted', 'Under Review'), ('Under Review', 'Verified'), ('Under Review', 'Rejected'),
      ('Verified', 'In Progress'), ('In Progress', 'In Progress'), ('In Progress', 'Resolved')
    ) as t(a, b) where t.a = p_expected and t.b = p_new
  ) then return null; end if;

  if o.role = 'officer' and not (r.province = any (o.regions)) then return null; end if;
  if o.role <> 'admin' and r.handled_by is not null and r.handled_by <> p_officer then return null; end if;

  if char_length(coalesce(p_note, '')) < 3 or char_length(p_note) > 500 then return null; end if;

  update public.reports set status = p_new, handled_by = coalesce(handled_by, p_officer) where id = p_report;

  insert into public.report_history (report_id, status, note, officer_id, officer_name, officer_agency)
  values (p_report, p_new, p_note, p_officer, o.full_name, o.agency)
  returning id into hid;

  return hid;
end;
$$;

revoke all on function public.apply_officer_action(text, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_officer_action(text, uuid, text, text, text) to service_role;

-- 8d. LOG AUDIT PENGELOLAAN PETUGAS --------------------------------------------------------------------
-- Dicatat server setiap admin menambah, mengubah, menonaktifkan, atau menghapus akun petugas. Tidak memakai foreign key
-- ke akun yang dituju agar jejaknya tetap ada setelah akun itu dihapus. Tidak pernah memuat kata sandi.
create table if not exists public.officer_audit (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  actor_id     uuid references auth.users (id) on delete set null,
  actor_name   text not null,
  action       text not null check (action in ('create', 'update', 'reset_password', 'deactivate', 'reactivate', 'delete')),
  target_id    uuid,
  target_label text not null,
  details      jsonb not null default '{}'
);
create index if not exists officer_audit_at_idx on public.officer_audit (at desc);
alter table public.officer_audit enable row level security;
revoke all on public.officer_audit from anon, authenticated;
grant select, insert on public.officer_audit to service_role;
grant usage, select on sequence public.officer_audit_id_seq to service_role;

-- 8e. PENGANONIMAN DATA PELAPOR ---------------------------------------------------------------------------
-- Kebijakan Privasi menyatakan data kontak pelapor (nama, telepon, email) tidak disimpan selamanya. Dua fungsi ini
-- menjalankannya: anonymize_old_reports membersihkan laporan yang sudah final (Resolved/Rejected) lebih dari N bulan
-- (bawaan 12), dan anonymize_report membersihkan satu laporan seketika (mis. atas permintaan pelapor). Isi laporan lain
-- (satwa, lokasi, foto, riwayat) tidak berubah. Hanya service_role yang boleh menjalankan.
alter table public.reports add column if not exists anonymized_at timestamptz;

create or replace function public.anonymize_report(p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports
     set reporter_name = 'Dianonimkan', reporter_phone = '00000', reporter_email = null, anonymized_at = now()
   where id = p_id and anonymized_at is null;
  return found;
end;
$$;

create or replace function public.anonymize_old_reports(p_months integer default 12)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if p_months is null or p_months < 1 then raise exception 'p_months minimal 1'; end if;
  update public.reports
     set reporter_name = 'Dianonimkan', reporter_phone = '00000', reporter_email = null, anonymized_at = now()
   where status in ('Resolved', 'Rejected')
     and anonymized_at is null
     and updated_at < now() - make_interval(months => p_months);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.anonymize_report(text) from public, anon, authenticated;
revoke all on function public.anonymize_old_reports(integer) from public, anon, authenticated;
grant execute on function public.anonymize_report(text) to service_role;
grant execute on function public.anonymize_old_reports(integer) to service_role;

-- Penjadwalan otomatis (sekali sehari). Butuh ekstensi pg_cron: Dashboard > Database > Extensions > aktifkan "pg_cron".
-- Setelah aktif, jalankan baris berikut SEKALI (20:00 UTC = 03:00 WIB). Ubah angka 12 untuk lama penyimpanan lain.
--   select cron.schedule('anonimkan-laporan-lama', '0 20 * * *', $$select public.anonymize_old_reports(12)$$);
-- Memeriksa jadwal:  select jobname, schedule, active from cron.job;
-- Menghapus jadwal:  select cron.unschedule('anonimkan-laporan-lama');

-- 8f. PEMBATAS PERMINTAAN BERSAMA ---------------------------------------------------------------------------
-- Penghitung per kunci (mis. "submit:203.0.113.9" atau "ai-chat-day:2026-11-09") dengan jendela waktu tetap. Berbeda dengan
-- penghitung di memori server, ini berlaku untuk semua instance Vercel sekaligus. Satu pernyataan upsert = atomik: dua permintaan
-- bersamaan tidak bisa sama-sama lolos melewati batas. Hanya service_role yang boleh memakai.
create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         integer not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant select, insert, update, delete on public.rate_limits to service_role;

create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'argumen pembatas tidak valid';
  end if;

  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
        hits         = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
  returning hits into v_hits;

  -- bersih-bersih ringan: sesekali buang kunci yang sudah lama tidak dipakai
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- 9. PENYIMPANAN FOTO --------------------------------------------------------------------------------
-- Bucket publik: foto dapat ditampilkan di peta dan halaman Lacak lewat alamat unik (nama berkas acak).
-- Unggahan hanya lewat server (secret key), jadi tidak ada policy unggah untuk pengunjung.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
