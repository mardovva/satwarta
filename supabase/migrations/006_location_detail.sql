-- Migrasi 006: kolom "Detail lokasi" pada laporan (patokan, nama jalan, desa, atau ciri tempat yang ditulis pelapor).
-- Untuk database yang SUDAH berjalan: tempel isi file ini di SQL Editor lalu Run. (schema.sql terbaru sudah memuatnya.)
--
-- PENTING: jalankan migrasi ini SEBELUM menerbitkan (deploy) kode baru. Kode baru menyimpan kolom ini; bila kolomnya belum ada,
-- pengiriman laporan gagal. Sebaliknya, menjalankan migrasi lebih dulu aman: kode lama tidak terpengaruh.
--
-- Laporan yang sudah ada otomatis berisi teks kosong (tidak perlu mengubah isi tabel). Hak akses tidak perlu diatur ulang:
-- hak service_role pada tabel reports berlaku untuk seluruh kolom, termasuk kolom baru.

alter table public.reports
  add column if not exists location_detail text not null default '' check (char_length(location_detail) <= 300);

-- Memuat ulang skema API agar kolom baru langsung dikenali (Supabase biasanya melakukannya sendiri; aman dijalankan lagi).
notify pgrst, 'reload schema';
