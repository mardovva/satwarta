// Daftar lembaga penyelamatan satwa dan kontak terkait karhutla.
// ATURAN: hanya memuat kontak yang ditemukan di sumber resmi (situs pemerintah atau lembaga) atau pemberitaan resmi,
// lengkap dengan tautan sumbernya. Bila kontak belum terverifikasi, daftar `contacts` dikosongkan dan diberi catatan.
// Nomor dapat berubah: perbarui `INSTITUTIONS_VERIFIED_AT` setiap kali data diperiksa ulang.

export const INSTITUTIONS_VERIFIED_AT = "9 November 2026";

export type InstitutionKind = "callcenter" | "posko" | "instansi" | "pps" | "prs";

export const kindLabels: Record<InstitutionKind, string> = {
  callcenter: "Call center satwa 24 jam",
  posko: "Posko dan darurat",
  instansi: "Instansi",
  pps: "Pusat Penyelamatan Satwa",
  prs: "Pusat Rehabilitasi",
};

export interface Contact {
  type: "phone" | "wa" | "email" | "web";
  /** Keterangan singkat, mis. "Call center 24 jam" */
  label: string;
  /** Nomor, alamat email, atau URL (apa adanya) */
  value: string;
}

export interface Institution {
  /** Jenis layanan (singkat) untuk tabel */
  service: string;
  id: string;
  name: string;
  kind: InstitutionKind;
  provinces: string[];            // "Nasional" untuk layanan tingkat pusat
  location: string;
  /** Alamat jalan (bila ada) untuk tautan "Buka di Google Maps" */
  mapQuery?: string;
  contacts: Contact[];
  services: string[];
  howTo: string;                  // petunjuk menghubungi
  note?: string;
  source: { label: string; url: string };
}

const HOW_CALL = "Telepon atau kirim pesan, lalu sebutkan jenis satwa, kondisi, jumlah, dan lokasi (nama desa dan kecamatan, atau kirim titik lokasi). Kirim foto dari jarak aman bila diminta. Jangan mendekati, menangani sendiri, atau memberi makan satwa.";

type RawInstitution = Omit<Institution, "service">;

const RAW: RawInstitution[] = [
  {
    id: "bksda-kalbar", name: "BKSDA Kalimantan Barat: Call Center Satwa", kind: "callcenter", provinces: ["Kalimantan Barat"],
    location: "Kalimantan Barat (wilayah kerja Balai KSDA Kalbar)",
    contacts: [
      { type: "phone", label: "Call center 24 jam", value: "0811-5776-767" },
      { type: "phone", label: "Seksi KSDA Wilayah I Ketapang", value: "0811-5670-041" },
    ],
    services: ["Menerima laporan satwa terdampak karhutla", "Evakuasi dan penyelamatan satwa liar", "Bekerja sama dengan mitra rehabilitasi, mis. YIARI"],
    howTo: HOW_CALL,
    source: { label: "InfoPublik, penyelamatan satwa karhutla Kalbar", url: "https://infopublik.id/kategori/bencana/988672/puluhan-satwa-liar-korban-karhutla-di-kalimantan-barat-berhasil-diselamatkan" },
  },
  {
    id: "bksda-kalteng", name: "BKSDA Kalimantan Tengah: Call Center Satwa", kind: "callcenter", provinces: ["Kalimantan Tengah"],
    location: "Jl. Yos Sudarso No. 3, Palangka Raya 73112",
    mapQuery: "Balai KSDA Kalimantan Tengah Jl. Yos Sudarso No. 3 Palangka Raya",
    contacts: [{ type: "phone", label: "Call center 24 jam", value: "0811-5218-500" }],
    services: ["Menerima laporan orangutan dan satwa liar terdampak karhutla", "Evakuasi bersama mitra (BOS Foundation, OFI)"],
    howTo: HOW_CALL,
    note: "Alamat kantor mengikuti siaran pers resmi KSDAE tahun 2021; nomor call center dari pengumuman Menteri Kehutanan 5 September 2026.",
    source: { label: "ANTARA, 5 September 2026", url: "https://www.antaranews.com/berita/5727783/kemenhut-perkuat-call-center-penyelamatan-satwa-terdampak-karhutla" },
  },
  {
    id: "bksda-kaltim", name: "BKSDA Kalimantan Timur: Call Center Satwa", kind: "callcenter", provinces: ["Kalimantan Timur"],
    location: "Kalimantan Timur (wilayah kerja Balai KSDA Kaltim)",
    contacts: [{ type: "phone", label: "Call center 24 jam", value: "0821-1333-8181" }],
    services: ["Menerima laporan satwa liar terdampak karhutla", "Evakuasi dan penyelamatan satwa liar"],
    howTo: HOW_CALL,
    note: "Alamat kantor belum kami verifikasi.",
    source: { label: "ANTARA, 5 September 2026", url: "https://www.antaranews.com/berita/5727783/kemenhut-perkuat-call-center-penyelamatan-satwa-terdampak-karhutla" },
  },
  {
    id: "posko-karhutla", name: "Posko Karhutla Kementerian Kehutanan (Manggala Agni)", kind: "posko", provinces: ["Nasional"],
    location: "Posko tingkat pusat",
    contacts: [
      { type: "phone", label: "Telepon posko", value: "021-5704618" },
      { type: "wa", label: "WhatsApp posko", value: "+62 8131-00-35000" },
      { type: "web", label: "Informasi titik panas (SIPONGI)", value: "https://sipongi.gakkum.kehutanan.go.id" },
    ],
    services: ["Menerima laporan asap, titik api, atau aktivitas pembakaran", "Koordinasi pemadaman bersama BNPB, TNI, Polri, BPBD, dan masyarakat"],
    howTo: "Laporkan lokasi (desa, kecamatan, atau koordinat), perkiraan luas, dan kondisi asap atau api. Jauhi area kebakaran dan jangan memadamkan sendiri bila api besar.",
    source: { label: "InfoPublik, Kemenhut tingkatkan kewaspadaan karhutla", url: "https://infopublik.id/kategori/bencana/996103/hotspot-karhutla-nasional-naik-menjadi-215-titik-kemenhut-tingkatkan-kewaspadaan" },
  },
  {
    id: "polri-110", name: "Call Center Polri 110", kind: "posko", provinces: ["Nasional"],
    location: "Layanan nasional",
    contacts: [{ type: "phone", label: "24 jam, bebas pulsa", value: "110" }],
    services: ["Layanan darurat kepolisian", "Tercantum sebagai nomor resmi untuk melapor kebakaran hutan dan lahan"],
    howTo: "Gunakan saat keadaan darurat yang membahayakan orang atau ada dugaan pembakaran. Untuk penyelamatan satwa, hubungi call center BKSDA di wilayah Anda.",
    source: { label: "Indonesiabaik.id, nomor penting lapor karhutla", url: "https://indonesiabaik.id/infografis/nomor-penting-untuk-lapor-karhutla-dan-selamatkan-satwa" },
  },
  {
    id: "ditjen-ksdae", name: "Direktorat Jenderal KSDAE, Kementerian Kehutanan", kind: "instansi", provinces: ["Nasional"],
    location: "Gedung Manggala Wanabakti Blok 1 Lt. 8, Jl. Gatot Subroto, Jakarta 10270",
    mapQuery: "Gedung Manggala Wanabakti Jl. Gatot Subroto Jakarta 10270",
    contacts: [
      { type: "phone", label: "Telepon", value: "(021) 5730301" },
      { type: "email", label: "Email data konservasi", value: "datakonservasi@gmail.com" },
      { type: "web", label: "Situs resmi", value: "https://ksdae.kehutanan.go.id" },
    ],
    services: ["Kebijakan konservasi spesies dan satwa dilindungi", "Data lembaga konservasi, termasuk PPS dan pusat rehabilitasi"],
    howTo: "Untuk informasi dan data konservasi, bukan penanganan satwa di lapangan. Satwa yang perlu ditolong: hubungi BKSDA di wilayah Anda.",
    source: { label: "Situs Ditjen KSDAE", url: "https://ksdae.kehutanan.go.id/spesies/lembaga-konservasi/?kategori=pusat-penyelamatan-satwa" },
  },
  {
    id: "bksda-jakarta", name: "BKSDA Jakarta", kind: "instansi", provinces: ["DKI Jakarta"],
    location: "Jl. Salemba Raya No. 9, Jakarta Pusat 10440",
    mapQuery: "BKSDA Jakarta Jl. Salemba Raya No. 9 Jakarta Pusat",
    contacts: [
      { type: "phone", label: "Telepon kantor", value: "(021) 315 8142" },
      { type: "phone", label: "Call center", value: "0812-8964-3727" },
      { type: "email", label: "Email", value: "bksdadkijakarta@gmail.com" },
      { type: "web", label: "Situs", value: "http://bksdadki.com" },
    ],
    services: ["Evakuasi dan penanganan satwa liar di Jakarta, Bekasi, dan Tangerang", "Membawa satwa evakuasi ke PPS Tegal Alur"],
    howTo: HOW_CALL,
    note: "Kontak diambil dari direktori kukangku.id; cocokkan dengan situs bksdadki.com.",
    source: { label: "Direktori kukangku.id: BKSDA Jakarta", url: "https://kukangku.id/ksda/bksda-jakarta/" },
  },
  {
    id: "pps-tegal-alur", name: "Pusat Penyelamatan Satwa (PPS) Tegal Alur", kind: "pps", provinces: ["DKI Jakarta"],
    location: "Jl. Benda Raya No. 1, Kel. Tegal Alur, Jakarta Barat",
    mapQuery: "PPS Tegal Alur Jl. Benda Raya Tegal Alur Jakarta Barat",
    contacts: [{ type: "phone", label: "Melalui call center BKSDA Jakarta", value: "0812-8964-3727" }],
    services: ["Penampungan sementara satwa liar hasil evakuasi", "Pemeriksaan kesehatan, observasi, dan rehabilitasi"],
    howTo: "Penyerahan atau evakuasi dikoordinasikan lewat BKSDA Jakarta. Jangan mengantar satwa langsung tanpa menghubungi petugas lebih dulu.",
    note: "Nomor adalah call center BKSDA Jakarta yang mengelola penyelamatan di wilayah ini.",
    source: { label: "Daftar PPS resmi Ditjen KSDAE", url: "https://ksdae.kehutanan.go.id/spesies/lembaga-konservasi/?kategori=pusat-penyelamatan-satwa" },
  },
  {
    id: "alobi-babel", name: "Alobi Foundation: PPS Bangka Belitung", kind: "pps", provinces: ["Kepulauan Bangka Belitung"],
    location: "Jl. Sumedang RT 01 RW 02, Kel. Kejaksaan, Kec. Taman Sari, Kota Pangkalpinang",
    mapQuery: "Alobi Foundation Jl. Sumedang Kejaksaan Taman Sari Pangkalpinang",
    contacts: [
      { type: "phone", label: "Telepon", value: "0853-8375-5799" },
      { type: "email", label: "Email", value: "babelppsalobi@gmail.com" },
      { type: "web", label: "Situs", value: "https://www.alobi.org" },
    ],
    services: ["Lembaga konservasi pusat penyelamatan satwa di Bangka Belitung", "Menerima serahan satwa liar bersama BKSDA", "Rehabilitasi dan pelepasliaran"],
    howTo: "Hubungi lewat telepon atau email, jelaskan satwa dan lokasinya. Penyerahan satwa dilindungi dikoordinasikan dengan BKSDA setempat.",
    source: { label: "Situs Alobi Foundation", url: "https://alobi.org/category/pusat-penyelamatan-satwa-pps/" },
  },
  {
    id: "aspinall-sumsel", name: "The Aspinall Foundation: PPS Sumatera Selatan", kind: "pps", provinces: ["Sumatera Selatan"],
    location: "Sumatera Selatan",
    contacts: [],
    services: ["Tercantum sebagai Pusat Penyelamatan Satwa dalam daftar resmi KSDAE"],
    howTo: "Koordinasikan lewat Balai KSDA Sumatera Selatan.",
    note: "Kontak langsung belum kami verifikasi, jadi tidak ditampilkan.",
    source: { label: "Daftar PPS resmi Ditjen KSDAE", url: "https://ksdae.kehutanan.go.id/spesies/lembaga-konservasi/?kategori=pusat-penyelamatan-satwa" },
  },
  {
    id: "yiari-ketapang", name: "YIARI: Pusat Rehabilitasi Orangutan Ketapang", kind: "prs", provinces: ["Kalimantan Barat"],
    location: "Jl. Ketapang–Tanjungpura RT 010, Dsn. Pematang Merbau, Kec. Muara Pawan, Kab. Ketapang 78813",
    mapQuery: "YIARI Ketapang Pematang Merbau Muara Pawan Ketapang",
    contacts: [
      { type: "phone", label: "Kantor Ketapang", value: "+62 856-5237-3497" },
      { type: "web", label: "Situs", value: "https://yiari.or.id" },
    ],
    services: ["Evakuasi dan perawatan orangutan terdampak karhutla bersama BKSDA Kalbar", "Rehabilitasi dan pelepasliaran orangutan"],
    howTo: "Untuk penyelamatan di lapangan, hubungi dulu call center BKSDA Kalimantan Barat; YIARI bekerja bersama BKSDA. Nomor kantor ini untuk informasi program.",
    source: { label: "Situs YIARI dan ANTARA, 1 November 2026", url: "https://www.antaranews.com/berita/5824799/bksda-sembilan-orangutan-korban-karhutla-dilepasliarkan-di-ketapang" },
  },
  {
    id: "yiari-bogor", name: "YIARI: Pusat Rehabilitasi Primata Bogor", kind: "prs", provinces: ["Jawa Barat"],
    location: "Jl. Curug Nangka, Kp. Sinarwangi, Kel. Sukajadi, Kec. Tamansari, Bogor 16610",
    mapQuery: "YIARI Bogor Jl. Curug Nangka Sukajadi Tamansari Bogor",
    contacts: [
      { type: "phone", label: "Kantor Bogor", value: "+62 856-7536-660" },
      { type: "web", label: "Situs", value: "https://yiari.or.id" },
    ],
    services: ["Penyelamatan dan rehabilitasi primata (orangutan, kukang, monyet ekor panjang, beruk)", "Edukasi publik"],
    howTo: "Hubungi untuk informasi layanan. Penyerahan satwa dilindungi tetap perlu dikoordinasikan dengan BBKSDA Jawa Barat.",
    source: { label: "Situs YIARI", url: "https://yiari.or.id/?p=309571" },
  },
  {
    id: "bosf", name: "BOS Foundation: Nyaru Menteng dan Samboja Lestari", kind: "prs", provinces: ["Kalimantan Tengah", "Kalimantan Timur"],
    location: "Pusat Rehabilitasi Orangutan Nyaru Menteng (Kalimantan Tengah, sekitar 30 km dari Palangka Raya) dan Samboja Lestari (Kalimantan Timur)",
    contacts: [{ type: "web", label: "Situs resmi", value: "https://orangutan.or.id" }],
    services: ["Penyelamatan, rehabilitasi, dan pelepasliaran orangutan", "Merawat lebih dari 300 orangutan di dua pusat rehabilitasi"],
    howTo: "Untuk evakuasi, hubungi call center BKSDA Kalimantan Tengah atau Timur. Menurut Menteri Kehutanan, tim penyelamat dapat berasal dari BOSF, OFI, atau Balai KSDA sesuai lokasi.",
    note: "Nomor telepon yang kami temukan sudah lama, jadi tidak ditampilkan. Gunakan situs resmi.",
    source: { label: "RRI, 19 Agustus 2026", url: "https://rri.co.id/voice-of-indonesia/environment/2665508/bos-foundation-cares-for-more-than-300-orangutans-in-kalimantan" },
  },
  {
    id: "yel-socp", name: "YEL–SOCP: Pusat Karantina dan Rehabilitasi Orangutan Sibolangit", kind: "prs", provinces: ["Sumatera Utara"],
    location: "Batu Mbelin, Sibolangit, Kab. Deli Serdang (YEL berkantor di Medan)",
    contacts: [{ type: "web", label: "Situs resmi", value: "https://sumatranorangutan.org" }],
    services: ["Karantina, rehabilitasi, dan reintroduksi orangutan Sumatera", "Dikelola bersama BBKSDA Sumatera Utara"],
    howTo: "Untuk orangutan terluka atau terjebak di Sumatera Utara, hubungi BBKSDA Sumatera Utara; pusat ini dikelola bersama BBKSDA.",
    note: "Nomor telepon belum kami verifikasi. Gunakan situs resmi.",
    source: { label: "Daftar Pusat Rehabilitasi resmi Ditjen KSDAE", url: "https://ksdae.kehutanan.go.id/spesies/lembaga-konservasi/?kategori=pusat-rehabilitasi-satwa" },
  },
  {
    id: "ofi", name: "Orangutan Foundation International", kind: "prs", provinces: ["Kalimantan Tengah"],
    location: "Kalimantan Tengah",
    contacts: [],
    services: ["Tercantum dalam daftar resmi Pusat Rehabilitasi Satwa KSDAE", "Disebut Menteri Kehutanan sebagai bagian tim penyelamat karhutla"],
    howTo: "Hubungi call center BKSDA Kalimantan Tengah: 0811-5218-500.",
    note: "Kontak langsung belum kami verifikasi, jadi tidak ditampilkan.",
    source: { label: "Daftar Pusat Rehabilitasi resmi Ditjen KSDAE", url: "https://ksdae.kehutanan.go.id/spesies/lembaga-konservasi/?kategori=pusat-rehabilitasi-satwa" },
  },
];

const EXTRA: Record<string, Pick<Institution, "service">> = {
  "bksda-kalbar": { service: "Call center penyelamatan satwa 24 jam" },
  "bksda-kalteng": { service: "Call center penyelamatan satwa 24 jam" },
  "bksda-kaltim": { service: "Call center penyelamatan satwa 24 jam" },
  "posko-karhutla": { service: "Laporan asap, titik api, dan pembakaran lahan" },
  "polri-110": { service: "Layanan darurat kepolisian 24 jam" },
  "ditjen-ksdae": { service: "Kebijakan dan data konservasi satwa" },
  "bksda-jakarta": { service: "Evakuasi dan penanganan satwa liar" },
  "pps-tegal-alur": { service: "Pusat penyelamatan satwa" },
  "alobi-babel": { service: "Pusat penyelamatan satwa" },
  "aspinall-sumsel": { service: "Pusat penyelamatan satwa" },
  "yiari-ketapang": { service: "Rehabilitasi dan pelepasliaran orangutan" },
  "yiari-bogor": { service: "Rehabilitasi primata" },
  "bosf": { service: "Rehabilitasi dan pelepasliaran orangutan" },
  "yel-socp": { service: "Karantina dan rehabilitasi orangutan Sumatera" },
  "ofi": { service: "Rehabilitasi orangutan" },
};

export const INSTITUTIONS: Institution[] = RAW.map((r) => ({ ...r, ...EXTRA[r.id] }));

const KIND_ORDER: InstitutionKind[] = ["callcenter", "instansi", "pps", "prs", "posko"];
export const GENERAL_REGION = "Umum (nasional)";

/** Kelompok per wilayah (abjad), lembaga yang bersifat umum/nasional di paling bawah. */
export function groupInstitutions(list: Institution[] = INSTITUTIONS): { region: string; items: Institution[] }[] {
  const regionOf = (i: Institution) => (i.provinces[0] === "Nasional" ? GENERAL_REGION : i.provinces[0]);
  const map = new Map<string, Institution[]>();
  for (const i of list) map.set(regionOf(i), [...(map.get(regionOf(i)) ?? []), i]);
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === GENERAL_REGION ? 1 : b === GENERAL_REGION ? -1 : a.localeCompare(b, "id")))
    .map(([region, items]) => ({ region, items: [...items].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name, "id")) }));
}

/** Tautan yang dapat ditekan untuk sebuah kontak. */
export function contactHref(c: Contact): string {
  if (c.type === "email") return `mailto:${c.value}`;
  if (c.type === "web") return c.value;
  const digits = c.value.replace(/[^\d+]/g, "");
  if (c.type === "wa") return `https://wa.me/${digits.replace(/^\+/, "").replace(/^0/, "62")}`;
  return `tel:${digits}`;
}

export const mapsHref = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

