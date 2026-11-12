import type { Metadata } from "next";
import AdminOfficers from "@/components/officer/admin/AdminOfficers";

export const metadata: Metadata = {
  title: "Kelola Petugas — Satwarta",
  description: "Tambah, ubah, dan nonaktifkan akun petugas penanganan satwa.",
  robots: { index: false, follow: false },
};

export default function KelolaPetugasPage() {
  return <AdminOfficers />;
}
