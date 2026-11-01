import { findAccount } from "@/data/officerAccounts";

const KEY = "satwarta:officer-regions:v1";
export const REGIONS_EVENT = "satwarta:regions-updated";

function readAll(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/** Wilayah kerja petugas: pilihan yang tersimpan, atau wilayah awal akunnya. */
export function getRegions(username: string): string[] {
  const saved = readAll()[username];
  if (Array.isArray(saved) && saved.length > 0) return saved;
  return findAccount(username)?.regions ?? [];
}

export function saveRegions(username: string, regions: string[]) {
  const all = readAll();
  all[username] = regions;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(REGIONS_EVENT));
  } catch { /* abaikan */ }
}
