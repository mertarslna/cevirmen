const CACHE_NAME = 'srt-cevirmen-v1';

// Önbelleğe alınacak dosyalar
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/compare.html',
  '/extractor.html',
  '/styles.css',
  '/storage.js',
  '/srt-utils.js',
  '/sidebar.js',
  '/srtlogo.png',
  '/manifest.json'
];

// Kurulum: tüm statik dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: önce önbellekten sun, yoksa ağdan al (Cache-First stratejisi)
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini işle
  if (event.request.method !== 'GET') return;

  // Harici CDN isteklerini (jszip vb.) önbelleğe almaya çalış ama hata verme
  const url = new URL(event.request.url);
  const isExternal = url.origin !== self.location.origin;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Önbellekte yoksa ağdan al
      return fetch(event.request)
        .then((networkResponse) => {
          // Sadece başarılı ve yerel dosyaları önbelleğe al
          if (
            networkResponse.ok &&
            !isExternal &&
            networkResponse.type !== 'opaque'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Ağ hatası ve önbellekte de yok - offline sayfası göster
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
