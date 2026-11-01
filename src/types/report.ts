export type ReportStatus = "Menunggu Verifikasi" | "Terverifikasi" | "Dalam Penanganan" | "Selesai";

export interface WildlifeReport {
  id: string;
  animal: string;
  emoji: string;
  reportType: string;
  location: string;
  lng: number;
  lat: number;
  date: string;
  status: ReportStatus;
  description: string;
}

export type MapMode = "monitoring" | "location-picker";

export interface LatLng {
  lat: number;
  lng: number;
}

// ---------- Phase 2: formulir & simulasi penyimpanan ----------
export type TrackingStatus = "Submitted" | "Under Review" | "Verified" | "In Progress" | "Resolved" | "Rejected";

export interface HistoryPhoto { url: string; caption: string }
export interface StatusHistoryEntry {
  status: TrackingStatus;
  at: string;
  note: string;
  photos?: HistoryPhoto[];
  /** Jumlah foto petugas yang tersimpan di IndexedDB untuk langkah ini */
  storedPhotos?: number;
}
export interface StoredPhoto { name: string; size: number; type: string }

/** Bentuk data yang disimpan ke localStorage. Dirancang agar mudah dipetakan ke tabel Supabase nanti. */
export interface StoredReport {
  id: string;
  createdAt: string; // ISO
  status: TrackingStatus;
  animal: { type: string; name: string; count: number; condition: string };
  location: { province: string; city: string; lat: number; lng: number };
  photos: StoredPhoto[]; // hanya metadata; file belum diunggah ke server
  reporter: { name: string; phone: string; email: string };
  history: StatusHistoryEntry[];
}

export interface ReportFormValues {
  animalType: string;
  animalName: string;
  count: string;
  condition: string;
  conditionOther: string;
  province: string;
  city: string;
  location: LatLng | null;
  reporterName: string;
  phone: string;
  email: string;
}
export type ReportFormErrors = Partial<Record<keyof ReportFormValues, string>>;

export interface PhotoItem { id: string; file: File; url: string }
