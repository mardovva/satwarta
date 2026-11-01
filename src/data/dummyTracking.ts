import type { HistoryPhoto, StoredReport } from "@/types/report";
import { placeholderPhoto } from "@/lib/placeholderPhoto";

// Laporan yang sudah ada. Foto: "pelapor" = dari pengirim laporan, "petugas" = bukti dari petugas.
const OFFICERS = {
  riaujambi: { username: "petugas.riaujambi", name: "Petugas Riau–Jambi", agency: "Tim Penyelamatan Satwa Riau–Jambi" },
  kalteng: { username: "petugas.kalteng", name: "Petugas Kalimantan Tengah–Selatan", agency: "Tim Penyelamatan Satwa Kalimantan Tengah–Selatan" },
  kalbar: { username: "petugas.kalbar", name: "Petugas Kalimantan Barat–Timur", agency: "Tim Penyelamatan Satwa Kalimantan Barat–Timur" },
};
const rp = (emoji: string, title: string): HistoryPhoto => ({ url: placeholderPhoto(emoji, title, "pelapor"), caption: "Foto dari pelapor" });
const op = (emoji: string, title: string): HistoryPhoto => ({ url: placeholderPhoto(emoji, title, "petugas"), caption: "Dokumentasi petugas" });
const demoReporter = { name: "Warga setempat", phone: "", email: "" };

export const dummyTrackingReports: StoredReport[] = [
  {
    id: "SWT-2026-0901", createdAt: "2026-10-12T08:15:00+07:00", status: "Resolved",
    animal: { type: "Mamalia", name: "Gajah Sumatera", count: 2, condition: "Terjebak" },
    location: { province: "Riau", city: "Kabupaten Pelalawan", lat: 0.3, lng: 102.0 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-12T08:15:00+07:00", note: "Laporan berhasil dikirim." , photos: [rp("🐘", "Gajah terjebak di area terbakar"), rp("🔥", "Kondisi lahan di sekitar lokasi")] },
      { status: "Under Review", at: "2026-10-12T13:40:00+07:00", officer: OFFICERS.riaujambi, note: "Petugas memeriksa foto dan koordinat lokasi." },
      { status: "Verified", at: "2026-10-13T09:05:00+07:00", officer: OFFICERS.riaujambi, note: "Lokasi dan kondisi satwa terkonfirmasi." },
      { status: "In Progress", at: "2026-10-13T15:30:00+07:00", officer: OFFICERS.riaujambi, note: "Tim lapangan menuju lokasi untuk evakuasi." , photos: [op("🚙", "Tim lapangan tiba di lokasi")] },
      { status: "Resolved", at: "2026-10-15T11:20:00+07:00", officer: OFFICERS.riaujambi, note: "Satwa berhasil dievakuasi ke area yang aman." , photos: [op("🐘", "Gajah berhasil dievakuasi"), op("🌳", "Dilepasliarkan di area yang aman")] },
    ],
  },
  {
    id: "SWT-2026-0902", createdAt: "2026-10-18T10:02:00+07:00", status: "In Progress",
    animal: { type: "Mamalia", name: "Orangutan Kalimantan", count: 1, condition: "Terluka" },
    location: { province: "Kalimantan Tengah", city: "Kabupaten Pulang Pisau", lat: -2.7, lng: 114.2 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-18T10:02:00+07:00", note: "Laporan berhasil dikirim." , photos: [rp("🦧", "Orangutan terluka di tepi lahan"), rp("🌫️", "Asap di sekitar lokasi")] },
      { status: "Under Review", at: "2026-10-18T14:10:00+07:00", officer: OFFICERS.kalteng, note: "Petugas memeriksa laporan dan dokumentasi." },
      { status: "Verified", at: "2026-10-19T08:45:00+07:00", officer: OFFICERS.kalteng, note: "Laporan valid, satwa terlihat terluka di tepi lahan terbakar." },
      { status: "In Progress", at: "2026-10-19T13:00:00+07:00", officer: OFFICERS.kalteng, note: "Tim penyelamat dan dokter hewan sedang menuju lokasi." , photos: [op("🩺", "Pemeriksaan oleh dokter hewan")] },
    ],
  },
  {
    id: "SWT-2026-0903", createdAt: "2026-10-27T16:30:00+07:00", status: "Under Review",
    animal: { type: "Burung", name: "Burung Rangkong", count: 3, condition: "Mengungsi" },
    location: { province: "Kalimantan Barat", city: "Kabupaten Ketapang", lat: -1.8, lng: 110.0 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-27T16:30:00+07:00", note: "Laporan berhasil dikirim." , photos: [rp("🦅", "Kawanan rangkong mengungsi")] },
      { status: "Under Review", at: "2026-10-28T09:15:00+07:00", officer: OFFICERS.kalbar, note: "Petugas sedang memeriksa laporan." },
    ],
  },
  {
    id: "SWT-2026-0904", createdAt: "2026-10-20T07:45:00+07:00", status: "Rejected",
    animal: { type: "Tidak diketahui", name: "", count: 1, condition: "Terpapar asap" },
    location: { province: "Jambi", city: "Kabupaten Muaro Jambi", lat: -1.5, lng: 103.9 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-20T07:45:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-20T11:30:00+07:00", officer: OFFICERS.riaujambi, note: "Petugas memeriksa laporan." },
      { status: "Rejected", at: "2026-10-21T10:00:00+07:00", officer: OFFICERS.riaujambi, note: "Tidak ada foto dan titik lokasi kurang jelas, sehingga laporan tidak dapat diverifikasi." },
    ],
  },
  {
    id: "SWT-2026-0905", createdAt: "2026-10-24T12:20:00+07:00", status: "Verified",
    animal: { type: "Mamalia", name: "Beruang Madu", count: 1, condition: "Ditemukan mati" },
    location: { province: "Kalimantan Timur", city: "Kabupaten Kutai Kartanegara", lat: -0.4, lng: 116.8 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-24T12:20:00+07:00", note: "Laporan berhasil dikirim." , photos: [rp("🐻", "Lokasi penemuan satwa")] },
      { status: "Under Review", at: "2026-10-24T15:00:00+07:00", officer: OFFICERS.kalbar, note: "Petugas memeriksa foto dokumentasi." },
      { status: "Verified", at: "2026-10-25T09:30:00+07:00", officer: OFFICERS.kalbar, note: "Laporan valid. Menunggu penjadwalan penanganan." },
    ],
  },
];
