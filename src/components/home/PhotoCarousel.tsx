"use client";
import { useState } from "react";
import Image from "next/image";
import { fallbackPhoto } from "@/lib/placeholderPhoto";

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

const IMG = "block h-full w-full select-none object-cover";

function Slide({ file, alt, decorative }: { file: string; alt: string; decorative: boolean }) {
  const [failed, setFailed] = useState(false);
  const label = decorative ? "" : alt;
  // eslint-disable-next-line @next/next/no-img-element
  if (failed) return <img src={fallbackPhoto()} alt={label} draggable={false} className={IMG} />;
  return (
    <Image
      src={`/images/animals/${file}`} alt={label} width={704} height={512} quality={70}
      sizes="(min-width: 1024px) 352px, (min-width: 640px) 320px, 288px"
      loading="eager" decoding="sync" draggable={false} onError={() => setFailed(true)} className={IMG}
    />
  );
}

export default function PhotoCarousel() {
  return (
    <section aria-label="Dokumentasi lapangan" className="relative z-10 pb-8 pt-20">
      <div className="overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.22)] motion-reduce:overflow-x-auto">
        <ul className="flex w-max animate-marquee will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] motion-reduce:animate-none">
          {[...photos, ...photos].map((p, i) => (
            <li key={i} aria-hidden={i >= photos.length} className="h-52 w-72 flex-none [backface-visibility:hidden] [transform:translateZ(0)] sm:h-60 sm:w-80 lg:h-64 lg:w-[22rem]">
              <Slide file={p.file} alt={p.alt} decorative={i >= photos.length} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
