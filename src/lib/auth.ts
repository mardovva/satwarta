import { officerAccounts } from "@/data/officerAccounts";

const SESSION_KEY = "satwarta:officer-session";
const FAIL_KEY = "satwarta:login-fail";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000;

export interface OfficerSession { username: string; name: string; agency: string; expiresAt: number }
export type LoginResult = { ok: true; session: OfficerSession } | { ok: false; message: string };

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readFails(): { count: number; until: number } {
  try {
    const v = JSON.parse(window.localStorage.getItem(FAIL_KEY) ?? "null");
    return v && typeof v.count === "number" ? v : { count: 0, until: 0 };
  } catch {
    return { count: 0, until: 0 };
  }
}
function writeFails(v: { count: number; until: number } | null) {
  try {
    if (v) window.localStorage.setItem(FAIL_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(FAIL_KEY);
  } catch { /* abaikan */ }
}

/** Hanya panggil dari client. */
export function getSession(): OfficerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as OfficerSession | null;
    if (!s || typeof s.expiresAt !== "number" || !s.username || s.expiresAt <= Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function logout() {
  try { window.localStorage.removeItem(SESSION_KEY); } catch { /* abaikan */ }
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const fails = readFails();
  if (fails.until > Date.now()) {
    const s = Math.ceil((fails.until - Date.now()) / 1000);
    return { ok: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${s} detik.` };
  }
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return { ok: false, message: "Login memerlukan koneksi aman (HTTPS atau localhost)." };
  }

  const hash = await sha256Hex(`satwarta:${password}`);
  const account = officerAccounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
  await new Promise((r) => setTimeout(r, 500)); // jeda kecil agar percobaan beruntun melambat

  if (!account || account.passwordHash !== hash) {
    const count = fails.count + 1;
    writeFails(count >= MAX_ATTEMPTS ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 });
    return { ok: false, message: "Username atau kata sandi salah." };
  }

  writeFails(null);
  const session: OfficerSession = { username: account.username, name: account.name, agency: account.agency, expiresAt: Date.now() + SESSION_TTL_MS };
  try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* abaikan */ }
  return { ok: true, session };
}
