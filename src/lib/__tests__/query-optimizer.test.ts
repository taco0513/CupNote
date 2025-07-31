import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { QueryOptimizer, type QueryOptions, type PaginatedResult } from '../query-optimizer'
import { CacheService } from '../cache-service'
import type { CoffeeRecord } from '../../types/coffee'

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    in: vi.fn().mockReturnThis(),
  })),
}

// Mock CacheService
vi.mock('../cache-service', () => ({
  CacheService: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    invalidatePattern: vi.fn(),
  },
}))

// Mock console
const mockConsole = {
  error: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

beforeEach(() => {
  vi.stubGlobal('console', mockConsole)
})

describe('QueryOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock for authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
  })

  describe('getPaginatedRecords', () => {
    it('should return empty result for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await QueryOptimizer.getPaginatedRecords()

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      })
    })

    it('should build query with default options', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'test-user-id',
          coffee_name: 'Test Coffee',
          taste_notes: 'Fruity',
          rating: 4,
          created_at: '2025-01-31T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      })

      const result = await QueryOptimizer.getPaginatedRecords()

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19)
    })

    it('should apply filters correctly', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const options = {
        filters: {
          mode: 'cafe',
          rating: 4,
          hasImages: true,
          dateFrom: '2025-01-01T00:00:00Z',
          dateTo: '2025-01-31T23:59:59Z',
        },
      }

      await QueryOptimizer.getPaginatedRecords(options)

      expect(mockQuery.eq).toHaveBeenCalledWith('mode', 'cafe')
      expect(mockQuery.gte).toHaveBeenCalledWith('rating', 4)
      expect(mockQuery.not).toHaveBeenCalledWith('image_url', 'is', null)
      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', '2025-01-01T00:00:00Z')
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', '2025-01-31T23:59:59Z')
    })

    it('should apply sorting correctly', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const options = {
        sortBy: 'rating',
        sortOrder: 'asc' as const,
      }

      await QueryOptimizer.getPaginatedRecords(options)

      expect(mockQuery.order).toHaveBeenCalledWith('rating', { ascending: true })
    })

    it('should apply pagination correctly', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const options = {
        page: 2,
        pageSize: 10,
      }

      await QueryOptimizer.getPaginatedRecords(options)

      expect(mockQuery.range).toHaveBeenCalledWith(10, 19) // page 2, size 10
    })

    it('should transform records correctly', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'test-user-id',
          coffee_name: 'Test Coffee',
          roastery: 'Test Roastery',
          origin: 'Ethiopia',
          roasting_level: 'Medium',
          taste_notes: 'Fruity and bright',
          roaster_notes: 'Notes from roaster',
          personal_notes: 'My notes',
          rating: 4,
          mode: 'cafe',
          match_score: 85,
          image_url: 'https://example.com/image.jpg',
          additional_images: ['https://example.com/image2.jpg'],
          created_at: '2025-01-31T10:00:00Z',
          updated_at: '2025-01-31T11:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      })

      const result = await QueryOptimizer.getPaginatedRecords()

      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        id: '1',
        userId: 'test-user-id',
        coffeeName: 'Test Coffee',
        roastery: 'Test Roastery',
        origin: 'Ethiopia',
        roastLevel: 'Medium',
        taste: 'Fruity and bright',
        roasterNote: 'Notes from roaster',
        memo: 'My notes',
        rating: 4,
        mode: 'cafe',
        createdAt: '2025-01-31T10:00:00Z',
        updatedAt: '2025-01-31T11:00:00Z',
        images: ['https://example.com/image.jpg', 'https://example.com/image2.jpg'],
        matchScore: {
          overall: 85,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: [],
        },
      })
    })

    it('should handle query errors', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
        count: null,
      })

      await expect(QueryOptimizer.getPaginatedRecords()).rejects.toThrow('Database error')
    })
  })

  describe('getRecordById', () => {
    it('should return null for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await QueryOptimizer.getRecordById('test-id')

      expect(result).toBeNull()
    })

    it('should query single record correctly', async () => {
      const mockData = {
        id: 'test-id',
        user_id: 'test-user-id',
        coffee_name: 'Test Coffee',
        taste_notes: 'Fruity',
        rating: 4,
        created_at: '2025-01-31T10:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await QueryOptimizer.getRecordById('test-id')

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(result).toMatchObject({
        id: 'test-id',
        coffeeName: 'Test Coffee',
        taste: 'Fruity',
        rating: 4,
      })
    })

    it('should return null for non-existent record', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      })

      const result = await QueryOptimizer.getRecordById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('getRecordsByIds', () => {
    it('should batch load multiple records', async () => {
      const mockData = [
        {
          id: 'id1',
          user_id: 'test-user-id',
          coffee_name: 'Coffee 1',
          created_at: '2025-01-31T10:00:00Z',
        },
        {
          id: 'id2',
          user_id: 'test-user-id',
          coffee_name: 'Coffee 2',
          created_at: '2025-01-31T11:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await QueryOptimizer.getRecordsByIds(['id1', 'id2'])

      expect(mockQuery.in).toHaveBeenCalledWith('id', ['id1', 'id2'])
      expect(result.size).toBe(2)
      expect(result.get('id1')).toMatchObject({ coffeeName: 'Coffee 1' })
      expect(result.get('id2')).toMatchObject({ coffeeName: 'Coffee 2' })
    })

    it('should use cached records when available', async () => {
      const cachedRecord = {
        id: 'cached-id',
        coffeeName: 'Cached Coffee',
        userId: 'test-user-id',
      } as CoffeeRecord

      vi.mocked(CacheService.get)
        .mockReturnValueOnce(cachedRecord) // First ID cached
        .mockReturnValueOnce(null) // Second ID not cached

      const mockData = [
        {
          id: 'uncached-id',
          user_id: 'test-user-id',
          coffee_name: 'Uncached Coffee',
          created_at: '2025-01-31T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await QueryOptimizer.getRecordsByIds(['cached-id', 'uncached-id'])

      // Should only query for uncached IDs
      expect(mockQuery.in).toHaveBeenCalledWith('id', ['uncached-id'])
      expect(result.size).toBe(2)
      expect(result.get('cached-id')).toEqual(cachedRecord)
      expect(result.get('uncached-id')).toMatchObject({ coffeeName: 'Uncached Coffee' })
    })

    it('should return empty map for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await QueryOptimizer.getRecordsByIds(['id1', 'id2'])

      expect(result.size).toBe(0)
    })

    it('should handle database errors gracefully', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      })

      const result = await QueryOptimizer.getRecordsByIds(['id1', 'id2'])

      expect(result.size).toBe(0)
      expect(mockConsole.error).toHaveBeenCalledWith('Batch load error:', expect.any(Error))
    })

    it('should cache newly loaded records', async () => {
      const mockData = [
        {
          id: 'id1',
          user_id: 'test-user-id',
          coffee_name: 'Coffee 1',
          created_at: '2025-01-31T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      await QueryOptimizer.getRecordsByIds(['id1'])

      expect(CacheService.set).toHaveBeenCalledWith(
        'record_id1',
        expect.objectContaining({ coffeeName: 'Coffee 1' }),
        10 * 60 * 1000 // 10 minutes
      )
    })
  })

  describe('invalidateRecordCache', () => {
    it('should invalidate specific record cache', () => {
      QueryOptimizer.invalidateRecordCache('record-123')

      expect(CacheService.invalidate).toHaveBeenCalledWith('record_record-123')
      expect(CacheService.invalidatePattern).toHaveBeenCalledWith('records_')
    })

    it('should invalidate all paginated queries when no recordId provided', () => {
      QueryOptimizer.invalidateRecordCache()

      expect(CacheService.invalidate).not.toHaveBeenCalled()
      expect(CacheService.invalidatePattern).toHaveBeenCalledWith('records_')
    })
  })

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const options1: QueryOptions = { page: 1, pageSize: 20, sortBy: 'created_at' }
      const options2: QueryOptions = { sortBy: 'created_at', page: 1, pageSize: 20 }

      // Access private method for testing
      const key1 = QueryOptimizer['generateCacheKey']('test', options1)
      const key2 = QueryOptimizer['generateCacheKey']('test', options2)

      expect(key1).toBe(key2) // Should be same despite different property order
      expect(key1).toMatch(/^test_/)
    })

    it('should handle empty options', () => {
      const key = QueryOptimizer['generateCacheKey']('test', {})
      expect(key).toBe('test_{}')
    })

    it('should include all option properties in key', () => {
      const options: QueryOptions = {
        page: 2,
        pageSize: 10,
        sortBy: 'rating',
        sortOrder: 'desc',
        filters: { mode: 'cafe', rating: 4 },
        select: 'id,coffee_name'
      }

      const key = QueryOptimizer['generateCacheKey']('records', options)
      
      expect(key).toContain('records_')
      expect(key).toContain('"page":2')
      expect(key).toContain('"pageSize":10')
      expect(key).toContain('"sortBy":"rating"')
      expect(key).toContain('"filters":{"mode":"cafe","rating":4}')
    })
  })

  describe('transformRecord', () => {
    it('should transform Supabase record to CoffeeRecord format', () => {
      const supabaseRecord = {
        id: 'test-id',
        user_id: 'user-123',
        coffee_name: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        origin: 'Ethiopia',
        roasting_level: 'Light',
        taste_notes: 'Floral and bright',
        roaster_notes: 'Jasmine, lemon, tea-like',
        personal_notes: 'Perfect for morning',
        mode: 'cafe',
        rating: 4,
        match_score: 88,
        image_url: 'https://example.com/image.jpg',
        additional_images: ['https://example.com/image2.jpg'],
        created_at: '2025-01-31T10:00:00Z',
        updated_at: '2025-01-31T11:00:00Z',
      }

      // Access private method for testing
      const transformed = QueryOptimizer['transformRecord'](supabaseRecord)

      expect(transformed).toMatchObject({
        id: 'test-id',
        userId: 'user-123',
        coffeeName: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        origin: 'Ethiopia',
        roastLevel: 'Light',
        temperature: 'Hot',
        date: '2025-01-31',
        taste: 'Floral and bright',
        roasterNote: 'Jasmine, lemon, tea-like',
        tasteMode: 'simple',
        mode: 'cafe',
        memo: 'Perfect for morning',
        rating: 4,
        createdAt: '2025-01-31T10:00:00Z',
        updatedAt: '2025-01-31T11:00:00Z',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        images: ['https://example.com/image.jpg', 'https://example.com/image2.jpg'],
        matchScore: {
          overall: 88,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: [],
        },
      })
    })

    it('should handle minimal record data', () => {
      const minimalRecord = {
        id: 'minimal-id',
        user_id: 'user-123',
        coffee_name: 'Simple Coffee',
        taste_notes: 'Good',
        rating: 3,
        mode: 'homecafe',
        created_at: '2025-01-31T10:00:00Z',
      }

      const transformed = QueryOptimizer['transformRecord'](minimalRecord)

      expect(transformed).toMatchObject({
        id: 'minimal-id',
        userId: 'user-123',
        coffeeName: 'Simple Coffee',
        roastery: '',
        origin: undefined,
        roastLevel: undefined,
        taste: 'Good',
        roasterNote: undefined,
        mode: 'homecafe',
        memo: undefined,
        rating: 3,
        date: '2025-01-31',
        images: undefined,
        matchScore: undefined,
      })
    })

    it('should handle null and undefined values', () => {
      const recordWithNulls = {
        id: 'null-test',
        user_id: 'user-123',
        coffee_name: 'Test Coffee',
        roastery: null,
        origin: null,
        roasting_level: undefined,
        taste_notes: 'Notes',
        roaster_notes: null,
        personal_notes: undefined,
        rating: 3,
        mode: 'cafe',
        match_score: null,
        image_url: null,
        additional_images: null,
        created_at: '2025-01-31T10:00:00Z',
      }

      const transformed = QueryOptimizer['transformRecord'](recordWithNulls)

      expect(transformed.roastery).toBe('')
      expect(transformed.origin).toBeUndefined()
      expect(transformed.roastLevel).toBeUndefined()
      expect(transformed.roasterNote).toBeUndefined()
      expect(transformed.memo).toBeUndefined()
      expect(transformed.matchScore).toBeUndefined()
      expect(transformed.images).toBeUndefined()
    })

    it('should properly extract date from ISO string', () => {
      const record = {
        id: 'date-test',
        user_id: 'user-123',
        coffee_name: 'Date Test',
        taste_notes: 'Test',
        rating: 3,
        mode: 'cafe',
        created_at: '2025-12-25T15:30:45.123Z',
      }

      const transformed = QueryOptimizer['transformRecord'](record)
      expect(transformed.date).toBe('2025-12-25')
    })

    it('should handle malformed created_at dates', () => {
      const record = {
        id: 'bad-date-test',
        user_id: 'user-123',
        coffee_name: 'Bad Date Test',
        taste_notes: 'Test',
        rating: 3,
        mode: 'cafe',
        created_at: null,
      }

      const transformed = QueryOptimizer['transformRecord'](record)
      
      // Should use current date as fallback
      const today = new Date().toISOString().split('T')[0]
      expect(transformed.date).toBe(today)
    })
  })

  describe('caching behavior', () => {
    it('should return cached paginated results when available', async () => {
      const cachedResult: PaginatedResult<CoffeeRecord> = {
        data: [{ id: 'cached', coffeeName: 'Cached Coffee' } as CoffeeRecord],
        total: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      }

      vi.mocked(CacheService.get).mockReturnValue(cachedResult)

      const result = await QueryOptimizer.getPaginatedRecords()

      expect(result).toEqual(cachedResult)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should cache paginated results after database query', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'test-user-id',
          coffee_name: 'Test Coffee',
          taste_notes: 'Fruity',
          rating: 4,
          created_at: '2025-01-31T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      })

      vi.mocked(CacheService.get).mockReturnValue(null) // No cache

      await QueryOptimizer.getPaginatedRecords({ page: 1, pageSize: 20 })

      expect(CacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('records_'),
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ coffeeName: 'Test Coffee' })
          ]),
          total: 1,
          page: 1,
          pageSize: 20,
          hasMore: false,
        }),
        3 * 60 * 1000 // 3 minutes TTL
      )
    })

    it('should return cached single record when available', async () => {
      const cachedRecord = {
        id: 'cached-id',
        coffeeName: 'Cached Coffee',
      } as CoffeeRecord

      vi.mocked(CacheService.get).mockReturnValue(cachedRecord)

      const result = await QueryOptimizer.getRecordById('cached-id')

      expect(result).toEqual(cachedRecord)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should cache single records with longer TTL', async () => {
      const mockData = {
        id: 'test-id',
        user_id: 'test-user-id',
        coffee_name: 'Test Coffee',
        taste_notes: 'Fruity',
        rating: 4,
        created_at: '2025-01-31T10:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      vi.mocked(CacheService.get).mockReturnValue(null) // No cache

      await QueryOptimizer.getRecordById('test-id')

      expect(CacheService.set).toHaveBeenCalledWith(
        'record_test-id',
        expect.objectContaining({ coffeeName: 'Test Coffee' }),
        10 * 60 * 1000 // 10 minutes TTL
      )
    })
  })

  describe('performance optimization', () => {
    it('should handle large result sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 100 }, (_, i) => ({
        id: `record-${i}`,
        user_id: 'test-user-id',
        coffee_name: `Coffee ${i}`,
        taste_notes: `Taste notes ${i}`,
        rating: (i % 5) + 1,
        created_at: `2025-01-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`,
      }))

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: largeDataSet,
        error: null,
        count: 100,
      })

      const options = { pageSize: 100 }
      const result = await QueryOptimizer.getPaginatedRecords(options)

      expect(result.data).toHaveLength(100)
      expect(result.total).toBe(100)
      expect(result.hasMore).toBe(false)
    })

    it('should handle pagination edge cases', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      // Test page 0 (should default to 1)
      const result1 = await QueryOptimizer.getPaginatedRecords({ page: 0 })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19) // page 1 behavior

      // Test negative page (should default to 1)
      vi.clearAllMocks()
      const result2 = await QueryOptimizer.getPaginatedRecords({ page: -1 })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19) // page 1 behavior
    })

    it('should calculate hasMore correctly', async () => {
      const mockQuery = mockSupabase.from()

      // Test case where hasMore should be true
      mockQuery.single.mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i })),
        error: null,
        count: 50, // Total 50 records
      })

      const result1 = await QueryOptimizer.getPaginatedRecords({ page: 1, pageSize: 20 })
      expect(result1.hasMore).toBe(true) // 50 > 1 * 20

      // Test case where hasMore should be false
      mockQuery.single.mockResolvedValueOnce({
        data: Array.from({ length: 10 }, (_, i) => ({ id: i })),
        error: null,
        count: 50, // Total 50 records
      })

      const result2 = await QueryOptimizer.getPaginatedRecords({ page: 3, pageSize: 20 })
      expect(result2.hasMore).toBe(false) // 50 <= 3 * 20
    })
  })

  describe('error handling and edge cases', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle missing environment variables gracefully', async () => {
      // This tests the robustness of the createClient call
      const result = await QueryOptimizer.getPaginatedRecords()
      
      // Should not throw, even with missing env vars (handled by Supabase client)
      expect(result).toBeDefined()
    })

    it('should handle network timeouts', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockRejectedValue(new Error('Network timeout'))

      await expect(QueryOptimizer.getPaginatedRecords()).rejects.toThrow('Network timeout')
      expect(mockConsole.error).toHaveBeenCalledWith('Query error:', expect.any(Error))
    })

    it('should handle malformed filter objects', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const malformedFilters = {
        filters: {
          mode: null,
          rating: undefined,
          hasImages: 'not-boolean',
          dateFrom: 'invalid-date',
        },
      }

      // Should not throw despite malformed filters
      const result = await QueryOptimizer.getPaginatedRecords(malformedFilters)
      expect(result).toBeDefined()
    })

    it('should handle empty arrays in batch operations', async () => {
      const result = await QueryOptimizer.getRecordsByIds([])
      expect(result.size).toBe(0)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle duplicate IDs in batch operations', async () => {
      const mockData = [
        {
          id: 'duplicate-id',
          user_id: 'test-user-id',
          coffee_name: 'Duplicate Coffee',
          created_at: '2025-01-31T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await QueryOptimizer.getRecordsByIds(['duplicate-id', 'duplicate-id'])

      expect(result.size).toBe(1) // Should deduplicate
      expect(result.get('duplicate-id')).toMatchObject({ coffeeName: 'Duplicate Coffee' })
    })
  })
})