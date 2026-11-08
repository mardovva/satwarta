import Image from "next/image";

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

/** Dekorasi ilustrasi: absolute, tidak menangkap klik, berada di belakang konten kecuali diberi z-index. */
export default function Decor({ src, width, height, className = "", sway, flip }: DecorProps) {
  const img = (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={`pointer-events-none block h-auto select-none ${flip ? "w-full" : `absolute ${className}`} ${sway ? "animate-sway motion-reduce:animate-none" : ""}`}
      style={sway ? { transformOrigin: sway, animationDuration: `${5 + (width % 4)}s` } : undefined}
    />
  );
  if (!flip) return img;
  return <div aria-hidden className={`pointer-events-none absolute -scale-x-100 ${className}`}>{img}</div>;
}
