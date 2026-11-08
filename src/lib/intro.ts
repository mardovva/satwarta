/** Waktu urutan animasi saat halaman pertama kali dibuka (detik, kecuali disebut lain). */
export const INTRO = {
  /** judul dan angka statistik muncul bersamaan */
  titleDelay: 0.2,
  /** hitungan angka mulai setelah angka terlihat; tiap angka tertunda sedikit */
  countDelayMs: 700,
  countStaggerMs: 150,
  countDurationMs: 3500,
  /** dua tombol CTA dan peta muncul bersamaan setelah hitungan selesai (selesai ~4,5 dtk) */
  nextDelay: 4.6,
  /** lama animasi muncul peta (sama dengan tombol CTA) */
  mapDurationMs: 900,
} as const;

/** Latar berganti ke hero-2 setelah animasi peta selesai (ms sejak halaman dibuka) */
export const BACKGROUND_SWITCH_MS = INTRO.nextDelay * 1000 + INTRO.mapDurationMs + 400;
