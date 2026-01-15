/* Service Worker: caching, background sync queue, push handling */
const CACHE_NAME = 'wasel-app-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Simple IndexedDB helpers for outbox
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('wasel-sw-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('outbox')) db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveOutboxRequest(request) {
  const db = await openDB();
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');
  const body = await request.clone().text().catch(() => null);
  const headers = {};
  for (const pair of request.headers.entries()) headers[pair[0]] = pair[1];
  store.put({ url: request.url, method: request.method, headers, body, timestamp: Date.now() });
  return tx.complete || new Promise((res) => (tx.oncomplete = res));
}

async function replayOutbox() {
  const db = await openDB();
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');
  const allReqs = await new Promise((res, rej) => {
    const r = store.getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  for (const req of allReqs) {
    try {
      await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
      store.delete(req.id);
    } catch (e) {
      // keep for next sync
    }
  }
  return tx.complete || new Promise((res) => (tx.oncomplete = res));
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outbox') {
    event.waitUntil(replayOutbox());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Runtime caching for API GETs
  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return resp;
      }).catch(() => caches.match('/offline.html')))
    );
    return;
  }

  // Queue POSTs when offline
  if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        await saveOutboxRequest(request);
        try {
          await self.registration.sync.register('sync-outbox');
        } catch (err) {
          // sync registration not supported
        }
        return new Response(JSON.stringify({ queued: true }), { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  // Default: try network then cache
  event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/offline.html'))));
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data.json(); } catch (e) { payload = { title: 'Notification', body: event.data?.text() || '' }; }
  const title = payload.title || 'Wasel';
  const options = Object.assign({ body: payload.body, data: payload.data, icon: '/icons/icon-192.png' }, payload.options || {});
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const c of clientList) if (c.url === target && 'focus' in c) return c.focus();
    if (clients.openWindow) return clients.openWindow(target);
  }));
});
/* Service Worker: basic PWA caching, runtime cache for API, and push support.
   - Cache static assets (cache-first)
   - Network-first for API calls with fallback
   - Listen for push events
   - Provide a simple background sync queue for failed POSTs (IndexedDB minimal)

   Note: This is a production-ready scaffold but for advanced retry/queue use a library like Workbox or Background Sync library.
*/

const CACHE_NAME = 'wasel-static-v1';
const RUNTIME_CACHE = 'wasel-runtime-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler: serve precached, then runtime for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Always bypass non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Static assets - cache first
  if (PRECACHE_URLS.some((u) => request.url.includes(u))) {
    event.respondWith(caches.match(request).then((r) => r || fetch(request)));
    return;
  }

  // API network first, then fallback to cache
  if (request.url.includes('/api/') || request.url.includes('/supabase/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(caches.match(request).then((r) => r || fetch(request)));
});

// Push notifications
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Wassel', body: event.data?.text() || 'You have a notification' };
  }

  const title = payload.title || 'Wassel Notification';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Simple background sync placeholder: queue failed POSTs into IndexedDB and retry on sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'wasel-sync-posts') {
    event.waitUntil(
      // For production use a library; here we simply attempt to post queued items
      // TODO: implement IndexedDB queue read and replay logic
      Promise.resolve()
    );
  }
});
// Wassel Service Worker - PWA Cache Management
const CACHE_NAME = 'wassel-v1.0.0';
const RUNTIME_CACHE = 'wassel-runtime-v1';
const IMAGE_CACHE = 'wassel-images-v1';

// Files to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('[Service Worker] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle image requests - cache first
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Image fetch failed:', error);
    // Return placeholder image
    return new Response('', { status: 404 });
  }
}

// Handle API requests - network first, fallback to cache
async function handleApiRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, serving from cache');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests - cache first, fallback to network
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached version and update in background
    fetchAndUpdate(request, cache);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Navigation fetch failed:', error);
    // Return offline page
    return cache.match('/index.html');
  }
}

// Background fetch and update
async function fetchAndUpdate(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail background updates
    console.log('[Service Worker] Background update failed');
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Wassel Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'wassel-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncTrips() {
  // Sync pending trip data when online
  console.log('[Service Worker] Syncing trips...');
  // Implementation depends on your sync logic
}

async function syncMessages() {
  // Sync pending messages when online
  console.log('[Service Worker] Syncing messages...');
  // Implementation depends on your sync logic
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        ))
    );
  }
});

console.log('[Service Worker] Loaded successfully');
