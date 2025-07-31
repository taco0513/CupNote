import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CacheService } from '../cache-service'

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    CacheService.clear()
    vi.clearAllMocks()
  })

  describe('get and set', () => {
    it('should store and retrieve data from memory cache', () => {
      const testData = { id: 1, name: 'Test Coffee' }
      const key = 'test-key'

      CacheService.set(key, testData)
      const retrieved = CacheService.get(key)

      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const retrieved = CacheService.get('non-existent-key')
      expect(retrieved).toBeNull()
    })

    it('should handle TTL expiration', () => {
      const testData = { id: 1, name: 'Test Coffee' }
      const key = 'test-key'
      const shortTTL = 10 // 10ms

      CacheService.set(key, testData, shortTTL)
      
      // Should be available immediately
      expect(CacheService.get(key)).toEqual(testData)

      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(CacheService.get(key)).toBeNull()
          resolve(undefined)
        }, 20)
      })
    })
  })

  describe('invalidate', () => {
    it('should remove specific cache entry', () => {
      const testData = { id: 1, name: 'Test Coffee' }
      const key = 'test-key'

      CacheService.set(key, testData)
      expect(CacheService.get(key)).toEqual(testData)

      CacheService.invalidate(key)
      expect(CacheService.get(key)).toBeNull()
    })

    it('should handle invalidation of non-existent keys', () => {
      expect(() => {
        CacheService.invalidate('non-existent-key')
      }).not.toThrow()
    })
  })

  describe('invalidatePattern', () => {
    it('should remove entries matching pattern', () => {
      CacheService.set('records_page_1', { page: 1 })
      CacheService.set('records_page_2', { page: 2 })
      CacheService.set('user_profile', { name: 'John' })

      CacheService.invalidatePattern('records_')

      expect(CacheService.get('records_page_1')).toBeNull()
      expect(CacheService.get('records_page_2')).toBeNull()
      expect(CacheService.get('user_profile')).toEqual({ name: 'John' })
    })
  })

  describe('clear', () => {
    it('should remove all cache entries', () => {
      CacheService.set('key1', { data: 1 })
      CacheService.set('key2', { data: 2 })

      CacheService.clear()

      expect(CacheService.get('key1')).toBeNull()
      expect(CacheService.get('key2')).toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', () => {
      CacheService.set('key1', { data: 1 })
      CacheService.set('key2', { data: 2 })

      const stats = CacheService.getStats()

      expect(stats).toHaveProperty('memoryEntries')
      expect(stats).toHaveProperty('storageEntries')
      expect(stats).toHaveProperty('storageSizeKB')
      expect(stats.memoryEntries).toBe(2)
    })
  })

  describe('localStorage integration', () => {
    it('should persist to localStorage', () => {
      const testData = { id: 1, name: 'Test Coffee' }
      const key = 'test-key'

      CacheService.set(key, testData)

      // Check if localStorage.setItem was called
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cupnote_cache_test-key',
        expect.stringContaining('"data":{"id":1,"name":"Test Coffee"}')
      )
    })

    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw QuotaExceededError
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError')
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw quotaError
      })

      expect(() => {
        CacheService.set('test-key', { large: 'data' })
      }).not.toThrow()
    })

    it('should retrieve from localStorage when memory cache is empty', () => {
      const testData = { id: 1, name: 'Test Coffee' }
      const key = 'test-key'
      const cacheItem = {
        data: testData,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      }

      // Mock localStorage to return cached data
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(cacheItem))

      const retrieved = CacheService.get(key)
      expect(retrieved).toEqual(testData)
    })
  })
})