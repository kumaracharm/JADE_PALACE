// IndexedDB-backed offline grievance queue for PWA resilience

const DB_NAME = 'campuspulse_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'outbox';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueGrievance(payload) {
  const db = await openDB();
  const item = {
    localId: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    queuedAt: new Date().toISOString(),
    payload,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedGrievances() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueuedGrievance(localId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(localId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function flushQueue(submitFn) {
  const items = await getQueuedGrievances();
  const synced = [];
  const failed = [];
  for (const item of items) {
    try {
      const res = await submitFn(item.payload);
      await removeQueuedGrievance(item.localId);
      synced.push(res);
    } catch (err) {
      failed.push({ item, error: err?.message || 'Sync failed' });
    }
  }
  return { synced, failed };
}
