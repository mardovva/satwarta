import Image from "next/image";

/** Ubah ke false untuk menyembunyikan semua ranting dan daun dekorasi (tampilan lebih polos ala Cluely). */
const SHOW_DECOR = true;

interface DecorProps {
  src: string;
  width: number;
  height: number;
  className?: string;
  /** Titik tumpu goyangan lembut seperti tertiup angin, mis. "left top". Kosongkan agar diam. */
  sway?: string;
  /** Cerminkan gambar secara horizontal */
  flip?: boolean;
}

/** Dekorasi ilustrasi: absolute, berada di lapisan atas (z-30, di bawah header dan pop up) dan tidak menangkap klik, sehingga tombol di bawahnya tetap bisa diklik. */
export default function Decor({ src, width, height, className = "", sway, flip }: DecorProps) {
  if (!SHOW_DECOR) return null;
  const img = (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={`pointer-events-none block h-auto select-none ${flip ? "w-full" : `absolute z-30 ${className}`} ${sway ? "animate-sway motion-reduce:animate-none" : ""}`}
      style={sway ? { transformOrigin: sway, animationDuration: `${5 + (width % 4)}s` } : undefined}
    />
  );
  if (!flip) return img;
  return <div aria-hidden className={`pointer-events-none absolute z-30 -scale-x-100 ${className}`}>{img}</div>;
}

