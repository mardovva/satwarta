"use client";
import Reveal from "@/components/ui/Reveal";
import { handleImgError } from "@/lib/placeholderPhoto";

// Foto dari /public/images/animals. File yang belum ada menampilkan gambar pengganti.
const photos = [
  { file: "gajah-sumatera.jpg", alt: "Gajah Sumatera" },
  { file: "lahan-terbakar.jpg", alt: "Lahan terbakar" },
  { file: "orangutan.jpg", alt: "Orangutan" },
  { file: "asap-karhutla.jpg", alt: "Asap karhutla" },
  { file: "burung-rangkong.jpg", alt: "Burung rangkong" },
  { file: "beruang-madu.jpg", alt: "Beruang madu" },
  { file: "petugas-lapangan.jpg", alt: "Petugas di lapangan" },
  { file: "petugas-evakuasi.jpg", alt: "Evakuasi satwa" },
  { file: "satwa-dilepasliarkan.jpg", alt: "Satwa dilepasliarkan" },
  { file: "dokter-hewan.jpg", alt: "Pemeriksaan dokter hewan" },
];

/**
 * Carousel foto yang bergeser terus (infinite), foto berimpitan tanpa jarak dan tanpa sudut membulat.
 * Berada di belakang dekorasi ranting (z lebih rendah). Semua foto dimuat langsung (bukan lazy) dan
 * digeser dengan translate3d agar tidak berkedip. Diam bila reduce-motion aktif.
 */
export default function PhotoCarousel() {
  return (
    <section aria-label="Dokumentasi lapangan" className="relative z-10 pb-8 pt-20">
      <Reveal>
      <div className="overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.22)] motion-reduce:overflow-x-auto">
        <ul className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none">
          {[...photos, ...photos].map((p, i) => (
            <li key={i} aria-hidden={i >= photos.length} className="h-52 w-72 flex-none sm:h-60 sm:w-80 lg:h-64 lg:w-[22rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/animals/${p.file}`} alt={i < photos.length ? p.alt : ""} loading="eager" decoding="async" draggable={false} onError={handleImgError} className="block h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      </div>
      </Reveal>
    </section>
  );
}
