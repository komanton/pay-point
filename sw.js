// Updating PWA: https://stackoverflow.com/questions/66330440/how-to-check-for-installed-web-app-pwa-updates-when-using-precache-method

// Files to cache
const cacheName = 'pay-on-way-v5';
const appShellFiles = [
  '/index.html',
  '/app.js',
  '/style.css',
//   '/pwa-examples/js13kpwa/fonts/graduate.eot',
//   '/pwa-examples/js13kpwa/fonts/graduate.ttf',
//   '/pwa-examples/js13kpwa/fonts/graduate.woff',
//   '/pwa-examples/js13kpwa/favicon.ico',
//   '/pwa-examples/js13kpwa/img/js13kgames.png',
//   '/pwa-examples/js13kpwa/img/bg.png',
  '/images/icons/pay_point_32.png',
  '/images/icons/pay_point_64.png',
  '/images/icons/pay_point_96.png',
  '/images/icons/pay_point_128.png',
//   '/pwa-examples/js13kpwa/icons/icon-168.png',
//   '/pwa-examples/js13kpwa/icons/icon-192.png',
  '/images/icons/pay_point_256.png',
  '/images/icons/pay_point_512.png',
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

self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  // which will get rid of static-v1
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (![cacheName].includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready to handle fetches!');
    })
  );
});