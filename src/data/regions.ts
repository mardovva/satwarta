// Pengelompokan provinsi untuk memilih wilayah kerja petugas.
export const provinceGroups: { label: string; provinces: string[] }[] = [
  { label: "Sumatera", provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung"] },
  { label: "Jawa", provinces: ["Banten", "Daerah Khusus Ibukota Jakarta", "Jawa Barat", "Jawa Tengah", "Daerah Istimewa Yogyakarta", "Jawa Timur"] },
  { label: "Bali & Nusa Tenggara", provinces: ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"] },
  { label: "Kalimantan", provinces: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"] },
  { label: "Sulawesi", provinces: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"] },
  { label: "Maluku", provinces: ["Maluku", "Maluku Utara"] },
  { label: "Papua", provinces: ["Papua", "Papua Barat", "Papua Barat Daya", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"] },
];
