/* Coverly service worker — optional offline caching.
   Uses relative paths so it works on GitHub Pages sub-paths. */
const CACHE = 'coverly-v1';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll([
        './',
        './index.html',
        './css/style.css',
        './css/responsive.css',
        './css/animations.css',
        './js/storage.js',
        './js/templates.js',
        './js/canvas.js',
        './js/editor.js',
        './js/controls.js',
        './js/export.js',
        './js/app.js',
        './manifest.webmanifest',
        './assets/icons/icon.svg'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      return hit || fetch(event.request).then(function (res) {
        if (res && res.status === 200 && event.request.url.indexOf(location.origin) === 0) {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return res;
      });
    }).catch(function () {
      return caches.match('./index.html');
    })
  );
});
