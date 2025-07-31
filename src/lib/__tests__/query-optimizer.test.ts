import { describe, it, expect, beforeEach, vi } from 'vitest'

import { QueryOptimizer } from '../query-optimizer'

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

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

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

    it('should return empty map for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await QueryOptimizer.getRecordsByIds(['id1', 'id2'])

      expect(result.size).toBe(0)
    })
  })
})