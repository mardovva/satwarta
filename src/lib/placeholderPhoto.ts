/** Gambar pengganti netral (tanpa emoji) bila file foto tidak ditemukan. */
export function fallbackPhoto(): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6B8F71"/><stop offset="1" stop-color="#345542"/></linearGradient></defs>' +
    '<rect width="960" height="720" fill="url(#g)"/>' +
    '<rect x="330" y="270" width="300" height="200" rx="28" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="12"/>' +
    '<circle cx="480" cy="370" r="52" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="12"/>' +
    '<text x="480" y="560" font-size="38" fill="#fff" fill-opacity=".9" text-anchor="middle" font-family="Arial, sans-serif">Foto belum tersedia</text></svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Pasang di onError <img>: ganti sekali dengan gambar pengganti. */
export function handleImgError(e: { currentTarget: HTMLImageElement }) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = fallbackPhoto();
}
