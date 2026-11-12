import Link from "next/link";
import Decor from "@/components/layout/Decor";

/** Lama data kontak pelapor disimpan setelah laporan final (harus sama dengan angka pada jadwal pg_cron di supabase/migrations/004). */
const RETENTION_MONTHS = 12;

const H2 = "mt-8 text-xl font-bold tracking-tight text-primary first:mt-0";
const P = "mt-2 leading-relaxed text-ink/80";
const UL = "mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/80 marker:text-primary/50";

function Row({ who, sees }: { who: string; sees: string }) {
  return (
    <tr className="border-t border-primary/10 align-top">
      <th scope="row" className="py-2.5 pr-4 text-left font-semibold text-ink">{who}</th>
      <td className="py-2.5 text-ink/80">{sees}</td>
    </tr>
  );
}

export default function PrivacyPage() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <div className="relative pb-24 pt-24 sm:pt-28">
      <Decor flip src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-left-3 top-24 hidden w-[8rem] md:block lg:-left-5 lg:w-[13.125rem]" />
      <Decor src="/images/branches/dry-branch.png" width={192} height={140} sway="right top" className="-right-3 top-24 hidden w-[8rem] md:block lg:-right-5 lg:w-[13.125rem]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-3xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.12)] sm:text-5xl">Kebijakan Privasi</h1>
        </header>

        <article className="mt-8 rounded-3xl bg-white/90 p-6 text-[0.9375rem] shadow-sm ring-1 ring-black/5 backdrop-blur-xl sm:p-9">
          <h2 className={H2}>1. Tentang Satwarta</h2>
          <p className={P}>Satwarta adalah platform untuk melaporkan dan memantau penanganan satwa liar yang terdampak kebakaran hutan dan lahan. Kebijakan ini menjelaskan data pribadi apa yang kami proses, untuk apa, siapa yang dapat melihatnya, dan hak Anda atas data tersebut, sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.</p>

          <h2 className={H2}>2. Data yang kami kumpulkan</h2>
          <p className={P}><strong>Saat Anda mengirim laporan:</strong></p>
          <ul className={UL}>
            <li>Nama pelapor, nomor telepon, dan email (opsional).</li>
            <li>Jenis, jumlah, nama, dan kondisi satwa; provinsi, kabupaten/kota, titik koordinat lokasi, dan detail lokasi (patokan atau alamat tambahan, bila Anda isi).</li>
            <li>Foto dokumentasi (maksimal 8). Metadata foto, termasuk koordinat GPS di dalamnya, dihapus di perangkat Anda sebelum foto diunggah.</li>
            <li>Waktu pengiriman dan persetujuan Anda atas penggunaan data.</li>
          </ul>
          <p className={P}><strong>Secara otomatis:</strong> alamat IP diproses sementara untuk membatasi penyalahgunaan dan memverifikasi CAPTCHA, dan dapat tercatat pada log penyedia hosting kami. Kami tidak menyimpan alamat IP di basis data laporan.</p>
          <p className={P}><strong>Untuk petugas:</strong> nama, instansi, email akun, wilayah kerja, serta catatan kegiatan (misalnya perubahan status laporan dan pengelolaan akun).</p>
          <p className={P}><strong>Di browser Anda:</strong> kami menyimpan daftar nomor laporan yang Anda kirim dari perangkat ini, riwayat percakapan dengan asisten AI, pilihan tampilan, dan (khusus petugas) token sesi masuk. Data ini disimpan di penyimpanan lokal browser Anda untuk menjalankan fitur, bukan untuk melacak Anda, dan dapat dihapus lewat pengaturan browser. Data donasi yang Anda isi saat ini hanya tersimpan di browser Anda dan tidak dikirim ke server kami.</p>

          <h2 className={H2}>3. Untuk apa data digunakan</h2>
          <ul className={UL}>
            <li>Meneruskan laporan ke petugas atau lembaga yang berwenang di wilayah tersebut dan menghubungi Anda bila diperlukan untuk verifikasi atau informasi tambahan.</li>
            <li>Menampilkan peta, statistik, dan status penanganan kepada publik (tanpa data kontak Anda).</li>
            <li>Menjaga keamanan layanan dan mencegah penyalahgunaan.</li>
          </ul>
          <p className={P}>Dasar pemrosesan adalah persetujuan Anda yang diberikan melalui kotak centang pada formulir laporan. Anda dapat menarik persetujuan tersebut kapan saja (lihat bagian Hak Anda).</p>

          <h2 className={H2}>4. Siapa yang dapat melihat data</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <Row who="Publik (siapa saja)" sees="Jenis, jumlah, dan kondisi satwa; foto; status dan riwayat penanganan beserta nama dan instansi petugas yang menangani; lokasi perkiraan (dibulatkan sekitar 1 km). Tidak termasuk nama, telepon, email pelapor, maupun detail lokasi." />
                <Row who="Petugas regional" sees="Laporan lengkap di wilayah kerjanya, termasuk kontak pelapor, lokasi tepat, dan detail lokasi." />
                <Row who="Petugas lembaga pusat (nasional)" sees="Laporan lengkap dari semua wilayah." />
                <Row who="Admin Satwarta" sees="Seluruh laporan, serta pengelolaan akun petugas dan log kegiatan." />
              </tbody>
            </table>
          </div>
          <p className={P}>Mohon tidak mengunggah foto yang memperlihatkan wajah orang atau pelat nomor kendaraan. Foto yang Anda unggah dapat dilihat publik.</p>

          <h2 className={H2}>5. Penyedia layanan yang memproses data</h2>
          <p className={P}>Kami memakai penyedia layanan berikut. Sebagian berada atau memproses data di luar Indonesia.</p>
          <ul className={UL}>
            <li><strong>Supabase</strong>: basis data, penyimpanan foto, dan login petugas.</li>
            <li><strong>Vercel</strong>: hosting aplikasi dan log akses.</li>
            <li><strong>Cloudflare Turnstile</strong>: CAPTCHA pada formulir laporan (menerima token verifikasi dan alamat IP).</li>
            <li><strong>Google (Gemini API)</strong>: asisten AI dan analisis foto (lihat bagian 6).</li>
            <li><strong>OpenStreetMap, Esri, dan Nominatim</strong>: ubin peta dan pencarian lokasi. Browser Anda meminta ubin peta langsung ke penyedia ini sehingga alamat IP dan area peta yang Anda lihat dapat terlihat oleh mereka.</li>
            <li><strong>Fontshare</strong>: huruf (font) situs; browser Anda memuatnya langsung dari penyedia tersebut.</li>
            <li><strong>NASA FIRMS</strong>: data titik panas. Tidak ada data pribadi yang dikirim ke layanan ini.</li>
          </ul>

          <h2 className={H2}>6. Fitur kecerdasan buatan (AI)</h2>
          <p className={P}>Dua fitur memakai Google Gemini API: asisten &ldquo;Satwarta AI&rdquo; (teks pertanyaan Anda dan, bila Anda memilih, keterangan status laporan) dan analisis foto pada formulir laporan (foto yang Anda pilih, untuk membantu mengisi jenis dan kondisi satwa). Kami tidak menyimpan percakapan AI di server kami.</p>
          <p className={P}>Menurut ketentuan layanan Google, bergantung pada paket yang digunakan pengelola, Google dapat memakai masukan dan jawaban untuk meningkatkan produknya, termasuk peninjauan oleh manusia. Karena itu, <strong>jangan memasukkan data pribadi (nama, telepon, alamat rumah) ke dalam percakapan AI dan hindari mengunggah foto yang memperlihatkan wajah orang.</strong> Jawaban AI bersifat panduan umum dan tidak menggantikan petugas atau dokter hewan.</p>

          <h2 className={H2}>7. Lama penyimpanan</h2>
          <ul className={UL}>
            <li><strong>Data kontak pelapor</strong> (nama, telepon, email) dihapus atau dianonimkan {RETENTION_MONTHS} bulan setelah laporan berstatus selesai atau ditolak. Laporan yang masih berjalan disimpan selama penanganan berlangsung.</li>
            <li><strong>Keterangan satwa, lokasi, foto, dan riwayat penanganan</strong> disimpan sebagai catatan konservasi dan statistik, tanpa data kontak setelah dianonimkan. Foto dapat dihapus atas permintaan.</li>
            <li><strong>Akun dan log kegiatan petugas</strong> disimpan selama akun aktif dan dapat disimpan lebih lama untuk keperluan audit keamanan.</li>
          </ul>

          <h2 className={H2}>8. Hak Anda</h2>
          <p className={P}>Sesuai undang-undang yang berlaku, Anda berhak untuk mengakses data pribadi Anda, memperbaikinya, meminta penghapusan atau penganoniman, menarik persetujuan, serta mengajukan keberatan atas pemrosesan data Anda. Sertakan nomor laporan (mis. SWT-2026-0001) dalam permintaan Anda agar kami dapat menemukan data yang dimaksud.</p>
          <p className={P}>
            {contact
              ? <>Sampaikan permintaan Anda ke <a href={`mailto:${contact}`} className="font-semibold text-primary underline">{contact}</a>.</>
              : <>Sampaikan permintaan Anda melalui kontak pengelola Satwarta yang tertera pada tautan media sosial di bagian bawah situs.</>}
            {" "}Kami akan menanggapi dalam waktu yang wajar. Informasi yang sudah diterbitkan tanpa data pribadi (misalnya jumlah satwa pada statistik) dapat tetap disimpan.
          </p>

          <h2 className={H2}>9. Keamanan</h2>
          <p className={P}>Koneksi ke situs menggunakan HTTPS. Data kontak pelapor hanya dapat diakses lewat server kami oleh akun petugas yang berwenang; basis data tidak dapat dibaca langsung dari browser. Akses petugas dibatasi menurut wilayah kerja dan setiap pengelolaan akun dicatat. Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko; jika kami mengetahui adanya kebocoran data pribadi, kami akan menindaklanjutinya sesuai ketentuan yang berlaku.</p>

          <h2 className={H2}>10. Anak-anak</h2>
          <p className={P}>Jika Anda berusia di bawah 18 tahun, mintalah orang tua atau wali untuk mendampingi Anda saat mengirim laporan.</p>

          <h2 className={H2}>11. Perubahan kebijakan</h2>
          <p className={P}>Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.</p>

          <p className="mt-8 text-sm text-ink/60">Kembali ke <Link href="/" className="font-semibold text-primary underline">beranda</Link>.</p>
        </article>
      </div>
    </div>
  );
}
