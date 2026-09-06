/**
 * BcaFly IndexedDB Offline Storage & Synchronization Engine
 * Allows faculty to take attendance even when classroom Wi-Fi or cellular network drops.
 */

const DB_NAME = 'BcaFlyOfflineDB';
const DB_VERSION = 1;
const STORE_ATTENDANCE_QUEUE = 'offline_attendance_queue';
const STORE_LOCAL_CACHE = 'offline_local_cache';

export interface QueuedAttendanceRecord {
  id: string;
  courseId: string;
  semesterId: string;
  date: string;
  period: number;
  records: Array<{
    studentId: string;
    rollNumber: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';
  }>;
  recordedBy: string;
  timestamp: number;
  synced: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ATTENDANCE_QUEUE)) {
        db.createObjectStore(STORE_ATTENDANCE_QUEUE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_LOCAL_CACHE)) {
        db.createObjectStore(STORE_LOCAL_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineAttendance(record: Omit<QueuedAttendanceRecord, 'id' | 'timestamp' | 'synced'>): Promise<string> {
  const db = await openDatabase();
  const id = `OFFLINE_ATT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item: QueuedAttendanceRecord = {
    ...record,
    id,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE_QUEUE);
    const request = store.put(item);

    request.onsuccess = () => {
      // Trigger background sync if service worker sync registration is supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg: any) => {
          reg.sync.register('sync-offline-attendance').catch(() => {});
        });
      }
      resolve(id);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingOfflineAttendance(): Promise<QueuedAttendanceRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_ATTENDANCE_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => {
      const records: QueuedAttendanceRecord[] = request.result || [];
      resolve(records.filter(r => !r.synced));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markOfflineRecordSynced(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE_QUEUE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.synced = true;
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
