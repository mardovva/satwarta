import Image from "next/image";

interface DecorProps { src: string; width: number; height: number; className?: string }

/** Dekorasi ilustrasi: absolute, tidak menangkap klik, berada di belakang konten (z-0). */
export default function Decor({ src, width, height, className = "" }: DecorProps) {
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={`pointer-events-none absolute z-0 h-auto select-none ${className}`}
    />
  );
}
