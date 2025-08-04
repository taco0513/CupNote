/**
 * CupNote Service Worker - Enhanced PWA 2025
 * Features: Advanced caching, background sync, push notifications, offline support
 */

const CACHE_VERSION = '1.3.1'
const STATIC_CACHE = `cupnote-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `cupnote-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `cupnote-images-${CACHE_VERSION}`
const API_CACHE = `cupnote-api-${CACHE_VERSION}`

// Critical resources for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png'
]

// Routes that should be cached for offline access
const CACHEABLE_ROUTES = [
  '/mode-selection',
  '/my-records',
  '/achievements', 
  '/profile',
  '/settings'
]

// API endpoints to cache for offline functionality
const CACHEABLE_APIS = ['/api/auth/user', '/api/user/profile']

// Enhanced install event with multiple cache strategies
self.addEventListener('install', (event) => {
  console.log('CupNote SW: Installing v' + CACHE_VERSION)
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('CupNote SW: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('CupNote SW: All caches initialized')
      return self.skipWaiting()
    }).catch((error) => {
      console.error('CupNote SW: Install failed', error)
    })
  )
})

// Enhanced activate event with selective cache cleanup
self.addEventListener('activate', (event) => {
  console.log('CupNote SW: Activating v' + CACHE_VERSION)
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE]
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('CupNote SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('CupNote SW: Activation complete')
      // Notify clients of successful activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION })
        })
      })
    })
  )
})

// Advanced fetch event with multiple caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const request = event.request
  
  // Skip cross-origin requests unless they're APIs
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) {
    return
  }
  
  // Navigation requests - Cache First with Network Fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request, url))
    return
  }
  
  // API requests - Network First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request, url))
    return
  }
  
  // Image requests - Cache First with Stale While Revalidate
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
    return
  }
  
  // Static assets - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font' || 
      request.destination === 'manifest') {
    event.respondWith(handleStaticRequest(request))
    return
  }
  
  // Other requests - Network First
  event.respondWith(handleDynamicRequest(request))
})

// Navigation request handler
async function handleNavigationRequest(request, url) {
  const pathname = url.pathname
  
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request)
    
    // Cache successful navigation responses
    if (networkResponse.ok && CACHEABLE_ROUTES.includes(pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('CupNote SW: Network failed for navigation:', pathname)
    
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to homepage if available
    const homepageResponse = await caches.match('/')
    if (homepageResponse) {
      return homepageResponse
    }
    
    // Last resort - offline page
    return caches.match('/offline') || new Response('Offline', { status: 503 })
  }
}

// API request handler
async function handleAPIRequest(request, url) {
  const pathname = url.pathname
  
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful GET requests for offline access
    if (networkResponse.ok && request.method === 'GET' && CACHEABLE_APIS.includes(pathname)) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('CupNote SW: Network failed for API:', pathname)
    
    // Return cached response for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // For POST/PUT/DELETE, queue for background sync
    if (request.method !== 'GET') {
      await queueBackgroundSync(request)
    }
    
    throw error
  }
}

// Image request handler with stale-while-revalidate
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background (stale-while-revalidate)
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
    }).catch(() => {
      // Ignore network errors for background updates
    })
    
    return cachedResponse
  }
  
  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return placeholder for failed image loads
    return new Response('', { status: 404 })
  }
}

// Static asset handler
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

// Dynamic content handler
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Queue failed requests for background sync
async function queueBackgroundSync(request) {
  // Store failed request for retry when online
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.body ? await request.text() : null,
    timestamp: Date.now()
  }
  
  // Use IndexedDB or simple queue in SW global scope
  if (!self.syncQueue) {
    self.syncQueue = []
  }
  
  self.syncQueue.push(requestData)
  
  // Register background sync if supported
  if (self.registration.sync) {
    try {
      await self.registration.sync.register('coffee-data-sync')
    } catch (error) {
      console.log('CupNote SW: Background sync registration failed')
    }
  }
}

// Enhanced message handling with 2025 features
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {}
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'FORCE_PWA_MODE':
      console.log('CupNote SW: Force PWA mode requested')
      event.ports[0].postMessage({ success: true })
      break
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size })
      })
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED', success: true })
      })
      break
      
    case 'PRELOAD_ROUTE':
      if (data?.url) {
        preloadRoute(data.url)
      }
      break
      
    case 'GET_SYNC_QUEUE':
      event.ports[0].postMessage({ 
        type: 'SYNC_QUEUE', 
        queue: self.syncQueue || [] 
      })
      break
  }
})

// Background sync event for offline data
self.addEventListener('sync', (event) => {
  console.log('CupNote SW: Background sync triggered:', event.tag)
  
  if (event.tag === 'coffee-data-sync') {
    event.waitUntil(syncOfflineData())
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('CupNote SW: Push notification received')
  
  const options = {
    body: 'CupNote에서 새로운 소식이 있습니다!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'cupnote-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '열기',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: '닫기'
      }
    ]
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.title = payload.title || 'CupNote'
      options.data = payload.data || {}
    } catch (error) {
      console.log('CupNote SW: Invalid push payload')
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('CupNote', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('CupNote SW: Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  // Open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        const targetUrl = event.notification.data?.url || '/'
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// Utility functions
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    }
  }
  
  return totalSize
}

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
}

async function preloadRoute(url) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(url, response)
    }
  } catch (error) {
    console.log('CupNote SW: Preload failed for:', url)
  }
}

async function syncOfflineData() {
  if (!self.syncQueue || self.syncQueue.length === 0) {
    return
  }
  
  console.log('CupNote SW: Syncing', self.syncQueue.length, 'offline requests')
  
  const failedRequests = []
  
  for (const requestData of self.syncQueue) {
    try {
      const { url, method, headers, body } = requestData
      
      const response = await fetch(url, {
        method,
        headers,
        body: body ? body : undefined
      })
      
      if (!response.ok) {
        failedRequests.push(requestData)
      }
    } catch (error) {
      console.log('CupNote SW: Sync failed for:', requestData.url)
      failedRequests.push(requestData)
    }
  }
  
  // Keep failed requests for next sync
  self.syncQueue = failedRequests
  
  // Notify clients of sync completion
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      synced: self.syncQueue.length === 0,
      pending: failedRequests.length
    })
  })
}