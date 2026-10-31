import type { StoredReport } from "@/types/report";

// DATA DUMMY untuk demonstrasi tracking. Bukan laporan aktual.
const demoReporter = { name: "Pelapor demo", phone: "", email: "" };

export const dummyTrackingReports: StoredReport[] = [
  {
    id: "SWT-2026-0901", createdAt: "2026-10-12T08:15:00+07:00", status: "Resolved",
    animal: { type: "Mamalia", name: "Gajah Sumatera", count: 2, condition: "Terjebak" },
    location: { province: "Riau", city: "Pelalawan", lat: 0.3, lng: 102.0 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-12T08:15:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-12T13:40:00+07:00", note: "Petugas memeriksa foto dan koordinat lokasi." },
      { status: "Verified", at: "2026-10-13T09:05:00+07:00", note: "Lokasi dan kondisi satwa terkonfirmasi." },
      { status: "In Progress", at: "2026-10-13T15:30:00+07:00", note: "Tim lapangan menuju lokasi untuk evakuasi." },
      { status: "Resolved", at: "2026-10-15T11:20:00+07:00", note: "Satwa berhasil dievakuasi ke area yang aman." },
    ],
  },
  {
    id: "SWT-2026-0902", createdAt: "2026-10-18T10:02:00+07:00", status: "In Progress",
    animal: { type: "Mamalia", name: "Orangutan Kalimantan", count: 1, condition: "Terluka" },
    location: { province: "Kalimantan Tengah", city: "Pulang Pisau", lat: -2.7, lng: 114.2 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-18T10:02:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-18T14:10:00+07:00", note: "Petugas memeriksa laporan dan dokumentasi." },
      { status: "Verified", at: "2026-10-19T08:45:00+07:00", note: "Laporan valid, satwa terlihat terluka di tepi lahan terbakar." },
      { status: "In Progress", at: "2026-10-19T13:00:00+07:00", note: "Tim penyelamat dan dokter hewan sedang menuju lokasi." },
    ],
  },
  {
    id: "SWT-2026-0903", createdAt: "2026-10-27T16:30:00+07:00", status: "Under Review",
    animal: { type: "Burung", name: "Burung Rangkong", count: 3, condition: "Mengungsi" },
    location: { province: "Kalimantan Barat", city: "Ketapang", lat: -1.8, lng: 110.0 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-27T16:30:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-28T09:15:00+07:00", note: "Petugas sedang memeriksa laporan." },
    ],
  },
  {
    id: "SWT-2026-0904", createdAt: "2026-10-20T07:45:00+07:00", status: "Rejected",
    animal: { type: "Tidak diketahui", name: "", count: 1, condition: "Terpapar asap" },
    location: { province: "Jambi", city: "Muaro Jambi", lat: -1.5, lng: 103.9 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-20T07:45:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-20T11:30:00+07:00", note: "Petugas memeriksa laporan." },
      { status: "Rejected", at: "2026-10-21T10:00:00+07:00", note: "Tidak ada foto dan titik lokasi kurang jelas, sehingga laporan tidak dapat diverifikasi." },
    ],
  },
  {
    id: "SWT-2026-0905", createdAt: "2026-10-24T12:20:00+07:00", status: "Verified",
    animal: { type: "Mamalia", name: "Beruang Madu", count: 1, condition: "Ditemukan mati" },
    location: { province: "Kalimantan Timur", city: "Kutai Kartanegara", lat: -0.4, lng: 116.8 }, photos: [], reporter: demoReporter,
    history: [
      { status: "Submitted", at: "2026-10-24T12:20:00+07:00", note: "Laporan berhasil dikirim." },
      { status: "Under Review", at: "2026-10-24T15:00:00+07:00", note: "Petugas memeriksa foto dokumentasi." },
      { status: "Verified", at: "2026-10-25T09:30:00+07:00", note: "Laporan valid. Menunggu penjadwalan penanganan." },
    ],
  },
];
