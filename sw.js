const CACHE_NAME = 'aimoy-kiosk-v25';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
];

// Saat aplikasi diinstall pertama kali, simpan semua aset ke memori HP
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Hapus cache lama jika ada versi baru
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Saat aplikasi meminta file (Offline First Strategy)
self.addEventListener('fetch', (event) => {
  // Biarkan request ke server Google Apps Script tetap melalui internet
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di memori HP, langsung berikan tanpa internet (Instant Load)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Jika tidak ada, ambil dari internet lalu simpan ke memori HP
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Jangan cache request dari chrome-extension atau API luar
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
