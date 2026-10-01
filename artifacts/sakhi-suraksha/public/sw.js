const CACHE_NAME = 'sakhi-suraksha-shell-v1';
const APP_SCOPE = new URL('./', self.registration.scope).href;
const CORE_FILES = [
  'manifest.webmanifest',
  'favicon.svg',
  'icons/sakhi-suraksha-180.png',
  'icons/sakhi-suraksha-192.png',
  'icons/sakhi-suraksha-512.png',
];

async function cacheAppFile(cache, fileUrl, seen = new Set()) {
  const url = new URL(fileUrl, APP_SCOPE);
  if (url.origin !== self.location.origin || seen.has(url.href)) return;
  seen.add(url.href);

  const response = await fetch(url.href, { cache: 'reload' });
  if (!response.ok) throw new Error(`Unable to cache app resource: ${url.pathname}`);
  await cache.put(url.href, response.clone());

  if (url.pathname.endsWith('.js') || response.headers.get('content-type')?.includes('javascript')) {
    const source = await response.text();
    const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*|\bimport\s*\(\s*)["']([^"']+)["']/g)];
    await Promise.all(imports.map((match) => cacheAppFile(cache, new URL(match[1], url).href, seen)));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const shellUrl = new URL(APP_SCOPE);
    const response = await fetch(shellUrl.href, { cache: 'reload' });
    if (!response.ok) throw new Error('Unable to cache the Sakhi Suraksha app shell.');
    await cache.put(shellUrl.href, response.clone());

    const html = await response.text();
    const referencedFiles = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
      .map((match) => match[1]);
    const files = new Set([...CORE_FILES, ...referencedFiles]);
    await Promise.all([...files].map((file) => cacheAppFile(cache, file)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('sakhi-suraksha-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(request)
          || await cache.match(APP_SCOPE)
          || new Response('Sakhi Suraksha is offline. Reconnect once to prepare this device for offline use.', {
            status: 503,
            statusText: 'Offline',
          });
      }
    })());
    return;
  }

  const isAppAsset = /\.(?:css|js|mjs|png|svg|ico|woff2?)$/i.test(requestUrl.pathname)
    || requestUrl.pathname.endsWith('/manifest.webmanifest');
  if (!isAppAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
    return response;
  })());
});