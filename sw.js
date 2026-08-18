/* Golden Age Wisdom — offline shell.
   Cache-first for assets, network-first for pages, so content stays fresh
   but the app still opens on a bad connection. */
const V = 'gaw-v51';
const SHELL = [
  '/', '/index.html', '/manifest.webmanifest',
  '/assets/logo-128.webp', '/assets/meditator-clear.webp',
  '/assets/icon-192.png', '/assets/icon-512.png',
  '/gaw-i18n.js', '/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u =>
      c.add(new Request(u, { cache: 'reload' }))
        .catch(err => console.warn('[sw] precache failed', u, err))
    ))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;              // never touch YouTube, Zoom, fonts
  if (url.pathname.endsWith('.php')) return;               // never cache the server helpers

  // Config carries the launch moment, gaw-backend.js talks to the registry, and
  // gaw-i18n.js carries every headline string: none may be frozen in cache.
  // Always fresh, fall back offline.
  if (url.pathname.endsWith('gaw-config.js') || url.pathname.endsWith('gaw-backend.js') || url.pathname.endsWith('gaw-i18n.js')) {
    e.respondWith(fetch(req)
      .then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req)));
    return;
  }

  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    e.respondWith(fetch(req)
      .then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('/offline.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); }
    return r;
  })));
});
