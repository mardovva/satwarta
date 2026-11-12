/**
 * Menentukan bagian halaman yang disorot di menu.
 * Aturan: bagian aktif = bagian terakhir yang batas atasnya sudah melewati garis penentu dekat bagian atas layar.
 * Di dasar halaman, bagian terakhir yang aktif. (Garis di tengah layar membuat bagian pendek, mis. Lacak tanpa hasil,
 * kalah oleh bagian di bawahnya.)
 */
export function spyLine(viewportHeight: number): number {
  return Math.min(260, Math.max(140, viewportHeight * 0.3));
}

export function pickActive(ids: string[], tops: (number | null)[], line: number, atBottom: boolean): string {
  if (atBottom) return ids[ids.length - 1];
  let current = ids[0];
  ids.forEach((id, i) => { const top = tops[i]; if (top !== null && top <= line) current = id; });
  return current;
}

