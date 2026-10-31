import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Satwarta — Jaga Satwa, Jaga Kita",
  description: "Platform pelaporan masyarakat untuk satwa liar yang terdampak karhutla di Indonesia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
