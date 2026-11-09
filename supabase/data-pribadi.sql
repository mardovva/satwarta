-- =====================================================================================================
-- MENANGANI PERMINTAAN DATA PRIBADI (hak pelapor menurut Kebijakan Privasi, halaman /privasi)
-- Jalankan di SQL Editor Supabase. Minta pelapor menyebutkan nomor laporannya (mis. SWT-2026-0001).
-- =====================================================================================================

-- 1. MENEMUKAN laporan berdasarkan nomor (hanya admin proyek yang bisa membaca kolom kontak):
-- select id, status, reporter_name, reporter_phone, reporter_email, anonymized_at, created_at from public.reports where id = 'SWT-2026-0001';

-- 2. Permintaan menemukan semua laporan dari satu nomor telepon:
-- select id, status, reporter_name, created_at from public.reports where reporter_phone = '081234567890';

-- 3. MENGHAPUS data kontak seketika (anonimkan): nama menjadi "Dianonimkan", telepon dan email dikosongkan.
--    Isi laporan lain (satwa, lokasi, foto, riwayat) tidak berubah, sehingga catatan konservasi tetap utuh.
-- select public.anonymize_report('SWT-2026-0001');   -- true = berhasil, false = sudah dianonimkan / tidak ada

-- 4. MENGHAPUS FOTO atas permintaan: hapus berkasnya di Storage > report-photos > reports > (nomor laporan),
--    lalu hapus barisnya agar tidak ada tautan rusak:
-- delete from public.report_photos where storage_path = 'reports/SWT-2026-0001/xxxx.jpg';

-- 5. MENGHAPUS LAPORAN sepenuhnya (riwayat, foto, dan donasi terkait ikut terhapus). Hapus juga berkas fotonya di Storage.
-- delete from public.reports where id = 'SWT-2026-0001';

-- 6. Memeriksa penganoniman otomatis (pg_cron):
-- select jobname, schedule, active from cron.job;                                         -- jadwal terdaftar?
-- select count(*) from public.reports where anonymized_at is not null;                    -- berapa yang sudah dianonimkan
-- select count(*) from public.reports where status in ('Resolved','Rejected') and anonymized_at is null
--   and updated_at < now() - interval '12 months';                                        -- harus 0 bila jadwal berjalan
