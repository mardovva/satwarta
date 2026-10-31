import type { FeatureCollection, Point } from "geojson";

// DATA SIMULASI untuk visualisasi hotspot, BUKAN data aktual karhutla.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clusters = [
  { lng: 101.8, lat: 0.6, n: 9, spread: 1.0 },   // Riau
  { lng: 103.5, lat: -1.6, n: 7, spread: 0.8 },  // Jambi
  { lng: 104.6, lat: -3.3, n: 9, spread: 1.0 },  // Sumatera Selatan
  { lng: 113.6, lat: -2.3, n: 11, spread: 1.3 }, // Kalimantan Tengah
  { lng: 110.3, lat: -0.2, n: 8, spread: 1.0 },  // Kalimantan Barat
  { lng: 116.4, lat: 0.6, n: 6, spread: 0.9 },   // Kalimantan Timur
  { lng: 115.3, lat: -3.0, n: 6, spread: 0.8 },  // Kalimantan Selatan
];

function build(): FeatureCollection<Point, { intensity: number }> {
  const rand = mulberry32(2026);
  const features = clusters.flatMap((c) =>
    Array.from({ length: c.n }, () => ({
      type: "Feature" as const,
      properties: { intensity: 1 + Math.floor(rand() * 3) },
      geometry: {
        type: "Point" as const,
        coordinates: [c.lng + (rand() - 0.5) * 2 * c.spread, c.lat + (rand() - 0.5) * 2 * c.spread],
      },
    }))
  );
  return { type: "FeatureCollection", features };
}

export const dummyHotspots = build();
