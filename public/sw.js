// SafeRoute Service Worker
// Provides offline-first caching for emergency navigation

const CACHE_NAME = 'saferoute-v1'
const OFFLINE_URL = '/'

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/manifest.json',
]

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      
      // Cache precache resources
      await cache.addAll(PRECACHE_RESOURCES)
      
      // Activate immediately
      await self.skipWaiting()
    })()
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
      
      // Take control of all clients immediately
      await self.clients.claim()
    })()
  )
})

// Fetch event - network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return
  }
  
  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          
          // Cache successful responses
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, response.clone())
          }
          
          return response
        } catch {
          // Return cached response if available
          const cached = await caches.match(request)
          if (cached) {
            return cached
          }
          
          // Return error response for API calls
          return new Response(
            JSON.stringify({ error: 'Offline', cached: false }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      })()
    )
    return
  }
  
  // Static resources - cache first, network fallback
  event.respondWith(
    (async () => {
      // Try cache first
      const cached = await caches.match(request)
      if (cached) {
        // Update cache in background
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response)
              })
            }
          })
          .catch(() => {})
        
        return cached
      }
      
      // Try network
      try {
        const response = await fetch(request)
        
        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, response.clone())
        }
        
        return response
      } catch {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match(OFFLINE_URL)
          if (offlinePage) {
            return offlinePage
          }
        }
        
        // Return error response
        return new Response('Offline', { status: 503 })
      }
    })()
  )
})

// Background sync for SOS messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sos') {
    event.waitUntil(syncSOSMessages())
  }
})

async function syncSOSMessages() {
  // This would sync queued SOS messages when back online
  // Implementation depends on IndexedDB storage of pending messages
  console.log('[ServiceWorker] Syncing SOS messages')
}

// Push notifications for alerts
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body || 'Emergency alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'emergency-alert',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: data.url || '/'
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SafeRoute Alert', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})
