-- =====================================================================================================
-- MENGELOLA PETUGAS LEWAT SQL (cadangan)
--
-- Cara utama sekarang BUKAN lewat berkas ini:
--   * Halaman "Kelola Petugas" di aplikasi (/petugas/kelola, khusus admin): tambah, ubah, nonaktifkan, hapus, atur sandi.
--   * Skrip scripts/seed-officers.mjs: membuat 15 akun lembaga (12 regional + 3 nasional) sekaligus.
-- Berkas ini hanya untuk keadaan darurat (mis. belum ada admin yang bisa masuk).
--
-- Peran:  officer = hanya wilayah yang terdaftar | national = semua wilayah | admin = semua wilayah + kelola petugas
-- Pastikan pendaftaran terbuka dimatikan: Authentication > Sign In / Providers > "Allow new users to sign up" = OFF.
-- Supabase menolak email berdomain contoh/uji (example.com, .test, .local). Pakai domain nyata atau alias Gmail (nama+kode@gmail.com).
-- =====================================================================================================

-- Langkah 1 (dashboard): Authentication > Users > Add user > Create new user. Isi email + kata sandi, centang "Auto Confirm User".

-- Langkah 2 (SQL Editor): daftarkan akun itu sebagai petugas. Ganti nilai lalu Run.
--   regions = nama provinsi PERSIS seperti di formulir laporan (mis. 'Riau', 'Kalimantan Barat', 'Daerah Khusus Ibukota Jakarta').
insert into public.officers (id, full_name, agency, role, regions)
select id, 'Tim Penanganan Satwa', 'BKSDA Riau', 'officer', array['Riau', 'Jambi']
from auth.users
where email = 'petugas@domain-nyata.com'
on conflict (id) do update
  set full_name = excluded.full_name, agency = excluded.agency, role = excluded.role, regions = excluded.regions;

-- ADMIN darurat (semua wilayah + kelola petugas):
-- insert into public.officers (id, full_name, agency, role, regions)
-- select id, 'Admin Satwarta', 'Pusat', 'admin', '{}' from auth.users where email = 'admin@domain-nyata.com'
-- on conflict (id) do update set role = 'admin', active = true;

-- MENONAKTIFKAN petugas (tidak bisa menangani laporan; dapat diaktifkan lagi):
-- update public.officers set active = false where id = (select id from auth.users where email = 'petugas@domain-nyata.com');

-- MENGHAPUS petugas: hapus akunnya di Authentication > Users (menu titik tiga > Delete user); profilnya ikut terhapus.
-- Riwayat laporan lama tetap menyimpan nama petugas tersebut.

-- MELIHAT DAFTAR PETUGAS:
-- select u.email, o.full_name, o.agency, o.role, o.active, o.regions from public.officers o join auth.users u on u.id = o.id order by o.agency;
