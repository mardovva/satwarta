/**
 * Skrip yang dijalankan paling awal (di <head>) agar Beranda yang di-REFRESH selalu mulai dari paling atas.
 * Secara bawaan browser memulihkan posisi gulir terakhir (mis. tetap di bagian Lacak atau FAQ) dan tautan #bagian
 * ikut membuat halaman melompat ke bagian itu.
 *
 * Aturan (sengaja sempit agar tidak mengganggu navigasi lain):
 *  - hanya di Beranda ("/") dan hanya bila halaman dimuat lewat refresh (navigation type "reload");
 *  - membuka tautan /#track, tombol Back/Forward, atau berpindah dari halaman lain berjalan seperti biasa;
 *  - #hash dibuang dari alamat, lalu halaman digulir ke atas; pemulihan gulir bawaan dikembalikan ke "auto" setelah halaman dimuat.
 */
export const HOME_SCROLL_RESET = `(function(){try{
if(location.pathname!=="/")return;
var n=performance.getEntriesByType("navigation")[0];
if(!n||n.type!=="reload")return;
history.scrollRestoration="manual";
if(location.hash)history.replaceState(history.state,"",location.pathname+location.search);
window.scrollTo(0,0);
window.addEventListener("load",function(){window.scrollTo(0,0);setTimeout(function(){history.scrollRestoration="auto"},0)});
}catch(e){}})();`;

