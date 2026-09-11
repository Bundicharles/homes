const CACHE_VERSION = 'prime-homes-v5';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
  './apple-touch-icon.png',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './logo.svg',
  './favicon.svg'
];

// Helper: check if a response has HTML MIME type
function isHtmlResponse(response) {
  if (!response || !response.headers) return false;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/html');
}

// Install event: Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Precache assets individually so one failure does not break all
      for (const asset of PRECACHE_ASSETS) {
        try {
          const res = await fetch(asset, { cache: 'no-cache' });
          if (res && res.ok && (!asset.endsWith('.webmanifest') || !isHtmlResponse(res))) {
            await cache.put(asset, res);
          }
        } catch (e) {
          console.warn('[SW] Pre-caching asset failed for:', asset, e);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up previous and corrupted caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Apply safe caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Never intercept backend API or uploaded files - let browser handle them directly
  if (
    url.pathname.includes('/backend/') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('/uploads/')
  ) {
    return;
  }

  // Handle Navigation requests (HTML pages): Network-First, fallback to cached index.html or offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && isHtmlResponse(response)) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put('./index.html', clone).catch(() => {});
            }).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_VERSION);
          const cachedIndex =
            (await cache.match('./index.html')) ||
            (await cache.match('/homes/index.html')) ||
            (await caches.match('./index.html')) ||
            (await caches.match(self.registration.scope + 'index.html')) ||
            (await caches.match('./'));
          if (cachedIndex) return cachedIndex;

          const cachedOffline =
            (await cache.match('./offline.html')) ||
            (await caches.match('./offline.html')) ||
            (await caches.match(self.registration.scope + 'offline.html'));
          if (cachedOffline) return cachedOffline;

          return new Response(
            '<!DOCTYPE html><html><head><title>Offline</title></head><body><h2>You are offline</h2><p>Please check your internet connection and refresh.</p></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, images, fonts, manifests): Stale-While-Revalidate with Content-Type safety
  const isStaticAsset =
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.mjs') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // Sanity check: if cached response for static asset is corrupted HTML, delete and bypass it
        if (cachedResponse) {
          if (!isHtmlResponse(cachedResponse)) {
            // Background revalidate
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200 && !isHtmlResponse(networkResponse)) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
            }).catch(() => {});
            return cachedResponse;
          } else {
            // Poisoned cache detected, delete it
            await cache.delete(request);
          }
        }

        // Fetch from network
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            if (!isHtmlResponse(networkResponse)) {
              cache.put(request, networkResponse.clone()).catch(() => {});
              return networkResponse;
            }
            // Server returned HTML for a static-asset request — this is an
            // error (likely a SPA fallback or FallbackResource). Do NOT
            // pass the HTML through to the browser; that would cause MIME-type
            // errors when the browser tries to parse it as JS/CSS.
            // Try the cache first, then fall back to a 404.
            if (cachedResponse && !isHtmlResponse(cachedResponse)) {
              // Background revalidate to refresh cache on next load
              fetch(request).catch(() => {});
              return cachedResponse;
            }
            return new Response('Asset not available', {
              status: 404,
              cache: 'no-store',
              headers: { 'Content-Type': 'text/plain' }
            });
          }
          return networkResponse;
        } catch (fetchErr) {
          if (cachedResponse && !isHtmlResponse(cachedResponse)) {
            return cachedResponse;
          }
          return new Response('Asset not available offline', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })
    );
    return;
  }

  // Default: Network with Safe Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Not available offline', { status: 503 });
      })
  );
});

// Listen for messages from client (e.g. skipWaiting trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
