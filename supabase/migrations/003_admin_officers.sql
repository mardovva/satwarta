-- Migrasi 003 (Halaman Admin): peran 'national', status aktif akun, log audit, dan aturan tindakan yang diperbarui.
-- Untuk database yang SUDAH menjalankan schema.sql dan migrasi 002 sebelumnya: tempel isi file ini di SQL Editor lalu Run.
-- (Supabase mungkin menampilkan peringatan "destructive operations" karena ada DROP CONSTRAINT: itu aman, constraint dibuat ulang di baris berikutnya.)
-- schema.sql versi terbaru sudah memuat semuanya; proyek baru cukup menjalankan schema.sql.

alter table public.officers add column if not exists active boolean not null default true;
alter table public.officers drop constraint if exists officers_role_check;
alter table public.officers add constraint officers_role_check check (role in ('officer', 'national', 'admin'));

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
