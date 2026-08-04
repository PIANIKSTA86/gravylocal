/**
 * GRAVY v2.0 — Service Worker
 * Cache offline para activos estáticos.
 * Los datos dinámicos (API) siempre van a la red.
 */

const CACHE_NAME = 'gravy-v2-assets-v7';

// Activos estáticos a cachear al instalar
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/jspdf.min.js',
  '/assets/autotable.min.js',
  '/assets/xlsx.full.min.js',
  '/assets/fa/all.min.css',
  '/assets/fonts/fonts.css',
  '/assets/gravy-logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

// ── Instalación: pre-cachear activos estáticos ─────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(e => console.warn('[SW] No se pudo cachear:', url, e)))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activación: limpiar caches antiguas ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: estrategia según tipo de recurso ────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solicitudes a la API de PocketBase y panel admin → dejar que el navegador las maneje de forma nativa
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_/')) {
    return; // No interceptamos
  }

  // JS/CSS/HTML → network first para evitar archivos obsoletos tras deploy
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style'  ||
    event.request.destination === 'document'
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return caches.match(event.request);
        })
    );
    return;
  }

  // Activos estáticos restantes → cache first, con fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Solo cachear respuestas exitosas de activos estáticos
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Sin red y sin cache → página de error offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
