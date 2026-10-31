import { Megaphone, Settings2, ShieldCheck } from "lucide-react";

const roles = [
  { Icon: Megaphone, title: "Masyarakat", badge: "Tersedia di demo", text: "Melihat informasi karhutla di peta, melaporkan satwa terdampak, dan memantau perkembangan laporan." },
  { Icon: ShieldCheck, title: "Petugas", badge: "Dalam pengembangan", text: "Menerima laporan, melakukan verifikasi, memperbarui status, dan memantau proses penanganan." },
  { Icon: Settings2, title: "Administrator", badge: "Dalam pengembangan", text: "Mengelola sistem, pengguna, dan data pendukung agar platform tetap berjalan baik." },
];

export default function AboutSection() {
  return (
    <section id="tentang" className="bg-cream px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">Tentang Satwarta</h2>
          <p className="mt-4 leading-relaxed text-ink/75">
            Satwarta menghubungkan masyarakat dengan petugas dan instansi terkait untuk melaporkan serta memantau kondisi satwa liar yang terdampak kebakaran hutan dan lahan (karhutla) di Indonesia. <strong className="text-primary">Jaga Satwa, Jaga Kita.</strong>
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {roles.map(({ Icon, title, badge, text }) => (
            <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={24} /></span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <span className="mt-1 inline-block rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent">{badge}</span>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{text}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white px-5 py-4 text-center text-sm text-ink/70 ring-1 ring-black/5">
          Versi ini adalah <strong>prototipe</strong>. Statistik dan laporan satwa adalah data contoh. Hotspot pada peta berasal dari NASA FIRMS bila tersambung (indikasi panas dari satelit, belum tentu kebakaran); bila tidak, ditampilkan data simulasi yang diberi label.
        </p>
      </div>
    </section>
  );
}
