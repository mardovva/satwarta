-- Migrasi 004 (Kebijakan Privasi): penganoniman data kontak pelapor.
-- Untuk database yang SUDAH berjalan: tempel isi file ini di SQL Editor lalu Run. (schema.sql terbaru sudah memuatnya.)
-- Setelah itu aktifkan pg_cron dan jadwalkan seperti petunjuk di bagian bawah, agar penganoniman berjalan otomatis.

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

