"use client";
import { useMemo } from "react";
import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { contactHref, groupInstitutions, mapsHref, type Contact, type Institution } from "@/data/institutions";

const ICON: Record<Contact["type"], typeof Phone> = { phone: Phone, wa: MessageCircle, email: Mail, web: Globe };

/**
 * Daftar lembaga: tanpa kartu dan tanpa header, dipisahkan garis tipis.
 * Wilayah satu baris penuh; di bawahnya tiap lembaga: nama, lokasi (tautan Google Maps), jenis layanan, kontak (ikon, disusun ke bawah).
 * Urutan wilayah menurut abjad; lembaga umum (nasional) di paling bawah.
 */
export default function InstitutionsSection() {
  const groups = useMemo(() => groupInstitutions(), []);

  return (
    <section id="lembaga" className="px-4 pb-6 pt-24">
      <div className="mx-auto w-[92%] max-w-[83.125rem] md:w-[84%]">
        <Reveal>
          <h2 className="text-center text-4xl font-bold tracking-tight text-primary sm:text-5xl">Lembaga dan Kontak Penyelamatan Satwa</h2>
        </Reveal>

        <div className="mt-8">
          {groups.map((g, n) => (
            <Reveal key={g.region} delay={Math.min(n, 3) * 0.05}>
              {/* garis hanya di antara wilayah: tidak ada garis di bawah judul maupun di paling bawah */}
              <section aria-label={g.region} className={`pb-2 pt-5 ${n > 0 ? "border-t border-primary/15" : ""}`}>
                <h3 className="text-xl font-light leading-tight text-black sm:text-2xl">{g.region}</h3>

                <ul className="mt-3 divide-y divide-primary/10 border-t border-primary/10">
                  {g.items.map((i) => (
                    <li
                      key={i.id} id={`lembaga-${i.id}`}
                      className="grid gap-x-6 gap-y-1 py-2.5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.25fr)] md:items-start"
                    >
                      <h4 className="text-[0.9375rem] font-medium leading-snug text-black">{i.name}</h4>
                      <div className="text-[0.8125rem] leading-snug text-ink/60"><Location i={i} /></div>
                      <p className="text-[0.8125rem] leading-snug text-ink/60">{i.service}</p>
                      <Contacts list={i.contacts} />
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Lokasi tanpa ikon; tautan ke Google Maps. Layanan nasional tanpa alamat: teks biasa. */
function Location({ i }: { i: Institution }) {
  if (i.provinces[0] === "Nasional" && !i.mapQuery) return <span>{i.location}</span>;
  return (
    <a href={mapsHref(i.mapQuery ?? `${i.name} ${i.location}`)} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-4 transition hover:text-primary hover:decoration-primary">
      {i.location}
    </a>
  );
}

/** Kontak resmi dengan ikon (telepon, WhatsApp, email, situs); semuanya dapat ditekan. */
function Contacts({ list }: { list: Contact[] }) {
  if (list.length === 0) return <p className="text-[0.8125rem] text-ink/45">Kontak belum diverifikasi</p>;
  return (
    <ul className="space-y-0.5 text-[0.8125rem] leading-snug">
      {list.map((c) => {
        const Icon = ICON[c.type];
        return (
          <li key={`${c.type}-${c.value}`}>
            <a
              href={contactHref(c)} title={c.label} aria-label={`${c.label}: ${c.value}`}
              {...(c.type === "web" || c.type === "wa" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-1.5 font-medium text-primary transition hover:underline"
            >
              <Icon size={13} className="flex-none" />
              <span className="break-all">{c.type === "web" ? c.value.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : c.value}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
