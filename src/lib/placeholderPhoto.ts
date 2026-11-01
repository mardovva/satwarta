/** Gambar ilustrasi sementara (SVG) untuk foto pada laporan contoh. Ganti dengan foto asli bila tersedia. */
export function placeholderPhoto(emoji: string, title: string, kind: "pelapor" | "petugas"): string {
  const [a, b] = kind === "pelapor" ? ["#8A6B3F", "#3B2A14"] : ["#4F7A62", "#1E3A2B"];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="960" height="720" fill="url(#g)"/>` +
    `<text x="480" y="400" font-size="220" text-anchor="middle">${emoji}</text>` +
    `<text x="480" y="570" font-size="40" fill="#fff" fill-opacity=".92" text-anchor="middle" font-family="Arial, sans-serif">${title}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
