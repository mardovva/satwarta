import type { Metadata } from "next";
import OfficerDashboard from "@/components/officer/OfficerDashboard";

export const metadata: Metadata = {
  title: "Dasbor Petugas — Satwarta",
  description: "Terima, verifikasi, dan tindak lanjuti laporan satwa terdampak karhutla.",
};

export default function PetugasPage() {
  return <OfficerDashboard />;
}
