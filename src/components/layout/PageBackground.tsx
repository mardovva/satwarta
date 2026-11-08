// Background berukuran satu layar yang diam (fixed) saat halaman digulir; hanya konten dan dekorasi yang bergerak.
// Ganti gambar di /public/images/background/background.png. Ukuran ideal: 1920x1080 (landscape), atau 2560x1440 untuk layar retina.
// overflow-clip (bukan hidden) agar wrapper tidak menjadi scroll container yang ikut tergulir saat anchor.
export default function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background/background.png')" }}
      />
      {children}
    </div>
  );
}
