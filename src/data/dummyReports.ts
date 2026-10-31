import type { WildlifeReport } from "@/types/report";

// DUMMY DATA — bukan data aktual. Ganti dengan data backend nanti.
export const dummyStats = { dead: 260, affected: 752, rescued: 116 };

export const dummyReports: WildlifeReport[] = [
  { id: "r1", animal: "Gajah Sumatera", emoji: "🐘", reportType: "Satwa terdampak", location: "Riau", lng: 101.7, lat: 0.5, date: "12 Okt 2026", status: "Terverifikasi", description: "Kawanan gajah terlihat keluar dari area hutan yang terbakar." },
  { id: "r2", animal: "Orangutan", emoji: "🦧", reportType: "Satwa terselamatkan", location: "Kalimantan Tengah", lng: 113.9, lat: -2.2, date: "14 Okt 2026", status: "Dalam Penanganan", description: "Orangutan dievakuasi dari lahan gambut yang terbakar." },
  { id: "r3", animal: "Harimau Sumatera", emoji: "🐅", reportType: "Satwa terdampak", location: "Sumatera Selatan", lng: 104.0, lat: -3.3, date: "9 Okt 2026", status: "Menunggu Verifikasi", description: "Jejak harimau dilaporkan warga di dekat area kebakaran." },
  { id: "r4", animal: "Beruang Madu", emoji: "🐻", reportType: "Satwa mati terbakar", location: "Kalimantan Timur", lng: 116.5, lat: 0.5, date: "7 Okt 2026", status: "Selesai", description: "Bangkai beruang madu ditemukan di tepi hutan terbakar." },
  { id: "r5", animal: "Burung Rangkong", emoji: "🦅", reportType: "Satwa terdampak", location: "Kalimantan Barat", lng: 110.4, lat: 0.0, date: "16 Okt 2026", status: "Terverifikasi", description: "Rangkong terlihat kehilangan sarang akibat kebakaran." },
  { id: "r6", animal: "Tapir", emoji: "🐗", reportType: "Satwa terselamatkan", location: "Jambi", lng: 103.6, lat: -1.6, date: "11 Okt 2026", status: "Selesai", description: "Tapir diselamatkan warga dan diserahkan ke petugas." },
];
