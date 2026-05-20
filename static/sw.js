// Service Worker pour Min-Conflit CSP Solver
const CACHE_NAME = 'min-conflit-cache-v1';
const ASSETS = [
  'app.html',
  'landing.html',
  'style.css',
  'landing.css',
  'script.js',
  'landing.js',
  'solvers.js',
  'vendor/particles.js/particles.min.js',
  'vendor/particles.js/particles-config.json',
  'res/icons/icon-16.png',
  'res/icons/icon-32.png',
  'res/icons/icon-48.png',
  'res/icons/icon-128.png'
];

// Phase d'installation : on met tous les assets critiques en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all local visualizer assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches si nécessaire
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategie de fetch : Cache-first avec fallback reseau
self.addEventListener('fetch', (event) => {
  // On ignore les requetes non-GET et les requetes vers le backend API (ex: /solve, /solve-sudoku)
  if (event.request.method !== 'GET' || event.request.url.includes('/solve') || event.request.url.includes('/benchmark')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Optionnel : on peut dynamiquement ajouter de nouvelles ressources GET en cache
        return networkResponse;
      }).catch((err) => {
        console.warn('[Service Worker] Fetch failed, resource offline:', event.request.url, err);
      });
    })
  );
});
