/**
 * CupNote Service Worker - PWA Navigation Control
 * 모든 네비게이션을 PWA 모드로 강제 유지
 */

const CACHE_NAME = 'cupnote-v1.3.0'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('CupNote SW: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('CupNote SW: Caching app shell')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        // 즉시 활성화
        return self.skipWaiting()
      })
  )
})

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('CupNote SW: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('CupNote SW: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // 모든 클라이언트 제어
      return self.clients.claim()
    })
  )
})

// 가져오기 이벤트 - PWA 네비게이션 제어
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // 같은 오리진의 네비게이션 요청만 처리
  if (event.request.mode === 'navigate' && url.origin === self.location.origin) {
    console.log('CupNote SW: Handling navigation to:', url.pathname)
    
    event.respondWith(
      fetch(event.request).catch(() => {
        // 네트워크 실패 시 캐시에서 홈페이지 반환
        return caches.match('/')
      })
    )
    return
  }
  
  // 정적 자원 캐싱
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone())
            return fetchResponse
          })
        })
      })
    )
  }
})

// 메시지 처리 - 클라이언트와 통신
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'FORCE_PWA_MODE') {
    console.log('CupNote SW: Force PWA mode requested')
    // PWA 모드 강제 활성화 신호
    event.ports[0].postMessage({ success: true })
  }
})