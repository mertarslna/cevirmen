/**
 * SRT Çevirmen & Karşılaştırıcı Storage Modülü
 * IndexedDB (öncelikli) ve localStorage (yedek) kullanarak sayfa yenilemelerinde ve geçişlerinde veri kalıcılığı sağlar.
 */

const DB_NAME = 'SRT_Cevirmen_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

let dbInstance = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        if (!window.indexedDB) {
            console.warn('IndexedDB bu tarayıcıda desteklenmiyor, localStorage kullanılacak.');
            return resolve(null);
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = function (e) {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };

        request.onerror = function (e) {
            console.error('IndexedDB açılırken hata oluştu:', e.target.error);
            resolve(null);
        };
    });
}

async function setStorageItem(key, data) {
    try {
        const db = await openDB();
        if (db) {
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(data, key);
                req.onsuccess = () => resolve(true);
                req.onerror = () => {
                    console.warn(`IndexedDB save failed for ${key}, falling back to localStorage.`);
                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                    } catch (err) {
                        console.error('localStorage Error:', err);
                    }
                    resolve(false);
                };
            });
        } else {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        }
    } catch (err) {
        console.error('Storage Save Exception:', err);
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) { }
        return false;
    }
}

async function getStorageItem(key) {
    try {
        const db = await openDB();
        if (db) {
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(key);
                req.onsuccess = () => {
                    if (req.result !== undefined) {
                        resolve(req.result);
                    } else {
                        const local = localStorage.getItem(key);
                        resolve(local ? JSON.parse(local) : null);
                    }
                };
                req.onerror = () => {
                    const local = localStorage.getItem(key);
                    resolve(local ? JSON.parse(local) : null);
                };
            });
        } else {
            const local = localStorage.getItem(key);
            return local ? JSON.parse(local) : null;
        }
    } catch (err) {
        console.error('Storage Get Exception:', err);
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : null;
    }
}

async function removeStorageItem(key) {
    try {
        const db = await openDB();
        if (db) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(key);
        }
        localStorage.removeItem(key);
    } catch (err) {
        console.error('Storage Remove Exception:', err);
    }
}

async function clearAllStorage() {
    try {
        const db = await openDB();
        if (db) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
        }
        localStorage.clear();
    } catch (err) {
        console.error('Storage Clear Exception:', err);
    }
}
