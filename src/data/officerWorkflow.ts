import type { TrackingStatus } from "@/types/report";

export interface WorkflowAction {
  to: TrackingStatus;
  label: string;
  description: string;
  requirePhoto?: boolean;
  tone?: "danger";
}

/** Tindakan yang dapat dilakukan petugas pada tiap status. */
export const workflow: Record<TrackingStatus, WorkflowAction[]> = {
  Submitted: [
    { to: "Under Review", label: "Terima & periksa", description: "Terima laporan ini dan mulai memeriksa kelengkapan serta kebenarannya." },
  ],
  "Under Review": [
    { to: "Verified", label: "Verifikasi: valid", description: "Laporan sesuai fakta dan siap ditindaklanjuti." },
    { to: "Rejected", label: "Tolak laporan", description: "Laporan tidak dapat diverifikasi. Tulis alasan yang jelas untuk pelapor.", tone: "danger" },
  ],
  Verified: [
    { to: "In Progress", label: "Mulai penanganan", description: "Tim lapangan mulai menangani satwa di lokasi." },
  ],
  "In Progress": [
    { to: "In Progress", label: "Perbarui progres", description: "Tambahkan catatan dan foto perkembangan penanganan." },
    { to: "Resolved", label: "Tandai selesai", description: "Penanganan selesai. Unggah foto bukti penanganan.", requirePhoto: true },
  ],
  Resolved: [],
  Rejected: [],
};

export const statusLabel: Record<TrackingStatus, string> = {
  Submitted: "Baru masuk",
  "Under Review": "Diperiksa",
  Verified: "Terverifikasi",
  "In Progress": "Ditangani",
  Resolved: "Selesai",
  Rejected: "Ditolak",
};
