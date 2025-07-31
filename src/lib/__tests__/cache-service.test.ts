import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { CacheService } from '../cache-service'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as unknown as Storage

// Mock DOMException for quota exceeded testing
class MockDOMException extends Error {
  name = 'QuotaExceededError'
  constructor(message?: string) {
    super(message)
  }
}

// Mock console
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock Date.now for consistent timestamps
const mockNow = vi.fn()

beforeEach(() => {
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('console', mockConsole)
  vi.stubGlobal('DOMException', MockDOMException)
  
  // Mock Date.now with a consistent timestamp
  mockNow.mockReturnValue(1000000)
  vi.spyOn(Date, 'now').mockImplementation(mockNow)
})

describe('CacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear memory cache using private access
    CacheService['memoryCache'].clear()
    // Reset localStorage mock
    localStorageMock.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('set and get operations', () => {
    it('should store and retrieve data from memory cache', () => {
      const testData = { id: 1, name: 'Test Data', nested: { value: 'nested' } }
      const key = 'test-key'

      CacheService.set(key, testData)
      const result = CacheService.get(key)

      expect(result).toEqual(testData)
      expect(result).toBe(testData) // Returns the same reference from memory
    })

    it('should store data in localStorage with correct format', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      const ttl = 5 * 60 * 1000

      CacheService.set(key, testData, ttl)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote_cache_test-key',
        JSON.stringify({
          data: testData,
          timestamp: 1000000,
          ttl: ttl
        })
      )
    })

    it('should use default TTL when not specified', () => {
      const testData = { id: 1 }
      const key = 'test-key'

      CacheService.set(key, testData)

      const memoryItem = CacheService['memoryCache'].get(key)
      expect(memoryItem?.ttl).toBe(5 * 60 * 1000) // DEFAULT_TTL
    })

    it('should retrieve from localStorage when not in memory', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      const cacheItem = {
        data: testData,
        timestamp: 1000000,
        ttl: 5 * 60 * 1000,
      }

      // Mock localStorage to return the cached item
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheItem))

      const result = CacheService.get(key)

      expect(result).toEqual(testData)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cupnote_cache_test-key')
      
      // Should restore to memory cache
      const memoryItem = CacheService['memoryCache'].get(key)
      expect(memoryItem).toEqual(cacheItem)
    })

    it('should return null for non-existent key', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = CacheService.get('non-existent-key')
      
      expect(result).toBeNull()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cupnote_cache_non-existent-key')
    })

    it('should handle expired cache items from memory', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      
      // Set item with a short TTL and advance time
      CacheService.set(key, testData, 1000) // 1 second TTL
      
      // Advance time beyond TTL
      mockNow.mockReturnValue(1000000 + 2000) // 2 seconds later
      
      const result = CacheService.get(key)
      expect(result).toBeNull()
    })

    it('should handle expired cache items from localStorage', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      const expiredCacheItem = {
        data: testData,
        timestamp: 1000000 - 10 * 60 * 1000, // 10 minutes ago
        ttl: 5 * 60 * 1000, // 5 minute TTL
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCacheItem))

      const result = CacheService.get(key)

      expect(result).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_test-key')
    })

    it('should handle malformed localStorage data', () => {
      const key = 'test-key'
      
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = CacheService.get(key)

      expect(result).toBeNull()
      expect(mockConsole.error).toHaveBeenCalledWith('Cache get error:', expect.any(Error))
    })

    it('should handle localStorage quota exceeded error', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      
      // Mock setItem to throw QuotaExceededError
      localStorageMock.setItem.mockImplementation(() => {
        throw new MockDOMException('Quota exceeded')
      })

      // Should not throw, but should warn and call cleanup
      CacheService.set(key, testData)

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to persist cache to localStorage:',
        expect.any(MockDOMException)
      )
    })

    it('should handle generic localStorage errors', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'
      
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      CacheService.set(key, testData)

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to persist cache to localStorage:',
        expect.any(Error)
      )
    })
  })

  describe('invalidate operations', () => {
    it('should remove item from memory and localStorage', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'test-key'

      CacheService.set(key, testData)
      CacheService.invalidate(key)

      expect(CacheService.get(key)).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_test-key')
    })

    it('should handle localStorage error during invalidation', () => {
      const key = 'test-key'
      
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      CacheService.invalidate(key)

      expect(mockConsole.error).toHaveBeenCalledWith('Cache invalidate error:', expect.any(Error))
    })

    it('should invalidate pattern matching keys', () => {
      // Set up memory cache
      CacheService.set('user_123_profile', { name: 'User 123' })
      CacheService.set('user_456_profile', { name: 'User 456' })
      CacheService.set('post_789', { title: 'Post 789' })

      // Mock localStorage keys
      localStorageMock.length = 4
      localStorageMock.key
        .mockReturnValueOnce('cupnote_cache_user_123_profile')
        .mockReturnValueOnce('cupnote_cache_user_456_profile')
        .mockReturnValueOnce('cupnote_cache_post_789')
        .mockReturnValueOnce('other_key')

      CacheService.invalidatePattern('user_')

      // Should remove user-related items from memory
      expect(CacheService.get('user_123_profile')).toBeNull()
      expect(CacheService.get('user_456_profile')).toBeNull()
      expect(CacheService.get('post_789')).not.toBeNull()

      // Should remove user-related items from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_user_123_profile')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_user_456_profile')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cupnote_cache_post_789')
    })

    it('should handle error during pattern invalidation', () => {
      localStorageMock.length = 1
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      CacheService.invalidatePattern('user_')

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Cache pattern invalidate error:',
        expect.any(Error)
      )
    })
  })

  describe('clear operations', () => {
    it('should clear all cache entries', () => {
      // Set up memory cache
      CacheService.set('key1', { data: 1 })
      CacheService.set('key2', { data: 2 })

      // Mock localStorage keys
      localStorageMock.length = 3
      localStorageMock.key
        .mockReturnValueOnce('cupnote_cache_key1')
        .mockReturnValueOnce('cupnote_cache_key2')
        .mockReturnValueOnce('other_key')

      CacheService.clear()

      // Memory cache should be cleared
      expect(CacheService.get('key1')).toBeNull()
      expect(CacheService.get('key2')).toBeNull()

      // Only cupnote cache keys should be removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_key1')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_key2')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key')
    })

    it('should handle error during clear operation', () => {
      localStorageMock.length = 1
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      CacheService.clear()

      expect(mockConsole.error).toHaveBeenCalledWith('Cache clear error:', expect.any(Error))
    })
  })

  describe('cleanup operations', () => {
    it('should cleanup expired entries from memory and localStorage', () => {
      // Set up expired items in memory
      const expiredItem = {
        data: { id: 1 },
        timestamp: 1000000 - 10 * 60 * 1000, // 10 minutes ago
        ttl: 5 * 60 * 1000 // 5 minute TTL
      }
      const validItem = {
        data: { id: 2 },
        timestamp: 1000000 - 1 * 60 * 1000, // 1 minute ago  
        ttl: 5 * 60 * 1000 // 5 minute TTL
      }

      CacheService['memoryCache'].set('expired', expiredItem)
      CacheService['memoryCache'].set('valid', validItem)

      // Mock localStorage for cleanup
      localStorageMock.length = 3
      localStorageMock.key
        .mockReturnValueOnce('cupnote_cache_expired_storage')
        .mockReturnValueOnce('cupnote_cache_valid_storage')
        .mockReturnValueOnce('other_key')
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(expiredItem))
        .mockReturnValueOnce(JSON.stringify(validItem))

      // Call private cleanup method
      CacheService['cleanup']()

      // Expired items should be removed from memory
      expect(CacheService['memoryCache'].has('expired')).toBe(false)
      expect(CacheService['memoryCache'].has('valid')).toBe(true)

      // Expired items should be removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_expired_storage')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('cupnote_cache_valid_storage')
    })

    it('should handle malformed data during cleanup', () => {
      localStorageMock.length = 2
      localStorageMock.key
        .mockReturnValueOnce('cupnote_cache_malformed')
        .mockReturnValueOnce('cupnote_cache_valid')
      
      localStorageMock.getItem
        .mockReturnValueOnce('invalid json')
        .mockReturnValueOnce(JSON.stringify({
          data: { id: 1 },
          timestamp: 1000000,
          ttl: 5 * 60 * 1000
        }))

      CacheService['cleanup']()

      // Malformed entry should be removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cupnote_cache_malformed')
    })

    it('should handle cleanup errors gracefully', () => {
      localStorageMock.length = 1
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      CacheService['cleanup']()

      expect(mockConsole.error).toHaveBeenCalledWith('Cache cleanup error:', expect.any(Error))
    })
  })

  describe('getStats operations', () => {
    it('should return cache statistics', () => {
      // Set up memory cache
      CacheService.set('key1', { data: 1 })
      CacheService.set('key2', { data: 2 })

      // Mock localStorage for stats
      localStorageMock.length = 4
      localStorageMock.key
        .mockReturnValueOnce('cupnote_cache_storage1')
        .mockReturnValueOnce('cupnote_cache_storage2')
        .mockReturnValueOnce('other_key')
        .mockReturnValueOnce('cupnote_cache_storage3')
      
      localStorageMock.getItem
        .mockReturnValueOnce('{"data":{"test":true}}') // ~22 bytes
        .mockReturnValueOnce('{"data":{"another":"value"}}') // ~27 bytes
        .mockReturnValueOnce('{"data":{"third":"item"}}') // ~23 bytes

      const stats = CacheService.getStats()

      expect(stats.memoryEntries).toBe(2)
      expect(stats.storageEntries).toBe(3)
      expect(parseFloat(stats.storageSizeKB)).toBeGreaterThan(0)
    })

    it('should handle stats calculation errors', () => {
      localStorageMock.length = 1
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const stats = CacheService.getStats()

      expect(stats.memoryEntries).toBe(0)
      expect(stats.storageEntries).toBe(0)
      expect(stats.storageSizeKB).toBe('0.00')
      expect(mockConsole.error).toHaveBeenCalledWith('Cache stats error:', expect.any(Error))
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle undefined/null data gracefully', () => {
      CacheService.set('null-data', null)
      CacheService.set('undefined-data', undefined)

      expect(CacheService.get('null-data')).toBe(null)
      expect(CacheService.get('undefined-data')).toBe(undefined)
    })

    it('should handle complex data structures', () => {
      const complexData = {
        array: [1, 2, { nested: true }],
        date: new Date().toISOString(),
        nested: {
          deep: {
            value: 'test'
          }
        }
      }

      CacheService.set('complex', complexData)
      const result = CacheService.get('complex')

      expect(result).toBeDefined()
      expect(result.array).toEqual([1, 2, { nested: true }])
      expect(result.nested.deep.value).toBe('test')
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000)
      const testData = { id: 1 }

      CacheService.set(longKey, testData)
      const result = CacheService.get(longKey)

      expect(result).toEqual(testData)
    })

    it('should handle zero TTL', () => {
      const testData = { id: 1 }
      const key = 'zero-ttl'

      CacheService.set(key, testData, 0)
      
      // Should expire immediately
      const result = CacheService.get(key)
      expect(result).toBeNull()
    })

    it('should validate cache item structure', () => {
      const key = 'test-key'
      
      // Mock invalid cache item structure
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data: { id: 1 },
        // missing timestamp and ttl
      }))

      const result = CacheService.get(key)
      
      // Should handle gracefully and return null
      expect(result).toBeNull()
    })
  })

  describe('type safety', () => {
    it('should maintain type safety for generic data', () => {
      interface TestData {
        id: number
        name: string
        optional?: boolean
      }

      const testData: TestData = { id: 1, name: 'Test' }
      const key = 'typed-data'

      CacheService.set<TestData>(key, testData)
      const result = CacheService.get<TestData>(key)

      // TypeScript should enforce the type
      expect(result?.id).toBe(1)
      expect(result?.name).toBe('Test')
    })
  })

  describe('performance considerations', () => {
    it('should prefer memory cache over localStorage', () => {
      const testData = { id: 1, name: 'Test' }
      const key = 'performance-test'

      // Set in both memory and localStorage
      CacheService.set(key, testData)
      
      // Clear localStorage mock calls
      vi.clearAllMocks()

      // Get should use memory cache
      const result = CacheService.get(key)

      expect(result).toEqual(testData)
      expect(localStorageMock.getItem).not.toHaveBeenCalled()
    })

    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `Item ${i}`,
        nested: { value: i * 2 }
      }))

      const key = 'large-dataset'

      CacheService.set(key, largeData)
      const result = CacheService.get(key)

      expect(result).toHaveLength(1000)
      expect(result[999]).toEqual({
        id: 999,
        data: 'Item 999',
        nested: { value: 1998 }
      })
    })
  })
})