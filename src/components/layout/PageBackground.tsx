// Gambar background berada di layer dengan tinggi mengikuti lebar layar (bukan tinggi konten),
// sehingga skalanya tidak berubah ketika konten bertambah (mis. kartu hasil tracking muncul).
// overflow-clip (bukan hidden) agar wrapper tidak menjadi scroll container yang ikut tergulir saat anchor.
// background.png sudah memiliki transparansi bawaan, jadi tidak diberi opacity tambahan.
export default function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-clip bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 aspect-[1280/2500] min-h-[2600px] bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/background/background.png')" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
