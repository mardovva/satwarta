import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";

const social = [
  { label: "Instagram", href: "https://www.instagram.com/mardovva", Icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mardova-fadhilah-11b920395", Icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="bg-primary px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
        <div className="flex flex-col items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
            <Image src="/images/logo.png" alt="Logo Satwarta" width={40} height={41} className="h-7 w-auto" />
          </span>
          <p className="text-sm text-white/80">Copyright Satwarta 2026</p>
        </div>
        <ul className="flex items-center gap-3">
          {social.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white hover:text-primary"
              >
                <Icon size={20} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
