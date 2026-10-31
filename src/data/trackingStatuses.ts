import type { TrackingStatus } from "@/types/report";

export interface StatusMeta { status: TrackingStatus; description: string; bg: string; fg: string; dot: string }

export const statusOrder: TrackingStatus[] = ["Submitted", "Under Review", "Verified", "In Progress", "Resolved", "Rejected"];

export const statusMeta: Record<TrackingStatus, StatusMeta> = {
  Submitted: { status: "Submitted", description: "Laporan berhasil dikirim dan menunggu diperiksa petugas.", bg: "#E8EEF9", fg: "#2F4C86", dot: "#6C8BC9" },
  "Under Review": { status: "Under Review", description: "Petugas sedang memeriksa kelengkapan dan kebenaran laporan.", bg: "#FDF0D5", fg: "#8A5A00", dot: "#E0A93B" },
  Verified: { status: "Verified", description: "Laporan sudah diverifikasi dan dinyatakan valid.", bg: "#DDF0E3", fg: "#245B38", dot: "#4E9B6B" },
  "In Progress": { status: "In Progress", description: "Laporan sedang ditindaklanjuti oleh petugas atau tim lapangan.", bg: "#FBE3D2", fg: "#9A4A12", dot: "#D87938" },
  Resolved: { status: "Resolved", description: "Penanganan selesai. Satwa sudah ditangani atau diselamatkan.", bg: "#CFE8D7", fg: "#1E4D31", dot: "#345542" },
  Rejected: { status: "Rejected", description: "Laporan tidak dapat diverifikasi. Anda dapat membuat laporan baru dengan data lebih lengkap.", bg: "#FADADA", fg: "#9B2226", dot: "#D64545" },
};
