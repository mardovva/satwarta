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

// Penanda sesi: setelah Beranda pernah tampil, kembali dari halaman lain (mis. AI Chat) tidak mengulang animasi.
// Variabel modul bertahan selama navigasi di dalam aplikasi, dan hilang saat halaman di-refresh (animasi main lagi).
let played = false;
export const introPlayed = () => played;
export const markIntroPlayed = () => { played = true; };

// Kedalaman terjauh yang pernah dilihat di Beranda (px dari atas dokumen). Saat Beranda dibuka lagi (mis. dari AI Chat
// lewat header), elemen yang letaknya di atas batas ini langsung tampil tanpa animasi; bagian yang belum pernah
// dilihat tetap beranimasi saat pertama kali di-scroll.
let seenDepth = 0;
let tracking = false;
export const seenDepthY = () => seenDepth;
export function trackSeenDepth() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const update = () => { seenDepth = Math.max(seenDepth, window.scrollY + window.innerHeight); };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/**
 * Saat Beranda dibuka lagi (mis. dari AI Chat), bagian yang sudah pernah dilihat:
 * false = langsung tampil tanpa animasi dan tanpa menunggu; true = tetap beranimasi, tetapi langsung mulai (tanpa jeda).
 */
export const REVISIT_ANIMATE = false;
