"use client";
import { useEffect, useRef } from "react";

/** Site key publik Cloudflare Turnstile. Kosong = CAPTCHA tidak dipakai (mode pengembangan). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}
declare global { interface Window { turnstile?: TurnstileApi } }

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error("turnstile script")); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Widget Turnstile. Berjalan tanpa mengganggu pengguna (hanya tampil bila Cloudflare butuh interaksi).
 * Token hanya berlaku sekali: ganti `key` pada komponen ini untuk meminta token baru setelah setiap pengiriman.
 */
export default function TurnstileWidget({ onToken, onError }: { onToken: (token: string | null) => void; onError: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef({ onToken, onError });
  cb.current = { onToken, onError };

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widgetId = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY, language: "id", theme: "light", appearance: "interaction-only",
          callback: (token: string) => cb.current.onToken(token),
          "expired-callback": () => cb.current.onToken(null),
          "timeout-callback": () => cb.current.onToken(null),
          "error-callback": () => { cb.current.onToken(null); cb.current.onError(); },
        });
      })
      .catch(() => { if (!cancelled) cb.current.onError(); });
    return () => { cancelled = true; if (widgetId && window.turnstile) window.turnstile.remove(widgetId); };
  }, []);

  return <div ref={box} className="min-h-0" />;
}
