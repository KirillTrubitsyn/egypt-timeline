const CACHE_NAME = 'egypt-timeline-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './images/hero.jpg',
  './images/finale.jpg',
  './images/era-predynastic.jpg',
  './images/era-early.jpg',
  './images/era-old.jpg',
  './images/era-middle.jpg',
  './images/era-new.jpg',
  './images/era-third.jpg',
  './images/era-late.jpg',
  './images/era-ptolemaic.jpg',
  './images/mini-nabta.jpg',
  './images/mini-narmer.jpg',
  './images/mini-djoser.jpg',
  './images/mini-drought.jpg',
  './images/mini-hatshepsut.jpg',
  './images/mini-tut.jpg',
  './images/mini-kadesh.jpg',
  './images/mini-abusimbel.jpg',
  './images/mini-seapeoples.jpg',
  './images/mini-alexander.jpg',
  './images/mini-cleopatra.jpg'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache new requests dynamically (e.g. Google Fonts)
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
