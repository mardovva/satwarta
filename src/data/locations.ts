// Data DUMMY (subset) untuk demonstrasi. Ganti dengan data wilayah lengkap/API nanti.
export const provinces: Record<string, string[]> = {
  Riau: ["Pekanbaru", "Kampar", "Pelalawan", "Siak", "Indragiri Hulu", "Rokan Hilir"],
  Jambi: ["Kota Jambi", "Muaro Jambi", "Batanghari", "Tanjung Jabung Timur", "Merangin"],
  "Sumatera Selatan": ["Palembang", "Ogan Komering Ilir", "Musi Banyuasin", "Banyuasin", "Ogan Ilir"],
  "Kalimantan Barat": ["Pontianak", "Kubu Raya", "Ketapang", "Sintang", "Kapuas Hulu"],
  "Kalimantan Tengah": ["Palangka Raya", "Pulang Pisau", "Kotawaringin Timur", "Kapuas", "Katingan"],
  "Kalimantan Selatan": ["Banjarmasin", "Banjar", "Tanah Laut", "Barito Kuala"],
  "Kalimantan Timur": ["Samarinda", "Balikpapan", "Kutai Kartanegara", "Kutai Timur", "Berau"],
};

export const provinceNames = Object.keys(provinces);
