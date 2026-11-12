import { provinceNames, provinces } from "@/data/locations";

export interface RegionGuess { province: string; city: string }

// Nama dinormalkan: tanpa awalan (Kabupaten/Kota/Provinsi/Administrasi), tanpa spasi dan tanda baca,
// sehingga "Palangka Raya" cocok dengan "Palangkaraya" dan "Jakarta Selatan" dengan "Kota Administrasi Jakarta Selatan".
const norm = (s: string) =>
  s.toLowerCase()
    .replace(/\b(provinsi|kabupaten|kab|kota|administrasi|daerah istimewa|daerah khusus ibukota|dki|di)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");

function matchProvince(state: string): string | null {
  const n = norm(state);
  if (!n) return null;
  return provinceNames.find((p) => norm(p) === n) ?? provinceNames.find((p) => norm(p).includes(n) || n.includes(norm(p))) ?? null;
}

type Cand = { value: string; hint: "kab" | "kota" | null };

function matchCity(province: string, a: Record<string, string>): string | null {
  const cands: Cand[] = [];
  const push = (value: string | undefined, hint: Cand["hint"]) => {
    if (!value) return;
    const explicit = /^kota\b/i.test(value) ? "kota" : /^kab/i.test(value) ? "kab" : hint;
    cands.push({ value, hint: explicit });
  };
  push(a.county, "kab"); push(a.regency, "kab"); push(a.city, "kota"); push(a.municipality, "kota"); push(a.town, null); push(a.state_district, null);

  let best: { name: string; score: number } | null = null;
  for (const option of provinces[province] ?? []) {
    const type = /^kota\b/i.test(option) ? "kota" : "kab";
    for (const c of cands) {
      if (norm(option) !== norm(c.value) || !norm(c.value)) continue;
      const score = 3 + (c.hint === type ? 2 : 0);
      if (!best || score > best.score) best = { name: option, score };
    }
  }
  return best?.name ?? null;
}

/**
 * Menentukan provinsi dan kabupaten/kota dari koordinat lewat Nominatim (OpenStreetMap, gratis).
 * Hasil dicocokkan dengan daftar wilayah di aplikasi. Mengembalikan null bila tidak dikenali.
 */
export async function reverseRegion(lat: number, lng: number, signal?: AbortSignal): Promise<RegionGuess | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=id`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { address?: Record<string, string> };
  const a = data.address;
  if (!a) return null;
  const province = matchProvince(a.state ?? a.province ?? "");
  if (!province) return null;
  return { province, city: matchCity(province, a) ?? "" };
}

