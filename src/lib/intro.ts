/** Waktu urutan animasi saat halaman pertama kali dibuka (detik, kecuali disebut lain). */
export const INTRO = {
  /** judul dan angka statistik muncul bersamaan */
  titleDelay: 0.2,
  /** hitungan angka mulai begitu angka mulai muncul (lihat StatNumber) */
  countDurationMs: 2800,
  /** dua tombol CTA dan peta muncul bersamaan setelah hitungan selesai (selesai ~4,5 dtk) */
  nextDelay: 3.5,
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

// Ingatan per halaman (menurut pathname). Halaman yang pernah dibuka dan seberapa jauh ia pernah di-scroll disimpan, sehingga
// saat halaman itu dibuka lagi (mis. dari AI Chat), elemen yang letaknya di atas batas tersebut langsung tampil tanpa animasi;
// bagian yang belum pernah dilihat tetap beranimasi sekali saat pertama kali di-scroll. Halaman lain tidak terpengaruh.
const visited = new Set<string>();
const depths: Record<string, number> = {};
let tracking = false;
export const pathVisited = (path: string) => visited.has(path);
export const markPathVisited = (path: string) => { visited.add(path); };
export const seenDepthY = (path: string) => depths[path] ?? 0;
export function trackSeenDepth() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const update = () => {
    const path = window.location.pathname;
    depths[path] = Math.max(depths[path] ?? 0, window.scrollY + window.innerHeight);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/**
 * Saat Beranda dibuka lagi (mis. dari AI Chat), bagian yang sudah pernah dilihat:
 * false = langsung tampil tanpa animasi dan tanpa menunggu; true = tetap beranimasi, tetapi langsung mulai (tanpa jeda).
 */
export const REVISIT_ANIMATE = false;
