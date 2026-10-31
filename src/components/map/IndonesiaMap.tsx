"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Maximize2, X } from "lucide-react";
import { dummyReports } from "@/data/dummyReports";
import { dummyHotspots } from "@/data/dummyHotspots";
import type { LatLng, MapMode, WildlifeReport } from "@/types/report";
import { createMarkerElement } from "./MapMarker";
import { createPopupContent, ReportDetailDialog } from "./MapPopup";
import MapLegend from "./MapLegend";

interface IndonesiaMapProps {
  mode?: MapMode;
  /** Hanya mode monitoring */
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Hanya mode location-picker. Simpan nilai persis seperti yang diberikan onPick (jangan dibulatkan). */
  pickedLocation?: LatLng | null;
  onPick?: (p: LatLng) => void;
}

const INDONESIA_BOUNDS: maplibregl.LngLatBoundsLike = [[94.5, -11.5], [141.5, 6.5]];

// Basemap satelit gratis tanpa API key: NASA GIBS Blue Marble. Ganti `tiles` di sini bila ingin basemap lain.
const style: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"],
      tileSize: 256,
      maxzoom: 8,
      attribution: "Imagery © NASA GIBS / Blue Marble",
    },
  },
  layers: [{ id: "satellite", type: "raster", source: "satellite" }],
};

const locale = {
  "CooperativeGesturesHandler.WindowsHelpText": "Gunakan Ctrl + scroll untuk memperbesar peta",
  "CooperativeGesturesHandler.MacHelpText": "Gunakan ⌘ + scroll untuk memperbesar peta",
  "CooperativeGesturesHandler.MobileHelpText": "Gunakan dua jari untuk menggeser peta",
};

export default function IndonesiaMap({ mode = "monitoring", fullscreen = false, onToggleFullscreen, pickedLocation = null, onPick }: IndonesiaMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const reportEls = useRef<HTMLElement[]>([]);
  const pickMarker = useRef<maplibregl.Marker | null>(null);
  const ownPick = useRef<LatLng | null>(null);
  const onPickRef = useRef(onPick);
  const [selected, setSelected] = useState<WildlifeReport | null>(null);
  const [showReports, setShowReports] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [ready, setReady] = useState(false);
  const monitoring = mode === "monitoring";

  useEffect(() => { onPickRef.current = onPick; }, [onPick]);

  // Inisialisasi peta (sekali per mode) + cleanup.
  useEffect(() => {
    if (!container.current) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const map = new maplibregl.Map({
      container: container.current,
      style,
      bounds: INDONESIA_BOUNDS,
      fitBoundsOptions: { padding: 8 },
      minZoom: 2,
      maxZoom: 10,
      cooperativeGestures: mode === "location-picker" || coarse,
      locale,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    mapRef.current = map;

    if (mode === "monitoring") {
      dummyReports.forEach((r) => {
        const el = createMarkerElement(r);
        reportEls.current.push(el);
        const popup = new maplibregl.Popup({ offset: 30, maxWidth: "270px" }).setDOMContent(createPopupContent(r, () => setSelected(r)));
        new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).setPopup(popup).addTo(map);
      });
      map.on("load", () => {
        map.addSource("hotspots", { type: "geojson", data: dummyHotspots });
        map.addLayer({
          id: "hotspot-glow",
          type: "circle",
          source: "hotspots",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, ["*", ["get", "intensity"], 5], 8, ["*", ["get", "intensity"], 18]],
            "circle-color": "#FF4D1A",
            "circle-opacity": 0.28,
            "circle-blur": 0.8,
          },
        });
        map.addLayer({
          id: "hotspot-core",
          type: "circle",
          source: "hotspots",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.5, 8, 6],
            "circle-color": "#FF6A1A",
            "circle-stroke-color": "#FFD28A",
            "circle-stroke-width": 1,
          },
        });
        setReady(true);
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
      ro.disconnect();
      reportEls.current = [];
      pickMarker.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [mode]);

  // Toggle legenda
  useEffect(() => {
    reportEls.current.forEach((el) => { el.style.display = showReports ? "" : "none"; });
  }, [showReports, mode]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    ["hotspot-glow", "hotspot-core"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", showHotspots ? "visible" : "none");
    });
  }, [showHotspots, ready]);

  // Sinkronisasi marker picker dengan state dari luar (mis. tombol GPS)
  useEffect(() => {
    const map = mapRef.current;
    const marker = pickMarker.current;
    if (mode !== "location-picker" || !map || !marker) return;
    if (!pickedLocation) { marker.remove(); return; }
    marker.setLngLat([pickedLocation.lng, pickedLocation.lat]).addTo(map);
    const own = ownPick.current;
    if (!own || own.lat !== pickedLocation.lat || own.lng !== pickedLocation.lng) {
      map.flyTo({ center: [pickedLocation.lng, pickedLocation.lat], zoom: Math.max(map.getZoom(), 9) });
    }
  }, [pickedLocation, mode]);

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" />
      {monitoring && (
        <>
          <MapLegend
            showReports={showReports}
            showHotspots={showHotspots}
            onToggleReports={() => setShowReports((v) => !v)}
            onToggleHotspots={() => setShowHotspots((v) => !v)}
          />
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              aria-label={fullscreen ? "Tutup layar penuh" : "Layar penuh"}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-md transition hover:bg-mist"
            >
              {fullscreen ? <X size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          {selected && <ReportDetailDialog report={selected} onClose={() => setSelected(null)} />}
        </>
      )}
    </div>
  );
}
