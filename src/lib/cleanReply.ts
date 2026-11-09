/** Merapikan jawaban AI sebelum ditampilkan (hanya di server): buang aksara asing yang kadang menyelip dan tanda * tunggal. */
export function cleanReply(text: string): string {
  return text
    .replace(/[\u2E80-\u9FFF\uA000-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/g, "")   // aksara CJK/Hangul yang tersasar
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, "$1")                              // *miring* tunggal -> teks biasa (hanya **tebal** yang dirender)
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
