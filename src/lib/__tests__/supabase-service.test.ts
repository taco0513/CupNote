import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  CoffeeRecordService,
  AchievementService,
  UserProfileService,
  AuthService,
} from '../supabase-service'
import * as errorHandler from '../error-handler'
import type { CoffeeRecord } from '../../types/coffee'

// Mock the supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn(),
    not: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn(),
}

// Mock the error handler
vi.mock('../error-handler', () => ({
  mapSupabaseError: vi.fn(),
  logError: vi.fn(),
  createError: vi.fn(),
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  },
}))

// Mock the supabase client import
vi.mock('../supabase', () => ({
  supabase: mockSupabase,
}))

// Mock console
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
}

beforeEach(() => {
  vi.stubGlobal('console', mockConsole)
})

describe('CoffeeRecordService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock for authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createRecord', () => {
    it('should create a coffee record successfully', async () => {
      const mockRecord: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'> = {
        userId: 'test-user-id',
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
        memo: 'Perfect morning coffee',
        rating: 4,
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      // Mock match score calculation
      mockSupabase.rpc.mockResolvedValue({ data: 85, error: null })

      // Mock database insert
      const mockInsertedRecord = {
        id: 'new-record-id',
        user_id: 'test-user-id',
        coffee_name: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        match_score: 85,
        created_at: '2025-01-31T10:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockInsertedRecord,
        error: null,
      })

      const result = await CoffeeRecordService.createRecord(mockRecord)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_match_score', {
        p_rating: 4,
        p_mode: 'cafe',
        p_taste_notes: 'Floral and bright',
        p_roaster_notes: 'Jasmine, lemon, tea-like',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        coffee_name: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        origin: 'Ethiopia',
        roasting_level: 'Light',
        brewing_method: undefined,
        rating: 4,
        taste_notes: 'Floral and bright',
        roaster_notes: 'Jasmine, lemon, tea-like',
        personal_notes: 'Perfect morning coffee',
        mode: 'cafe',
        match_score: 85,
        user_id: 'test-user-id',
      })

      expect(result.data).toEqual(mockInsertedRecord)
      expect(result.matchScore).toBe(85)
    })

    it('should handle match score calculation failure', async () => {
      const mockRecord: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'> = {
        userId: 'test-user-id',
        coffeeName: 'Test Coffee',
        taste: 'Good',
        rating: 3,
        mode: 'cafe',
        roastery: '',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      // Mock match score calculation failure
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: new Error('RPC failed') 
      })

      const mockInsertedRecord = {
        id: 'new-record-id',
        match_score: 75, // Default value
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockInsertedRecord,
        error: null,
      })

      const result = await CoffeeRecordService.createRecord(mockRecord)

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Match score calculation error:',
        expect.any(Error)
      )
      expect(result.matchScore).toBe(75) // Should use default
    })

    it('should handle database insertion errors', async () => {
      const mockRecord: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'> = {
        userId: 'test-user-id',
        coffeeName: 'Test Coffee',
        taste: 'Good',
        rating: 3,
        mode: 'cafe',
        roastery: '',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      mockSupabase.rpc.mockResolvedValue({ data: 80, error: null })

      const mockQuery = mockSupabase.from()
      const dbError = new Error('Database constraint violation')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: dbError,
      })

      // Mock error mapping
      const mappedError = new Error('Mapped database error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(CoffeeRecordService.createRecord(mockRecord)).rejects.toThrow(mappedError)

      expect(errorHandler.mapSupabaseError).toHaveBeenCalledWith(dbError)
      expect(errorHandler.logError).toHaveBeenCalledWith(
        mappedError,
        'CoffeeRecordService.createRecord'
      )
    })

    it('should handle default values correctly', async () => {
      const minimalRecord: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'> = {
        userId: 'test-user-id',
        coffeeName: 'Minimal Coffee',
        roastery: '',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      mockSupabase.rpc.mockResolvedValue({ data: 75, error: null })

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: { id: 'test-id' },
        error: null,
      })

      await CoffeeRecordService.createRecord(minimalRecord)

      expect(mockQuery.insert).toHaveBeenCalledWith({
        coffee_name: 'Minimal Coffee',
        roastery: '',
        origin: undefined,
        roasting_level: undefined,
        brewing_method: undefined,
        rating: 3, // Default rating
        taste_notes: '', // Default empty string
        roaster_notes: undefined,
        personal_notes: undefined,
        mode: 'cafe', // Default mode
        match_score: 75,
        user_id: 'test-user-id',
      })
    })

    it('should call updateAchievements after successful creation', async () => {
      const mockRecord: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'> = {
        userId: 'test-user-id',
        coffeeName: 'Test Coffee',
        taste: 'Good',
        rating: 3,
        mode: 'cafe',
        roastery: '',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      mockSupabase.rpc.mockResolvedValue({ data: 80, error: null })

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: { id: 'test-id' },
        error: null,
      })

      // Mock the select call for achievements
      mockQuery.single.mockResolvedValueOnce({
        data: [{ id: 'record1' }, { id: 'record2' }],
        error: null,
      })

      await CoffeeRecordService.createRecord(mockRecord)

      // Should call achievements-related queries
      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
    })
  })

  describe('getRecords', () => {
    it('should retrieve records with default pagination', async () => {
      const mockRecords = [
        {
          id: '1',
          coffee_name: 'Coffee 1',
          created_at: '2025-01-31T10:00:00Z',
        },
        {
          id: '2',
          coffee_name: 'Coffee 2',
          created_at: '2025-01-30T10:00:00Z',
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockRecords,
        error: null,
      })

      const result = await CoffeeRecordService.getRecords()

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 49) // Default limit 50
      expect(result).toEqual(mockRecords)
    })

    it('should apply custom limit and offset', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: [],
        error: null,
      })

      await CoffeeRecordService.getRecords(10, 20)

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29) // offset 20, limit 10
    })

    it('should handle database errors', async () => {
      const mockQuery = mockSupabase.from()
      const dbError = new Error('Database connection failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: dbError,
      })

      const mappedError = new Error('Mapped error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(CoffeeRecordService.getRecords()).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(
        mappedError,
        'CoffeeRecordService.getRecords'
      )
    })
  })

  describe('getRecord', () => {
    it('should retrieve a single record by ID', async () => {
      const mockRecord = {
        id: 'test-id',
        coffee_name: 'Test Coffee',
        rating: 4,
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockRecord,
        error: null,
      })

      const result = await CoffeeRecordService.getRecord('test-id')

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
      expect(result).toEqual(mockRecord)
    })

    it('should handle record not found', async () => {
      const mockQuery = mockSupabase.from()
      const notFoundError = new Error('Record not found')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: notFoundError,
      })

      const mappedError = new Error('Mapped not found error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(CoffeeRecordService.getRecord('non-existent-id')).rejects.toThrow(mappedError)
    })
  })

  describe('updateRecord', () => {
    it('should update a record successfully', async () => {
      const updates: Partial<CoffeeRecord> = {
        coffeeName: 'Updated Coffee Name',
        rating: 5,
        taste: 'Amazing taste',
      }

      const mockUpdatedRecord = {
        id: 'test-id',
        coffee_name: 'Updated Coffee Name',
        rating: 5,
        taste_notes: 'Amazing taste',
        updated_at: '2025-01-31T11:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockUpdatedRecord,
        error: null,
      })

      const result = await CoffeeRecordService.updateRecord('test-id', updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.update).toHaveBeenCalledWith({
        coffee_name: 'Updated Coffee Name',
        roastery: undefined,
        origin: undefined,
        roasting_level: undefined,
        brewing_method: undefined,
        rating: 5,
        taste_notes: 'Amazing taste',
        roaster_notes: undefined,
        personal_notes: undefined,
        updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
      expect(result).toEqual(mockUpdatedRecord)
    })

    it('should handle update errors', async () => {
      const mockQuery = mockSupabase.from()
      const updateError = new Error('Update failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: updateError,
      })

      const mappedError = new Error('Mapped update error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(
        CoffeeRecordService.updateRecord('test-id', { rating: 5 })
      ).rejects.toThrow(mappedError)
    })
  })

  describe('deleteRecord', () => {
    it('should delete a record successfully', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.delete.mockResolvedValue({
        error: null,
      })

      await CoffeeRecordService.deleteRecord('test-id')

      expect(mockSupabase.from).toHaveBeenCalledWith('coffee_records')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'test-id')
    })

    it('should handle delete errors', async () => {
      const mockQuery = mockSupabase.from()
      const deleteError = new Error('Delete failed')
      mockQuery.delete.mockResolvedValue({
        error: deleteError,
      })

      const mappedError = new Error('Mapped delete error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(CoffeeRecordService.deleteRecord('test-id')).rejects.toThrow(mappedError)
    })
  })

  describe('getStats', () => {
    it('should calculate user statistics correctly', async () => {
      // Mock count query
      const mockCountQuery = mockSupabase.from()
      mockCountQuery.select.mockReturnValue({
        count: 10,
      })

      // Mock average rating query
      const mockRatingData = [
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
      ]
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: mockRatingData,
          error: null,
        }),
      })

      // Mock highest score query
      const mockHighestScore = { match_score: 95 }
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockHighestScore,
          error: null,
        }),
      })

      // Mock origins query
      const mockOrigins = [
        { origin: 'Ethiopia' },
        { origin: 'Colombia' },
        { origin: 'Ethiopia' },
        { origin: 'Brazil' },
        { origin: 'Ethiopia' },
      ]
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockResolvedValue({
          data: mockOrigins,
          error: null,
        }),
      })

      const result = await CoffeeRecordService.getStats()

      expect(result).toEqual({
        totalRecords: 10,
        averageRating: 4.0,
        highestMatchScore: 95,
        favoriteOrigin: 'Ethiopia',
        streaks: {
          current: 0,
          longest: 0,
        },
      })
    })

    it('should handle missing data gracefully', async () => {
      // Mock empty responses
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({ count: 0 }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          not: vi.fn().mockResolvedValue({ data: null, error: null }),
        })

      const result = await CoffeeRecordService.getStats()

      expect(result).toEqual({
        totalRecords: 0,
        averageRating: 0,
        highestMatchScore: 0,
        favoriteOrigin: '없음',
        streaks: {
          current: 0,
          longest: 0,
        },
      })
    })

    it('should handle unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const mappedError = new Error('Not authenticated')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(CoffeeRecordService.getStats()).rejects.toThrow(mappedError)
    })
  })

  describe('updateAchievements', () => {
    it('should update achievements based on user statistics', async () => {
      // Mock user records query
      const mockRecords = [
        { id: '1', origin: 'Ethiopia', rating: 5 },
        { id: '2', origin: 'Colombia', rating: 4 },
        { id: '3', origin: 'Brazil', rating: 5 },
        { id: '4', origin: 'Ethiopia', rating: 4 },
        { id: '5', origin: 'Kenya', rating: 3 },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({
        data: mockRecords,
        error: null,
      })

      // Mock upsert achievement calls
      const mockUpsertQuery = mockSupabase.from()
      mockUpsertQuery.upsert.mockResolvedValue({
        error: null,
      })

      // Call the private method directly for testing
      await (CoffeeRecordService as any).updateAchievements()

      // Should calculate achievements based on mock data
      const expectedAchievements = [
        { id: 'first_record', current: 1, target: 1 }, // min(5, 1) = 1
        { id: 'coffee_lover', current: 5, target: 10 }, // min(5, 10) = 5
        { id: 'world_explorer', current: 3, target: 10 }, // unique origins: Ethiopia, Colombia, Brazil, Kenya (but filter removes null)
        { id: 'perfect_cup', current: 1, target: 1 }, // min(2, 1) = 1 (two 5-star ratings)
        { id: 'consistent_quality', current: 4, target: 10 }, // ratings >= 4
        { id: 'coffee_master', current: 5, target: 100 }, // min(5, 100) = 5
      ]

      expectedAchievements.forEach(achievement => {
        expect(mockUpsertQuery.upsert).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          achievement_id: achievement.id,
          progress_current: achievement.current,
          progress_target: achievement.target,
          unlocked_at: achievement.current >= achievement.target ? expect.any(String) : null,
        })
      })
    })

    it('should handle achievement update errors gracefully', async () => {
      // Mock user records query
      const mockQuery = mockSupabase.from()
      mockQuery.select.mockResolvedValue({
        data: [],
        error: null,
      })

      // Mock upsert error
      const mockUpsertQuery = mockSupabase.from()
      const upsertError = new Error('Upsert failed')
      mockUpsertQuery.upsert.mockResolvedValue({
        error: upsertError,
      })

      const mappedError = new Error('Mapped upsert error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      // Should not throw error (achievements are not critical)
      await expect((CoffeeRecordService as any).updateAchievements()).resolves.not.toThrow()

      expect(errorHandler.logError).toHaveBeenCalledWith(
        mappedError,
        'CoffeeRecordService.updateAchievements'
      )
    })

    it('should handle unauthenticated user in achievements', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Should return early without throwing
      await expect((CoffeeRecordService as any).updateAchievements()).resolves.not.toThrow()
    })
  })
})

describe('AchievementService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
  })

  describe('getUserAchievements', () => {
    it('should retrieve user achievements with definitions', async () => {
      const mockAchievements = [
        {
          id: 'user-achievement-1',
          user_id: 'test-user-id',
          achievement_id: 'first_record',
          progress_current: 1,
          progress_target: 1,
          unlocked_at: '2025-01-31T10:00:00Z',
          achievement_definitions: {
            id: 'first_record',
            title: 'First Cup',
            description: 'Record your first coffee',
            icon: '☕',
            category: 'getting_started',
            points: 10,
          },
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockAchievements,
        error: null,
      })

      const result = await AchievementService.getUserAchievements()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_achievements')
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('achievement_definitions')
      )
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(result).toEqual(mockAchievements)
    })

    it('should handle unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const mappedError = new Error('Not authenticated')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(AchievementService.getUserAchievements()).rejects.toThrow(mappedError)
    })

    it('should handle database errors', async () => {
      const mockQuery = mockSupabase.from()
      const dbError = new Error('Database query failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: dbError,
      })

      const mappedError = new Error('Mapped database error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(AchievementService.getUserAchievements()).rejects.toThrow(mappedError)
    })
  })

  describe('getAllAchievements', () => {
    it('should retrieve all active achievement definitions', async () => {
      const mockDefinitions = [
        {
          id: 'first_record',
          title: 'First Cup',
          description: 'Record your first coffee',
          icon: '☕',
          category: 'getting_started',
          points: 10,
          is_active: true,
        },
        {
          id: 'coffee_lover',
          title: 'Coffee Lover',
          description: 'Record 10 coffees',
          icon: '❤️',
          category: 'progress',
          points: 50,
          is_active: true,
        },
      ]

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockDefinitions,
        error: null,
      })

      const result = await AchievementService.getAllAchievements()

      expect(mockSupabase.from).toHaveBeenCalledWith('achievement_definitions')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockQuery.order).toHaveBeenCalledWith('points', { ascending: true })
      expect(result).toEqual(mockDefinitions)
    })

    it('should handle query errors', async () => {
      const mockQuery = mockSupabase.from()
      const dbError = new Error('Query failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: dbError,
      })

      const mappedError = new Error('Mapped query error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(AchievementService.getAllAchievements()).rejects.toThrow(mappedError)
    })
  })
})

describe('UserProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })
  })

  describe('getProfile', () => {
    it('should retrieve user profile', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2025-01-31T10:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      const result = await UserProfileService.getProfile()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(result).toEqual(mockProfile)
    })

    it('should handle unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const mappedError = new Error('Not authenticated')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(UserProfileService.getProfile()).rejects.toThrow(mappedError)
    })
  })

  describe('createProfile', () => {
    it('should create user profile', async () => {
      const profileData = {
        username: 'newuser',
        email: 'new@example.com',
        avatar_url: 'https://example.com/new-avatar.jpg',
      }

      const mockCreatedProfile = {
        user_id: 'test-user-id',
        ...profileData,
        created_at: '2025-01-31T10:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockCreatedProfile,
        error: null,
      })

      const result = await UserProfileService.createProfile(profileData)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        username: 'newuser',
        email: 'new@example.com',
        avatar_url: 'https://example.com/new-avatar.jpg',
      })
      expect(result).toEqual(mockCreatedProfile)
    })

    it('should handle profile creation errors', async () => {
      const mockQuery = mockSupabase.from()
      const createError = new Error('Profile creation failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: createError,
      })

      const mappedError = new Error('Mapped creation error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(
        UserProfileService.createProfile({
          username: 'test',
          email: 'test@example.com',
        })
      ).rejects.toThrow(mappedError)
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        username: 'updateduser',
        avatar_url: 'https://example.com/updated-avatar.jpg',
      }

      const mockUpdatedProfile = {
        user_id: 'test-user-id',
        username: 'updateduser',
        email: 'test@example.com',
        avatar_url: 'https://example.com/updated-avatar.jpg',
        updated_at: '2025-01-31T11:00:00Z',
      }

      const mockQuery = mockSupabase.from()
      mockQuery.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      })

      const result = await UserProfileService.updateProfile(updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(result).toEqual(mockUpdatedProfile)
    })

    it('should handle profile update errors', async () => {
      const mockQuery = mockSupabase.from()
      const updateError = new Error('Profile update failed')
      mockQuery.single.mockResolvedValue({
        data: null,
        error: updateError,
      })

      const mappedError = new Error('Mapped update error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(
        UserProfileService.updateProfile({ username: 'test' })
      ).rejects.toThrow(mappedError)
    })
  })
})

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockSignUpData = {
        user: {
          id: 'new-user-id',
          email: 'new@example.com',
        },
        session: null,
      }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: mockSignUpData,
        error: null,
      })

      const result = await AuthService.signUp('test@example.com', 'password123', 'testuser')

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'testuser',
          },
          emailRedirectTo: undefined,
        },
      })

      expect(mockConsole.log).toHaveBeenCalledWith('Signup successful:', mockSignUpData)
      expect(result).toEqual(mockSignUpData)
    })

    it('should handle signup errors', async () => {
      const signUpError = new Error('Email already exists')
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: signUpError,
      })

      const mappedError = new Error('Mapped signup error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(
        AuthService.signUp('existing@example.com', 'password123', 'testuser')
      ).rejects.toThrow(mappedError)

      expect(mockConsole.error).toHaveBeenCalledWith('Supabase signup error:', signUpError)
      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'AuthService.signUp')
    })
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockSignInData = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockSignInData,
        error: null,
      })

      const result = await AuthService.signIn('test@example.com', 'password123')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockSignInData)
    })

    it('should handle signin errors', async () => {
      const signInError = new Error('Invalid credentials')
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: signInError,
      })

      const mappedError = new Error('Mapped signin error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(
        AuthService.signIn('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'AuthService.signIn')
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      await AuthService.signOut()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle signout errors', async () => {
      const signOutError = new Error('Sign out failed')
      mockSupabase.auth.signOut.mockResolvedValue({
        error: signOutError,
      })

      const mappedError = new Error('Mapped signout error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      await expect(AuthService.signOut()).rejects.toThrow(mappedError)

      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'AuthService.signOut')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        user_metadata: { username: 'testuser' },
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await AuthService.getCurrentUser()

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should return null for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await AuthService.getCurrentUser()

      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const getUserError = new Error('Get user failed')
      mockSupabase.auth.getUser.mockRejectedValue(getUserError)

      const mappedError = new Error('Mapped get user error')
      vi.mocked(errorHandler.mapSupabaseError).mockReturnValue(mappedError as any)

      const result = await AuthService.getCurrentUser()

      expect(result).toBeNull()
      expect(errorHandler.logError).toHaveBeenCalledWith(mappedError, 'AuthService.getCurrentUser')
    })
  })

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockUnsubscribe },
      })

      const result = AuthService.onAuthStateChange(mockCallback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
      expect(result).toEqual({ data: { subscription: mockUnsubscribe } })

      // Test the callback wrapper
      const authCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0]
      const mockSession = {
        user: { id: 'user-id', email: 'test@example.com' },
        access_token: 'token',
      }

      authCallback('SIGNED_IN', mockSession)
      expect(mockCallback).toHaveBeenCalledWith(mockSession.user)

      authCallback('SIGNED_OUT', null)
      expect(mockCallback).toHaveBeenCalledWith(null)
    })
  })
})