const CACHE_NAME = 'egypt-timeline-v3';

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

// Install: cache all assets, activate immediately
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

// Fetch: network-first for HTML pages, cache-first for assets
self.addEventListener('fetch', (event) => {
  const isNavigate = event.request.mode === 'navigate';
  const isHTML = event.request.destination === 'document' ||
    event.request.url.endsWith('.html') ||
    event.request.url.endsWith('/');

  if (isNavigate || isHTML) {
    // Network-first for HTML — always get latest version
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request) || caches.match('./index.html');
      })
    );
  } else {
    // Cache-first for images, fonts, etc.
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }).catch(() => {
        if (isNavigate) {
          return caches.match('./index.html');
        }
      })
    );
  }
});
