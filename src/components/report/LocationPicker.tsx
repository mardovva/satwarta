"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import type { LatLng, ReportFormErrors, ReportFormValues } from "@/types/report";
import { provinceNames, provinces } from "@/data/locations";
import { reverseRegion } from "@/lib/geocode";
import { FormField, SelectField } from "./FormField";

const IndonesiaMap = dynamic(() => import("@/components/map/IndonesiaMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#DCE6DC]" />,
});

interface Props {
  values: ReportFormValues;
  errors: ReportFormErrors;
  onChange: <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) => void;
}

type GpsState = { status: "idle" | "loading" } | { status: "error"; message: string };

function gpsMessage(code: number) {
  if (code === 1) return "Izin lokasi ditolak. Anda tetap bisa menandai lokasi secara manual di peta.";
  if (code === 2) return "Lokasi perangkat tidak tersedia saat ini. Coba lagi atau tandai lokasi secara manual di peta.";
  if (code === 3) return "Waktu pencarian lokasi habis. Coba lagi atau tandai lokasi secara manual di peta.";
  return "Gagal mengambil lokasi. Tandai lokasi secara manual di peta.";
}

export default function LocationPicker({ values, errors, onChange }: Props) {
  const [gps, setGps] = useState<GpsState>({ status: "idle" });
  const [geo, setGeo] = useState<"idle" | "loading" | "failed" | "partial">("idle");

  // Titik di peta (klik, geser, atau GPS) -> provinsi dan kabupaten/kota terisi otomatis
  const lat = values.location?.lat;
  const lng = values.location?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    const ctrl = new AbortController();
    setGeo("loading");
    const t = window.setTimeout(async () => {
      try {
        const guess = await reverseRegion(lat, lng, ctrl.signal);
        if (!guess) { setGeo("failed"); return; }
        onChange("province", guess.province);
        onChange("city", guess.city);
        setGeo(guess.city ? "idle" : "partial");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setGeo("failed");
      }
    }, 500);
    return () => { window.clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGps({ status: "error", message: "Browser tidak mendukung GPS. Tandai lokasi secara manual di peta." });
      return;
    }
    setGps({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange("location", { lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGps({ status: "idle" });
      },
      (err) => setGps({ status: "error", message: gpsMessage(err.code) }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loc = values.location;
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[0.9375rem] font-semibold">Tandai lokasi di peta<span aria-hidden className="ml-0.5 text-accent">*</span></p>
        <div id="field-location" tabIndex={-1} data-invalid={errors.location ? "true" : undefined} className={`h-[12rem] overflow-hidden rounded-xl shadow-sm outline-none ring-1 ${errors.location ? "ring-2 ring-red-400" : "ring-black/5"}`}>
          <IndonesiaMap mode="location-picker" pickedLocation={loc} onPick={(p: LatLng) => onChange("location", p)} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button" onClick={useMyLocation} disabled={gps.status === "loading"}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/30 transition hover:bg-primary hover:text-white disabled:opacity-60"
          >
            {gps.status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            Gunakan lokasi saya
          </button>
          <span className="text-xs text-ink/65" aria-live="polite">
            {loc ? `Koordinat: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : "Klik peta untuk menandai lokasi (gunakan Ctrl/⌘ + scroll untuk zoom)."}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-red-600" aria-live="polite">
          {gps.status === "error" ? gps.message : ""}
          {errors.location && gps.status !== "error" ? errors.location : ""}
        </p>
      </div>

      <FormField id="field-province" label="Provinsi" required error={errors.province}>
        <SelectField
          id="field-province" value={values.province} placeholder="Pilih provinsi" options={provinceNames} error={errors.province}
          onChange={(v) => { onChange("province", v); onChange("city", ""); }}
        />
      </FormField>

      <FormField id="field-city" label="Kabupaten/Kota" required error={errors.city}>
        <SelectField
          id="field-city" value={values.city} onChange={(v) => onChange("city", v)} error={errors.city}
          placeholder={values.province ? "Pilih kabupaten/kota" : "Pilih provinsi terlebih dahulu"}
          options={values.province ? provinces[values.province] ?? [] : []} disabled={!values.province}
        />
      </FormField>
      {(geo === "partial" || geo === "failed") && (
        <p className="text-xs text-ink/65" aria-live="polite">
          {geo === "partial" ? "Kabupaten/kota belum terdeteksi, pilih secara manual." : "Wilayah belum terdeteksi, pilih provinsi dan kabupaten/kota secara manual."}
        </p>
      )}
    </div>
  );
}
