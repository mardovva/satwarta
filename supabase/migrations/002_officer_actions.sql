-- Migrasi 002 (Tahap 2): fungsi tindakan petugas.
-- Untuk database yang SUDAH menjalankan schema.sql versi sebelumnya: tempel isi file ini di SQL Editor lalu Run.
-- (schema.sql versi terbaru sudah memuat fungsi yang sama; proyek baru cukup menjalankan schema.sql.)

-- 8c. TINDAKAN PETUGAS (dipaksakan di database) -------------------------------------------------------
-- Satu-satunya jalan mengubah status laporan. Berjalan dalam SATU transaksi dengan kunci baris (FOR UPDATE), sehingga
-- dua petugas yang bertindak bersamaan tidak bisa saling menimpa: yang pertama berhasil, yang kedua ditolak.
-- Mengembalikan id baris riwayat bila berhasil, atau NULL bila ditolak karena salah satu aturan ini dilanggar:
--   * laporan atau petugas tidak ditemukan
--   * status laporan saat ini bukan p_expected (sudah diubah petugas lain)
--   * perpindahan status tidak termasuk alur yang diizinkan
--   * petugas (non-admin) bertindak di luar wilayah kerjanya
--   * laporan sudah ditangani petugas lain (petugas pertama yang bertindak menjadi penanggung jawab)
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
  if not found then return null; end if;

  select * into r from public.reports where id = p_report for update;
  if not found then return null; end if;

  if r.status <> p_expected then return null; end if;

  if not exists (
    select 1 from (values
      ('Submitted', 'Under Review'), ('Under Review', 'Verified'), ('Under Review', 'Rejected'),
      ('Verified', 'In Progress'), ('In Progress', 'In Progress'), ('In Progress', 'Resolved')
    ) as t(a, b) where t.a = p_expected and t.b = p_new
  ) then return null; end if;

  if o.role <> 'admin' then
    if not (r.province = any (o.regions)) then return null; end if;
    if r.handled_by is not null and r.handled_by <> p_officer then return null; end if;
  end if;

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
