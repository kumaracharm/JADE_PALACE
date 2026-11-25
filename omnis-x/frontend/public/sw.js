// OMNIS-X Progressive Web App Service Worker
// Safe caching for static assets with zero caching of sensitive auth/incident tokens

const CACHE_NAME = "omnis-x-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/pfp/OOGWAY.jpeg",
  "/pfp/SHIFU.jpeg",
  "/pfp/TIGERESS.jpeg",
  "/pfp/MONKEY.jpeg",
  "/pfp/POO.jpeg",
  "/pfp/MANTIS.jpeg",
  "/pfp/CRANE.jpeg",
  "/pfp/Mr . Ping.jpeg",
  "/pfp/ZHEN.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // NEVER cache API requests or authentication endpoints
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first strategy for dynamic pages; cache-first for static media
  if (url.pathname.startsWith("/pfp/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
