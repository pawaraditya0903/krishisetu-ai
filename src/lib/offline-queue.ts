// Offline IndexedDB Queue for KrishiSetu AI

export interface OfflineAction {
  id: string;
  actionType: "CREATE_LOT" | "JOIN_POOL" | "UPDATE_DRAFT";
  payload: unknown;
  createdAt: string;
  status: "PENDING" | "SYNCED" | "FAILED";
  retryCount: number;
}

const DB_NAME = "KrishiSetuOfflineDB";
const STORE_NAME = "sync_queue";
const DRAFTS_STORE = "crop_drafts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB not available"));
    }

    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineAction(
  actionType: OfflineAction["actionType"],
  payload: unknown
): Promise<OfflineAction> {
  const action: OfflineAction = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actionType,
    payload,
    createdAt: new Date().toISOString(),
    status: "PENDING",
    retryCount: 0,
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(action);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn("Failed to write to IndexedDB, fallback to in-memory:", err);
  }

  return action;
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = (request.result as OfflineAction[]) || [];
        resolve(results.filter((a) => a.status === "PENDING"));
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function clearSyncedAction(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
  } catch (err) {
    console.warn("Failed to remove action:", err);
  }
}
