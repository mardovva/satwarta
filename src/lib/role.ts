export type Role = "pelapor" | "petugas";
const KEY = "satwarta:role";

export function setRole(role: Role) {
  try { window.localStorage.setItem(KEY, role); } catch { /* abaikan */ }
}
