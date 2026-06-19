const CACHE_NAME = 'aimoy-kiosk-v42'; // Ingat untuk menaikkan ini jika ada update HTML
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

  // 🚀 STRATEGI BARU: Network First untuk file HTML
  // Sistem akan selalu mencoba mengambil kodingan terbaru dari internet jika HP online
  if (event.request.mode === 'navigate' || event.request.url.includes('.html')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Jika HP sedang Offline/Tidak ada sinyal, baru gunakan cache memori HP
        return caches.match(event.request);
      })
    );
    return;
  }

  // ⚡ STRATEGI LAMA: Cache First untuk aset berat (Tailwind, Face-API, Gambar) agar load instan
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Jangan cache request dari API luar yang tidak relevan
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});

// ==========================================
// 🚀 KEPINGAN TERAKHIR: PEMICU SKIP WAITING
// ==========================================
// Memaksa Service Worker baru langsung aktif saat tombol "Muat Ulang Sekarang" ditekan di HTML
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
