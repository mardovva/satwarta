import type { HistoryPhoto } from "@/types/report";

// Foto dokumentasi disimpan di IndexedDB (kuotanya jauh lebih besar dari localStorage).
// Hanya panggil dari client.
const DB_NAME = "satwarta";
const STORE = "report-photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotos(keyPrefix: string, files: File[]): Promise<boolean> {
  if (files.length === 0) return true;
  if (typeof indexedDB === "undefined") return false;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      files.forEach((f, i) => tx.objectStore(STORE).put(f, `${keyPrefix}:${i}`));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch {
    return false;
  }
}

/** Mengembalikan object URL; pemanggil wajib memanggil URL.revokeObjectURL saat tidak dipakai. */
export async function loadPhotos(keyPrefix: string, count: number, caption = "Foto dari pelapor"): Promise<HistoryPhoto[]> {
  if (count === 0 || typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const blobs = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        new Promise<Blob | undefined>((resolve) => {
          const req = db.transaction(STORE, "readonly").objectStore(STORE).get(`${keyPrefix}:${i}`);
          req.onsuccess = () => resolve(req.result as Blob | undefined);
          req.onerror = () => resolve(undefined);
        })
      )
    );
    db.close();
    return blobs
      .filter((b): b is Blob => !!b)
      .map((b) => ({ url: URL.createObjectURL(b), caption }));
  } catch {
    return [];
  }
}
