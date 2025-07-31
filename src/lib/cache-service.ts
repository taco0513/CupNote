/**
 * Cache Service for CupNote
 * Implements in-memory caching with TTL and localStorage persistence
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheService {
  private static memoryCache = new Map<string, CacheItem<any>>()
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly STORAGE_PREFIX = 'cupnote_cache_'

  /**
   * Get data from cache
   */
  static get<T>(key: string): T | null {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data
    }

    // Check localStorage
    try {
      const storageKey = this.STORAGE_PREFIX + key
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored)
        if (this.isValid(item)) {
          // Restore to memory cache
          this.memoryCache.set(key, item)
          return item.data
        } else {
          // Clean up expired item
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.error('Cache get error:', error)
    }

    return null
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }

    // Set in memory cache
    this.memoryCache.set(key, item)

    // Persist to localStorage (with error handling for quota exceeded)
    try {
      const storageKey = this.STORAGE_PREFIX + key
      localStorage.setItem(storageKey, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error)
      // Clean up old cache entries if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanup()
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  static invalidate(key: string): void {
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key)
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  static invalidatePattern(pattern: string): void {
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear from localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.STORAGE_PREFIX) && key.includes(pattern)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Cache pattern invalidate error:', error)
    }
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.memoryCache.clear()
    
    try {
      // Clear localStorage cache entries
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Check if cache item is still valid
   */
  private static isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl
  }

  /**
   * Clean up expired entries
   */
  private static cleanup(): void {
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key)
      }
    }

    // Clean localStorage
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const item = JSON.parse(stored)
              if (!this.isValid(item)) {
                keysToRemove.push(key)
              }
            }
          } catch {
            keysToRemove.push(key)
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Cache cleanup error:', error)
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    const memorySize = this.memoryCache.size
    let storageSize = 0
    let totalBytes = 0

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          storageSize++
          const value = localStorage.getItem(key)
          if (value) {
            totalBytes += new Blob([value]).size
          }
        }
      }
    } catch (error) {
      console.error('Cache stats error:', error)
    }

    return {
      memoryEntries: memorySize,
      storageEntries: storageSize,
      storageSizeKB: (totalBytes / 1024).toFixed(2)
    }
  }
}

// Auto cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    CacheService['cleanup']()
  }, 5 * 60 * 1000)
}