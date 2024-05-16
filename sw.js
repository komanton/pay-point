

// Files to cache
const cacheName = 'pay-point-v1';
const appShellFiles = [
  '/pay-point/index.html',
  '/pay-point/app.js',
  '/pay-point/style.css',
//   '/pwa-examples/js13kpwa/fonts/graduate.eot',
//   '/pwa-examples/js13kpwa/fonts/graduate.ttf',
//   '/pwa-examples/js13kpwa/fonts/graduate.woff',
//   '/pwa-examples/js13kpwa/favicon.ico',
//   '/pwa-examples/js13kpwa/img/js13kgames.png',
//   '/pwa-examples/js13kpwa/img/bg.png',
  '/pay-point/images/icons/pay_point_32.png',
  '/pay-point/images/icons/pay_point_64.png',
  '/pay-point/images/icons/pay_point_96.png',
  '/pay-point/images/icons/pay_point_128.png',
//   '/pwa-examples/js13kpwa/icons/icon-168.png',
//   '/pwa-examples/js13kpwa/icons/icon-192.png',
  '/pay-point/images/icons/pay_point_256.png',
  '/pay-point/images/icons/pay_point_512.png',
];
const contentToCache = appShellFiles;

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
       e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )) {
        return; 
    }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});