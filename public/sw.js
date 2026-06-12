const CACHE_NAME = "shiproute-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/globals.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Some URLs may fail to cache, but that's okay
        // App will still work with network fallback
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external APIs (Google Maps, Geocoding, Directions, Distance Matrix)
  if (
    url.hostname.includes("maps.googleapis.com") ||
    url.hostname.includes("maps.google.com") ||
    url.hostname === "nominatim.openstreetmap.org"
  ) {
    // Network only for external APIs
    return;
  }

  // For internal assets and pages: network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache non-API responses
        if (request.method === "GET") {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {
              // Cache put failed, but response is still returned to user
            });
          });
        }

        return response;
      })
      .catch(() => {
        // If fetch fails, try to return from cache
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // If nothing in cache, return offline page if it's a navigation request
          if (request.mode === "navigate") {
            return caches.match("/").catch(() => {
              return new Response(
                "Offline - unable to load page",
                { status: 503, statusText: "Service Unavailable" }
              );
            });
          }
        });
      })
  );
});
