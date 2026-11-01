"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { Maximize2, X } from "lucide-react";
import type { HotspotFeed } from "@/lib/firms";
import { REPORTS_UPDATED_EVENT } from "@/lib/reports";
import { getAllReports } from "@/lib/tracking";
import type { LatLng, MapMode } from "@/types/report";
import { loadPhotos } from "@/lib/photoStore";
import { createMarkerElement, setMarkerPhoto } from "./MapMarker";
import { createHotspotPopupContent, createReportPopupContent, setPopupPhoto } from "./MapPopup";
import MapLegend, { type Basemap, type HotspotStatus } from "./MapLegend";

interface IndonesiaMapProps {
  mode?: MapMode;
  /** Hanya mode monitoring */
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Dipanggil saat "Lihat Detail" pada popup laporan diklik (mode monitoring). */
  onViewDetail?: (reportId: string) => void;
  /** Hanya tampilkan laporan dari provinsi ini (mis. wilayah kerja petugas). Kosongkan untuk semua. */
  regions?: string[];
  /** Hanya mode location-picker. Simpan nilai persis seperti yang diberikan onPick (jangan dibulatkan). */
  pickedLocation?: LatLng | null;
  onPick?: (p: LatLng) => void;
}

// Seluruh Indonesia, tepat di tengah peta
const INDONESIA_BOUNDS: maplibregl.LngLatBoundsLike = [[95, -11.5], [141, 6.5]];

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";

// Basemap tanpa API key. Satelit: Esri World Imagery (+ label). Peta: OpenStreetMap.
// Ganti `tiles` di sini bila ingin penyedia lain.
const style: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
    satellite: {
      type: "raster", tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`], tileSize: 256, maxzoom: 19,
      attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
    labels: {
      type: "raster", tiles: [`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`], tileSize: 256, maxzoom: 19,
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm", layout: { visibility: "none" } },
    { id: "satellite", type: "raster", source: "satellite" },
    { id: "labels", type: "raster", source: "labels" },
  ],
};

const locale = {
  "CooperativeGesturesHandler.WindowsHelpText": "Gunakan Ctrl + scroll untuk memperbesar peta",
  "CooperativeGesturesHandler.MacHelpText": "Gunakan ⌘ + scroll untuk memperbesar peta",
  "CooperativeGesturesHandler.MobileHelpText": "Gunakan dua jari untuk menggeser peta",
};

const emptyFC: FeatureCollection = { type: "FeatureCollection", features: [] };

export default function IndonesiaMap({ mode = "monitoring", fullscreen = false, onToggleFullscreen, onViewDetail, regions, pickedLocation = null, onPick }: IndonesiaMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const onViewDetailRef = useRef(onViewDetail);
  const regionsRef = useRef(regions);
  const renderRef = useRef<(() => void) | null>(null);
  const photoUrls = useRef<string[]>([]);
  const renderGen = useRef(0);
  const regionKey = regions ? regions.join("|") : "*";
  const pickMarker = useRef<maplibregl.Marker | null>(null);
  const ownPick = useRef<LatLng | null>(null);
  const onPickRef = useRef(onPick);
  const [basemap, setBasemap] = useState<Basemap>("satelit");
  const [hotspot, setHotspot] = useState<HotspotStatus>({ state: "loading" });
  const [ready, setReady] = useState(false);
  const monitoring = mode === "monitoring";

  useEffect(() => { onPickRef.current = onPick; }, [onPick]);
  useEffect(() => { onViewDetailRef.current = onViewDetail; }, [onViewDetail]);
  useEffect(() => { regionsRef.current = regions; renderRef.current?.(); }, [regionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inisialisasi peta (sekali per mode) + cleanup.
  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    let removeReportListeners = () => {};
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const map = new maplibregl.Map({
      container: container.current,
      style,
      bounds: INDONESIA_BOUNDS,
      fitBoundsOptions: { padding: 8 },
      minZoom: 2,
      maxZoom: 18,
      cooperativeGestures: mode === "location-picker" || coarse,
      locale,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");

    // Atribusi tetap ada (tombol "i"), tetapi tertutup secara default sampai pengguna membukanya.
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    const host = container.current;
    const attrib = host.querySelector<HTMLElement>(".maplibregl-ctrl-attrib");
    let attribTouched = false;
    const collapseAttribution = () => {
      if (attribTouched || !attrib) return;
      // Hanya ubah bila perlu: classList.remove pada class yang tidak ada tetap memicu mutation record,
      // yang akan memanggil observer ini lagi tanpa henti dan membekukan halaman.
      if (attrib.hasAttribute("open")) attrib.removeAttribute("open");
      if (attrib.classList.contains("maplibregl-compact-show")) attrib.classList.remove("maplibregl-compact-show");
    };
    attrib?.querySelector(".maplibregl-ctrl-attrib-button")?.addEventListener("click", () => { attribTouched = true; });
    const attribObserver = new MutationObserver(collapseAttribution);
    if (attrib) attribObserver.observe(attrib, { attributes: true, attributeFilter: ["open", "class"] });
    collapseAttribution();
    mapRef.current = map;

    if (mode === "monitoring") {
      setHotspot({ state: "loading" });
      // Marker = laporan dari formulir (disimpan di browser) + laporan yang sudah ada
      const renderReports = () => {
        const gen = ++renderGen.current;
        markers.current.forEach((m) => m.remove());
        photoUrls.current.forEach((u) => URL.revokeObjectURL(u));
        photoUrls.current = [];
        const scope = regionsRef.current;
        markers.current = getAllReports()
          .filter((r) => !scope || scope.includes(r.location.province))
          .map((r) => {
            const el = createMarkerElement(r);
            const popup = new maplibregl.Popup({ offset: 32, maxWidth: "270px" });
            const content = createReportPopupContent(r, () => { popup.remove(); onViewDetailRef.current?.(r.id); });
            popup.setDOMContent(content);

            // Foto marker dan popup = foto yang dikirim pelapor
            const seeded = r.history.find((h) => h.status === "Submitted")?.photos?.[0]?.url;
            if (seeded) {
              setMarkerPhoto(el, seeded);
              setPopupPhoto(content, seeded);
            } else if (r.photos.length > 0) {
              loadPhotos(r.id, 1).then((ps) => {
                const url = ps[0]?.url;
                if (!url) return;
                if (gen !== renderGen.current) { URL.revokeObjectURL(url); return; }
                photoUrls.current.push(url);
                setMarkerPhoto(el, url);
                setPopupPhoto(content, url);
              });
            }
            return new maplibregl.Marker({ element: el }).setLngLat([r.location.lng, r.location.lat]).setPopup(popup).addTo(map);
          });
      };
      renderRef.current = renderReports;
      renderReports();
      window.addEventListener(REPORTS_UPDATED_EVENT, renderReports);
      window.addEventListener("storage", renderReports);
      removeReportListeners = () => {
        window.removeEventListener(REPORTS_UPDATED_EVENT, renderReports);
        window.removeEventListener("storage", renderReports);
      };

      map.on("load", () => {
        map.addSource("hotspots", { type: "geojson", data: emptyFC });
        map.addLayer({
          id: "hotspot-glow", type: "circle", source: "hotspots",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, ["*", ["get", "intensity"], 4], 8, ["*", ["get", "intensity"], 14], 14, ["*", ["get", "intensity"], 30]],
            "circle-color": "#FF4D1A", "circle-opacity": 0.28, "circle-blur": 0.8,
          },
        });
        map.addLayer({
          id: "hotspot-core", type: "circle", source: "hotspots",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.5, 8, 5, 14, 9],
            "circle-color": "#FF6A1A", "circle-stroke-color": "#FFD28A", "circle-stroke-width": 1,
          },
        });
        map.on("mouseenter", "hotspot-core", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "hotspot-core", () => { map.getCanvas().style.cursor = ""; });
        map.on("click", "hotspot-core", (e) => {
          const f = e.features?.[0];
          if (!f || f.geometry.type !== "Point") return;
          new maplibregl.Popup({ offset: 10, maxWidth: "240px" })
            .setLngLat(f.geometry.coordinates as [number, number])
            .setDOMContent(createHotspotPopupContent(f.properties ?? {}))
            .addTo(map);
        });
        setReady(true);

        // Data hotspot dari NASA FIRMS lewat route server (/api/hotspots).
        const source = map.getSource("hotspots") as maplibregl.GeoJSONSource;
        fetch("/api/hotspots")
          .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<HotspotFeed>; })
          .then((feed) => {
            if (cancelled || mapRef.current !== map) return;
            source.setData(feed.data);
            setHotspot({ state: "live", count: feed.meta.count, dayRange: feed.meta.dayRange });
          })
          .catch(() => {
            if (cancelled || mapRef.current !== map) return;
            setHotspot({ state: "unavailable" });
          });
      });
    } else {
      map.getCanvas().style.cursor = "crosshair";
      const marker = new maplibregl.Marker({ color: "#345542", draggable: true });
      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        const p = { lat: ll.lat, lng: ll.lng };
        ownPick.current = p;
        onPickRef.current?.(p);
      });
      pickMarker.current = marker;
      map.on("click", (e) => {
        const p = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        ownPick.current = p;
        marker.setLngLat(e.lngLat).addTo(map);
        onPickRef.current?.(p);
      });
    }

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    return () => {
      cancelled = true;
      attribObserver.disconnect();
      ro.disconnect();
      removeReportListeners();
      renderRef.current = null;
      renderGen.current++;
      photoUrls.current.forEach((u) => URL.revokeObjectURL(u));
      photoUrls.current = [];
      markers.current.forEach((m) => m.remove());
      markers.current = [];
      pickMarker.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [mode]);

  // Jenis peta: satelit (+label) atau peta jalan
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const sat = basemap === "satelit" ? "visible" : "none";
    map.setLayoutProperty("satellite", "visibility", sat);
    map.setLayoutProperty("labels", "visibility", sat);
    map.setLayoutProperty("osm", "visibility", basemap === "peta" ? "visible" : "none");
  }, [basemap, ready]);

  // Sinkronisasi marker picker dengan state dari luar (mis. tombol GPS)
  useEffect(() => {
    const map = mapRef.current;
    const marker = pickMarker.current;
    if (mode !== "location-picker" || !map || !marker) return;
    if (!pickedLocation) { marker.remove(); return; }
    marker.setLngLat([pickedLocation.lng, pickedLocation.lat]).addTo(map);
    const own = ownPick.current;
    if (!own || own.lat !== pickedLocation.lat || own.lng !== pickedLocation.lng) {
      map.flyTo({ center: [pickedLocation.lng, pickedLocation.lat], zoom: Math.max(map.getZoom(), 12) });
    }
  }, [pickedLocation, mode]);

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" />
      {monitoring && (
        <>
          <MapLegend hotspot={hotspot} basemap={basemap} onBasemap={setBasemap} />
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              aria-label={fullscreen ? "Tutup layar penuh" : "Layar penuh"}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-md transition hover:bg-mist"
            >
              {fullscreen ? <X size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
