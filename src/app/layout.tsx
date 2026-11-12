import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { HOME_SCROLL_RESET } from "@/lib/homeScrollReset";

export const metadata: Metadata = {
  title: "Satwarta | Pelaporan & Penyelamatan Satwa",
  description: "Platform pelaporan masyarakat untuk satwa liar yang terdampak karhutla di Indonesia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {}
        <script dangerouslySetInnerHTML={{ __html: HOME_SCROLL_RESET }} />
        {}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" />
      </head>
      <body className="font-sans text-ink antialiased">
        <noscript><style>{`.reveal{opacity:1!important;transform:none!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
