/**
 * PWA Manager - 2025 Enhanced PWA Features
 * Handles service worker communication, caching, offline sync, and push notifications
 */

export interface CacheInfo {
  size: number
  entries: number
}

export interface SyncQueueItem {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null
  timestamp: number
}

export interface PWAInstallPrompt {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    deferredPrompt?: PWAInstallPrompt
  }
}

class PWAManager {
  private sw: ServiceWorkerRegistration | null = null
  private syncListeners: Set<(event: { synced: boolean; pending: number }) => void> = new Set()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeServiceWorker()
      this.setupInstallPrompt()
      this.setupOnlineListener()
    }
  }

  // Service Worker Registration
  private async initializeServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('PWA: Service Worker not supported')
      return
    }

    // Skip for iOS WebView
    const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent)
    const isIOSApp = navigator.userAgent.includes('CupNote-iOS')
    
    if (isIOSWebView || isIOSApp) {
      console.log('PWA: Skipping SW registration for iOS WebView')
      return
    }

    try {
      this.sw = await navigator.serviceWorker.register('/sw.js')
      console.log('PWA: Service Worker registered successfully')

      // Handle updates
      this.sw.addEventListener('updatefound', () => {
        const newWorker = this.sw?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification()
            }
          })
        }
      })

      // Handle messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data)
      })

    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error)
    }
  }

  // Install Prompt Handling
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      window.deferredPrompt = e as PWAInstallPrompt
      console.log('PWA: Install prompt ready')
    })

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully')
      window.deferredPrompt = undefined
    })
  }

  // Online/Offline Detection
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('PWA: Back online - triggering sync')
      this.triggerBackgroundSync()
    })

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline')
    })
  }

  // Install PWA
  async showInstallPrompt(): Promise<boolean> {
    if (!window.deferredPrompt) {
      console.log('PWA: Install prompt not available')
      return false
    }

    try {
      await window.deferredPrompt.prompt()
      const { outcome } = await window.deferredPrompt.userChoice
      window.deferredPrompt = undefined
      
      console.log('PWA: Install prompt result:', outcome)
      return outcome === 'accepted'
    } catch (error) {
      console.error('PWA: Install prompt failed:', error)
      return false
    }
  }

  // Check if PWA is installable
  isInstallable(): boolean {
    return !!window.deferredPrompt
  }

  // Check if running as PWA
  isPWA(): boolean {
    const isStandalone = window.navigator.standalone === true
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
    return isStandalone || isDisplayStandalone
  }

  // Cache Management
  async getCacheInfo(): Promise<CacheInfo> {
    if (!this.sw) return { size: 0, entries: 0 }

    return new Promise((resolve) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve({ size: event.data.size, entries: 0 })
        }
      }

      this.sw?.active?.postMessage({ type: 'GET_CACHE_SIZE' }, [channel.port2])
      
      // Timeout fallback
      setTimeout(() => resolve({ size: 0, entries: 0 }), 5000)
    })
  }

  async clearCache(): Promise<boolean> {
    if (!this.sw) return false

    return new Promise((resolve) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve(event.data.success)
        }
      }

      this.sw?.active?.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2])
      
      // Timeout fallback
      setTimeout(() => resolve(false), 10000)
    })
  }

  // Preload Routes
  preloadRoute(url: string) {
    if (!this.sw) return

    this.sw.active?.postMessage({
      type: 'PRELOAD_ROUTE',
      data: { url }
    })
  }

  // Background Sync
  async triggerBackgroundSync() {
    if (!this.sw || !this.sw.sync) return

    try {
      await this.sw.sync.register('coffee-data-sync')
      console.log('PWA: Background sync registered')
    } catch (error) {
      console.log('PWA: Background sync not supported')
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.sw) return []

    return new Promise((resolve) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'SYNC_QUEUE') {
          resolve(event.data.queue)
        }
      }

      this.sw?.active?.postMessage({ type: 'GET_SYNC_QUEUE' }, [channel.port2])
      
      // Timeout fallback
      setTimeout(() => resolve([]), 5000)
    })
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('PWA: Notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.sw) return null

    try {
      const permission = await this.requestNotificationPermission()
      if (permission !== 'granted') {
        console.log('PWA: Notification permission denied')
        return null
      }

      // You would need to replace this with your actual VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.log('PWA: VAPID public key not configured')
        return null
      }

      const subscription = await this.sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      console.log('PWA: Push subscription created')
      return subscription
    } catch (error) {
      console.error('PWA: Push subscription failed:', error)
      return null
    }
  }

  // Event Listeners
  onSyncComplete(callback: (event: { synced: boolean; pending: number }) => void) {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  // Private Methods
  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'SW_ACTIVATED':
        console.log('PWA: Service Worker activated, version:', data.version)
        break
        
      case 'SYNC_COMPLETE':
        console.log('PWA: Sync complete, synced:', data.synced, 'pending:', data.pending)
        this.syncListeners.forEach(callback => callback(data))
        break
        
      default:
        console.log('PWA: Unknown message from SW:', data)
    }
  }

  private showUpdateNotification() {
    // Show user-friendly update notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CupNote 업데이트', {
        body: '새 버전이 설치되었습니다. 페이지를 새로고침해주세요.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'app-update'
      })
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Network Status
  isOnline(): boolean {
    return navigator.onLine
  }

  // App Version and Update
  async checkForUpdates(): Promise<boolean> {
    if (!this.sw) return false

    try {
      await this.sw.update()
      return true
    } catch (error) {
      console.error('PWA: Update check failed:', error)
      return false
    }
  }

  // Force Update
  async forceUpdate() {
    if (!this.sw) return

    const newWorker = this.sw.installing || this.sw.waiting
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager()

// Utility functions
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isPWAInstallable(): boolean {
  return pwaManager.isInstallable()
}

export function isPWAMode(): boolean {
  return pwaManager.isPWA()
}