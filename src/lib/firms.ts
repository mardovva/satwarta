import type { FeatureCollection, Point } from "geojson";

// NASA FIRMS Area API: /api/area/csv/[MAP_KEY]/[SOURCE]/[west,south,east,north]/[DAY_RANGE]
export const FIRMS_SOURCE = "VIIRS_SNPP_NRT";
export const FIRMS_DAY_RANGE = 2;
export const FIRMS_AREA = "94,-11.5,141.5,6.5"; // wilayah Indonesia

export interface HotspotProps {
  intensity: number; // 1-3, dari FRP (untuk ukuran lingkaran)
  frp: number;
  confidence: string;
  date: string;
  time: string; // HH:MM UTC
  satellite: string;
}

export interface HotspotFeed {
  data: FeatureCollection<Point, HotspotProps>;
  meta: { source: string; dayRange: number; count: number; fetchedAt: string };
}

/** Ubah CSV FIRMS menjadi GeoJSON. Deteksi berkeyakinan rendah (VIIRS "l") dibuang. */
export function parseFirmsCsv(csv: string): FeatureCollection<Point, HotspotProps> {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const col = (name: string) => header.indexOf(name);
  const iLat = col("latitude"), iLng = col("longitude"), iFrp = col("frp"), iConf = col("confidence");
  const iDate = col("acq_date"), iTime = col("acq_time"), iSat = col("satellite");

  const features: FeatureCollection<Point, HotspotProps>["features"] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const c = line.split(",");
    const lat = parseFloat(c[iLat]);
    const lng = parseFloat(c[iLng]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const conf = (c[iConf] ?? "").trim().toLowerCase();
    if (conf === "l") continue;
    const frp = parseFloat(c[iFrp]);
    const time = (c[iTime] ?? "").trim().padStart(4, "0");

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        intensity: frp >= 20 ? 3 : frp >= 5 ? 2 : 1,
        frp: Number.isFinite(frp) ? frp : 0,
        confidence: conf === "h" ? "tinggi" : conf === "n" ? "nominal" : conf,
        date: (c[iDate] ?? "").trim(),
        time: `${time.slice(0, 2)}:${time.slice(2)}`,
        satellite: (c[iSat] ?? "").trim(),
      },
    });
  }
  return { type: "FeatureCollection", features };
}
