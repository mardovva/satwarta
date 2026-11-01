// Akun petugas untuk login di sisi frontend (tanpa backend). Kata sandi disimpan sebagai hash SHA-256
// dengan awalan "satwarta:". Ini hanya penghalang tampilan; autentikasi yang aman membutuhkan backend
// (mis. Supabase Auth). Buat hash baru dengan:
//   node -e "console.log(require('crypto').createHash('sha256').update('satwarta:' + 'KATA_SANDI').digest('hex'))"
export interface OfficerAccount {
  username: string;
  name: string;
  agency: string;
  /** Wilayah kerja awal (nama provinsi). Petugas dapat mengubahnya di dasbor. */
  regions: string[];
  passwordHash: string;
}

const HASH = "dab9429c3b36d88040a0d06b9a1dd668f408b1a9ac4601306ad5428c5985501f";

export const officerAccounts: OfficerAccount[] = [
  { username: "petugas.riaujambi", name: "Petugas Riau–Jambi", agency: "Tim Penyelamatan Satwa Riau–Jambi", regions: ["Riau", "Jambi"], passwordHash: HASH },
  { username: "petugas.sumsel", name: "Petugas Sumatera Selatan", agency: "Tim Penyelamatan Satwa Sumatera Selatan", regions: ["Sumatera Selatan", "Bengkulu", "Lampung"], passwordHash: HASH },
  { username: "petugas.kalteng", name: "Petugas Kalimantan Tengah–Selatan", agency: "Tim Penyelamatan Satwa Kalimantan Tengah–Selatan", regions: ["Kalimantan Tengah", "Kalimantan Selatan"], passwordHash: HASH },
  { username: "petugas.kalbar", name: "Petugas Kalimantan Barat–Timur", agency: "Tim Penyelamatan Satwa Kalimantan Barat–Timur", regions: ["Kalimantan Barat", "Kalimantan Timur"], passwordHash: HASH },
];

export const findAccount = (username: string) => officerAccounts.find((a) => a.username === username);
