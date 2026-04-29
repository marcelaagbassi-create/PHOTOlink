// ═══════════════════════════════════════════════════
// PHOTOlink Service Worker v1.0
// Offline-first caching strategy
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'photolink-v1.0.0';
const STATIC_CACHE = 'photolink-static-v1';
const DYNAMIC_CACHE = 'photolink-dynamic-v1';

// Files to cache immediately on install
const STATIC_ASSETS = [
  './PHOTOLINK.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Firebase CDN files
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono&display=swap'
];

// ─── INSTALL: cache static assets ───────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Installing PHOTOlink v1.0.0...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      console.log('[SW] Caching static assets');
      // Cache each asset individually to avoid one failure blocking all
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Failed to cache:', url, err);
          });
        })
      );
    }).then(function() {
      console.log('[SW] Static assets cached');
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE: clean old caches ─────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map(function(name) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(function() {
      console.log('[SW] Activated! Claiming clients...');
      return self.clients.claim();
    })
  );
});

// ─── FETCH: offline-first strategy ──────────────────
self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  // Skip non-GET requests and Firebase API calls (let them go to network)
  if(event.request.method !== 'GET') return;
  if(url.includes('firestore.googleapis.com')) return;
  if(url.includes('identitytoolkit.googleapis.com')) return;
  if(url.includes('securetoken.googleapis.com')) return;
  if(url.includes('fcm.googleapis.com')) return;
  
  // Strategy: Cache First for static assets, Network First for others
  const isStatic = STATIC_ASSETS.some(function(asset) {
    return url === asset || url.endsWith('PHOTOLINK.html') || 
           url.endsWith('manifest.json') || url.endsWith('.png');
  });
  
  if(isStatic) {
    // CACHE FIRST
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if(cached) {
          // Refresh cache in background
          fetch(event.request).then(function(response) {
            if(response && response.status === 200) {
              caches.open(STATIC_CACHE).then(function(cache) {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(function(){});
          return cached;
        }
        return fetch(event.request).then(function(response) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        }).catch(function() {
          // Return offline fallback page
          return caches.match('./PHOTOLINK.html');
        });
      })
    );
  } else {
    // NETWORK FIRST with cache fallback
    event.respondWith(
      fetch(event.request).then(function(response) {
        if(response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./PHOTOLINK.html');
        });
      })
    );
  }
});

// ─── BACKGROUND SYNC ────────────────────────────────
self.addEventListener('sync', function(event) {
  if(event.tag === 'sync-posts') {
    event.waitUntil(syncPendingPosts());
  }
});

function syncPendingPosts() {
  // Sync pending posts when back online
  return self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-posts' });
    });
  });
}

// ─── PUSH NOTIFICATIONS ─────────────────────────────
self.addEventListener('push', function(event) {
  if(!event.data) return;
  var data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'PHOTOlink', body: event.data.text() }; }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'PHOTOlink', {
      body: data.body || 'Vous avez une nouvelle notification',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: data.tag || 'photolink-notif',
      data: data.url || './',
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if(event.action === 'dismiss') return;
  event.waitUntil(
    clients.openWindow(event.notification.data || './')
  );
});

console.log('[SW] PHOTOlink Service Worker loaded!');
