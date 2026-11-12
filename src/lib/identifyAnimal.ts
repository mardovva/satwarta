import { CONDITION_OTHER, animalConditions, animalTypes } from "@/data/formOptions";

/** Hasil identifikasi yang sudah divalidasi dan siap mengisi formulir. */
export interface Identification {
  isAnimal: boolean;
  animalType: string;       // salah satu animalTypes, atau ""
  animalName: string;
  count: number;            // 0 bila tidak diketahui
  condition: string;        // salah satu animalConditions, CONDITION_OTHER, atau ""
  conditionOther: string;
  confidence: "rendah" | "sedang" | "tinggi";
}

/** Membersihkan keluaran model: hanya nilai yang ada di pilihan formulir yang diterima. */
export function sanitizeIdentification(raw: unknown): Identification {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "");

  const isAnimal = r.isAnimal === true;
  const type = str(r.animalType, 30);
  const animalType = animalTypes.includes(type) && type !== "Tidak diketahui" ? type : "";
  const cond = str(r.condition, 30);
  const note = str(r.conditionNote, 120);

  let condition = "";
  let conditionOther = "";
  if (animalConditions.includes(cond) && cond !== "Tidak diketahui") condition = cond;
  else if (note) { condition = CONDITION_OTHER; conditionOther = note; }

  const n = Math.round(Number(r.count));
  const count = Number.isFinite(n) ? Math.max(0, Math.min(9999, n)) : 0;
  const c = str(r.confidence, 10).toLowerCase();
  const confidence = c === "tinggi" ? "tinggi" : c === "sedang" ? "sedang" : "rendah";

  if (!isAnimal) return { isAnimal: false, animalType: "", animalName: "", count: 0, condition: "", conditionOther: "", confidence };
  return { isAnimal, animalType, animalName: str(r.animalName, 80), count, condition, conditionOther, confidence };
}

/** Kecilkan foto (maks 1024 px, JPEG) sebelum dikirim agar cepat dan hemat kuota. Hanya di browser. */
export async function shrinkImage(file: File, max = 1024): Promise<{ data: string; mimeType: "image/jpeg" }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { data: dataUrl.split(",")[1] ?? "", mimeType: "image/jpeg" };
}

