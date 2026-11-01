// Konten berita. Ganti `image` dengan gambar lokal bila sudah ada.
export type NewsCategory = "Berita Karhutla" | "Edukasi Satwa" | "Konservasi" | "Data Hotspot" | "Statistik";

export const newsCategories: NewsCategory[] = ["Berita Karhutla", "Edukasi Satwa", "Konservasi", "Data Hotspot", "Statistik"];

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  date: string; // ISO
  summary: string;
  body: string[];
  image?: string; // path di /public, opsional
}

export const dummyNews: NewsArticle[] = [
  {
    id: "n1", category: "Edukasi Satwa", date: "2026-10-28T08:00:00+07:00",
    title: "Menemukan satwa liar terluka? Ini langkah aman yang bisa dilakukan",
    summary: "Jaga jarak, jangan memberi makan, dan segera laporkan lokasi serta kondisinya kepada petugas.",
    body: [
      "Satwa liar yang terluka atau panik bisa bereaksi membahayakan, baik bagi Anda maupun bagi satwa itu sendiri. Utamakan keselamatan dan jaga jarak yang aman.",
      "Jangan menyentuh, mengejar, atau memaksa memberi makan dan minum. Ambil foto dari jarak aman, catat lokasi sedetail mungkin, lalu laporkan melalui formulir Satwarta atau hubungi petugas terkait.",
    ],
  },
  {
    id: "n2", category: "Berita Karhutla", date: "2026-10-26T09:30:00+07:00",
    title: "Musim kemarau dan meningkatnya kewaspadaan terhadap kebakaran lahan",
    summary: "Kondisi kering membuat lahan, terutama lahan gambut, lebih mudah terbakar dan sulit dipadamkan.",
    body: [
      "Pada musim kemarau, vegetasi dan tanah yang mengering meningkatkan risiko kebakaran lahan. Lahan gambut yang terbakar dapat membara di bawah permukaan dan menghasilkan asap dalam waktu lama.",
    ],
  },
  {
    id: "n3", category: "Data Hotspot", date: "2026-10-24T10:00:00+07:00",
    title: "Hotspot bukan selalu titik api: memahami data satelit",
    summary: "Hotspot adalah indikasi anomali suhu dari satelit yang masih perlu dipastikan di lapangan.",
    body: [
      "Hotspot menunjukkan area dengan suhu permukaan yang lebih tinggi dari sekitarnya menurut sensor satelit. Tidak semua hotspot berarti kebakaran, dan tidak semua kebakaran selalu terdeteksi.",
      "Karena itu, laporan masyarakat dan verifikasi petugas di lapangan melengkapi data satelit. Layer hotspot pada peta Satwarta menampilkan deteksi satelit NASA FIRMS.",
    ],
  },
  {
    id: "n4", category: "Konservasi", date: "2026-10-22T11:15:00+07:00",
    title: "Mengapa hutan dan lahan gambut penting bagi satwa dan iklim",
    summary: "Hutan menjadi rumah bagi banyak satwa, sementara lahan gambut menyimpan karbon dalam jumlah besar.",
    body: [
      "Hutan menyediakan makanan, tempat berlindung, dan jalur jelajah bagi satwa. Ketika habitat terbakar, satwa kehilangan rumah dan sumber pakan, sehingga lebih sering terpaksa keluar ke permukiman.",
      "Lahan gambut menyimpan karbon dalam jumlah besar. Menjaganya tetap basah membantu mencegah kebakaran sekaligus melindungi habitat.",
    ],
  },
  {
    id: "n5", category: "Statistik", date: "2026-10-20T13:00:00+07:00",
    title: "Membaca statistik dampak satwa: apa yang dihitung, apa yang belum",
    summary: "Angka laporan hanya mencerminkan kejadian yang terlaporkan, bukan seluruh dampak sebenarnya.",
    body: [
      "Statistik dari laporan masyarakat bergantung pada siapa yang melapor dan seberapa mudah lokasi dijangkau. Karena itu, angka laporan cenderung lebih rendah dari dampak sebenarnya.",
      "Angka pada halaman beranda Satwarta sebaiknya dibaca sebagai gambaran dari laporan yang masuk.",
    ],
  },
  {
    id: "n6", category: "Edukasi Satwa", date: "2026-10-18T14:30:00+07:00",
    title: "Mengenal satwa kunci di hutan Sumatera dan Kalimantan",
    summary: "Orangutan, harimau sumatera, gajah, beruang madu, rangkong, dan tapir bergantung pada hutan yang utuh.",
    body: [
      "Hutan Sumatera dan Kalimantan menjadi habitat bagi satwa seperti orangutan, harimau sumatera, gajah sumatera, beruang madu, burung rangkong, dan tapir.",
      "Satwa-satwa ini membutuhkan wilayah jelajah yang luas dan berperan menjaga keseimbangan ekosistem, misalnya dengan menyebarkan biji tumbuhan.",
    ],
  },
];
