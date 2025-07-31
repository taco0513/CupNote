import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { AchievementSystem } from '../achievements'
import { generateSampleFlavorProfile, generateSampleSensoryExpressions } from '../flavorData'
import { LocalStorage } from '../storage'

import type { UserStats } from '../../types/achievement'
import type { CoffeeRecord } from '../../types/coffee'

// Mock dependencies
vi.mock('../achievements', () => ({
  AchievementSystem: {
    calculateUserStats: vi.fn(),
  },
}))

vi.mock('../flavorData', () => ({
  generateSampleFlavorProfile: vi.fn(),
  generateSampleSensoryExpressions: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as unknown as Storage

// Mock console
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock Date.now for consistent timestamps
const mockDateNow = vi.fn()

beforeEach(() => {
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('console', mockConsole)
  vi.stubGlobal('window', { localStorage: localStorageMock })
  
  // Mock Date.now and Date constructor
  mockDateNow.mockReturnValue(1643723400000) // 2022-02-01T10:30:00.000Z
  vi.spyOn(Date, 'now').mockImplementation(mockDateNow)
  
  // Mock Date constructor for new Date()
  const originalDate = Date
  vi.stubGlobal('Date', class extends originalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(1643723400000) // Use mocked timestamp
      } else {
        super(...args)
      }
    }
    
    static now() {
      return mockDateNow()
    }
  })
})

describe('LocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRecords', () => {
    it('should return empty array when no records exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = LocalStorage.getRecords()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cupnote-records')
      expect(result).toEqual([])
    })

    it('should return parsed records sorted by creation date', () => {
      const mockRecords = [
        {
          id: '1',
          coffeeName: 'Coffee 1',
          createdAt: '2025-01-30T10:00:00Z',
        },
        {
          id: '2',
          coffeeName: 'Coffee 2',
          createdAt: '2025-01-31T10:00:00Z',
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const result = LocalStorage.getRecords()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('2') // More recent first
      expect(result[1].id).toBe('1')
    })

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = LocalStorage.getRecords()

      expect(result).toEqual([])
      expect(mockConsole.error).toHaveBeenCalledWith(
        '로컬 스토리지 읽기 오류:',
        expect.any(Error)
      )
    })

    it('should return empty array when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      const result = LocalStorage.getRecords()

      expect(result).toEqual([])
    })

    it('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available')
      })

      const result = LocalStorage.getRecords()

      expect(result).toEqual([])
      expect(mockConsole.error).toHaveBeenCalledWith(
        '로컬 스토리지 읽기 오류:',
        expect.any(Error)
      )
    })
  })

  describe('addRecord', () => {
    it('should add new record with generated ID and timestamp', () => {
      localStorageMock.getItem.mockReturnValue('[]') // Empty records
      localStorageMock.setItem.mockImplementation(() => {})

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        taste: 'Floral and bright',
        rating: 4,
        mode: 'cafe',
        roastLevel: 'Light',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecord(newRecordData)

      expect(result).toMatchObject({
        id: '1643723400000', // Generated from Date.now()
        userId: 'user1', // Default user
        coffeeName: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle',
        taste: 'Floral and bright',
        rating: 4,
        mode: 'cafe',
      })
      expect(result.createdAt).toBe('2022-02-01T13:50:00.000Z')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-records',
        expect.stringContaining('"id":"1643723400000"')
      )
    })

    it('should add record to existing records list', () => {
      const existingRecords = [
        {
          id: '1',
          coffeeName: 'Existing Coffee',
          createdAt: '2025-01-30T10:00:00Z',
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'New Coffee',
        roastery: 'Test Roastery',
        taste: 'Good',
        rating: 3,
        mode: 'homecafe',
        roastLevel: 'Medium',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecord(newRecordData)

      expect(result.coffeeName).toBe('New Coffee')

      // Verify the new record was added to the beginning
      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      expect(parsedData).toHaveLength(2)
      expect(parsedData[0].coffeeName).toBe('New Coffee') // New record first
      expect(parsedData[1].coffeeName).toBe('Existing Coffee')
    })

    it('should handle storage errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'Test Coffee',
        roastery: '',
        taste: 'Good',
        rating: 3,
        mode: 'cafe',
        roastLevel: 'Medium',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecord(newRecordData)

      expect(result).toBeDefined() // Should still return the record
      expect(mockConsole.error).toHaveBeenCalledWith(
        '로컬 스토리지 저장 오류:',
        expect.any(Error)
      )
    })
  })

  describe('updateRecord', () => {
    it('should update existing record', () => {
      const existingRecords = [
        {
          id: '1',
          coffeeName: 'Original Coffee',
          rating: 3,
          createdAt: '2025-01-30T10:00:00Z',
        },
        {
          id: '2',
          coffeeName: 'Another Coffee',
          rating: 4,
          createdAt: '2025-01-29T10:00:00Z',
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const updates: Partial<CoffeeRecord> = {
        coffeeName: 'Updated Coffee',
        rating: 5,
        taste: 'Amazing taste',
      }

      const result = LocalStorage.updateRecord('1', updates)

      expect(result).toMatchObject({
        id: '1',
        coffeeName: 'Updated Coffee',
        rating: 5,
        taste: 'Amazing taste',
      })

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      expect(parsedData[0].coffeeName).toBe('Updated Coffee')
      expect(parsedData[0].rating).toBe(5)
      expect(parsedData[1].coffeeName).toBe('Another Coffee') // Unchanged
    })

    it('should return null for non-existent record', () => {
      const existingRecords = [
        {
          id: '1',
          coffeeName: 'Existing Coffee',
          rating: 3,
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const result = LocalStorage.updateRecord('non-existent-id', { rating: 5 })

      expect(result).toBeNull()
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle empty records list', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const result = LocalStorage.updateRecord('any-id', { rating: 5 })

      expect(result).toBeNull()
    })
  })

  describe('deleteRecord', () => {
    it('should delete existing record', () => {
      const existingRecords = [
        { id: '1', coffeeName: 'Coffee 1' },
        { id: '2', coffeeName: 'Coffee 2' },
        { id: '3', coffeeName: 'Coffee 3' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const result = LocalStorage.deleteRecord('2')

      expect(result).toBe(true)

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      expect(parsedData).toHaveLength(2)
      expect(parsedData.find((r: any) => r.id === '2')).toBeUndefined()
      expect(parsedData.find((r: any) => r.id === '1')).toBeDefined()
      expect(parsedData.find((r: any) => r.id === '3')).toBeDefined()
    })

    it('should return false for non-existent record', () => {
      const existingRecords = [
        { id: '1', coffeeName: 'Coffee 1' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const result = LocalStorage.deleteRecord('non-existent')

      expect(result).toBe(false)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle empty records list', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const result = LocalStorage.deleteRecord('any-id')

      expect(result).toBe(false)
    })
  })

  describe('getRecordById', () => {
    it('should return record by ID', () => {
      const existingRecords = [
        { id: '1', coffeeName: 'Coffee 1' },
        { id: '2', coffeeName: 'Coffee 2' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const result = LocalStorage.getRecordById('2')

      expect(result).toEqual({ id: '2', coffeeName: 'Coffee 2' })
    })

    it('should return null for non-existent ID', () => {
      const existingRecords = [
        { id: '1', coffeeName: 'Coffee 1' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      const result = LocalStorage.getRecordById('non-existent')

      expect(result).toBeNull()
    })

    it('should return null for empty records', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const result = LocalStorage.getRecordById('any-id')

      expect(result).toBeNull()
    })
  })

  describe('initializeSampleData', () => {
    beforeEach(() => {
      // Mock the flavor data generators
      vi.mocked(generateSampleFlavorProfile).mockReturnValue([
        { id: 'berry', name: 'Berry', category: 'fruity' },
      ])
      vi.mocked(generateSampleSensoryExpressions).mockReturnValue([
        { category: 'acidity', expressions: ['bright', 'citrusy'] },
      ])
    })

    it('should not initialize if records already exist', () => {
      const existingRecords = [{ id: '1', coffeeName: 'Existing' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingRecords))

      LocalStorage.initializeSampleData()

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should initialize sample data when no records exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      LocalStorage.initializeSampleData()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-records',
        expect.stringContaining('에티오피아 예가체프')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-records',
        expect.stringContaining('콜롬비아 게이샤')
      )

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      expect(parsedData).toHaveLength(2)
      
      // Check first sample record
      const firstRecord = parsedData[0]
      expect(firstRecord.coffeeName).toBe('에티오피아 예가체프')
      expect(firstRecord.roastery).toBe('블루보틀 서울')
      expect(firstRecord.mode).toBe('cafe')
      expect(firstRecord.rating).toBe(4)

      // Check second sample record
      const secondRecord = parsedData[1]
      expect(secondRecord.coffeeName).toBe('콜롬비아 게이샤')
      expect(secondRecord.roastery).toBe('앤썸')
      expect(secondRecord.mode).toBe('homecafe')
      expect(secondRecord.rating).toBe(4)
      expect(secondRecord.homecafeData).toBeDefined()
      expect(secondRecord.homecafeData.dripper).toBe('V60')
    })

    it('should include generated flavor profiles and expressions', () => {
      localStorageMock.getItem.mockReturnValue(null)

      LocalStorage.initializeSampleData()

      expect(generateSampleFlavorProfile).toHaveBeenCalled()
      expect(generateSampleSensoryExpressions).toHaveBeenCalled()

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      
      // First record should have generated flavor profile
      expect(parsedData[0].selectedFlavors).toEqual([
        { id: 'berry', name: 'Berry', category: 'fruity' },
      ])
      expect(parsedData[0].sensoryExpressions).toEqual([
        { category: 'acidity', expressions: ['bright', 'citrusy'] },
      ])
    })
  })

  describe('exportData', () => {
    it('should export records as JSON string', () => {
      const mockRecords = [
        { id: '1', coffeeName: 'Coffee 1' },
        { id: '2', coffeeName: 'Coffee 2' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const result = LocalStorage.exportData()

      expect(result).toBe(JSON.stringify(mockRecords, null, 2))
    })

    it('should export empty array when no records', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = LocalStorage.exportData()

      expect(result).toBe(JSON.stringify([], null, 2))
    })
  })

  describe('importData', () => {
    it('should import valid JSON data', () => {
      const importData = [
        { id: '1', coffeeName: 'Imported Coffee 1' },
        { id: '2', coffeeName: 'Imported Coffee 2' },
      ]

      const result = LocalStorage.importData(JSON.stringify(importData))

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-records',
        JSON.stringify(importData)
      )
    })

    it('should reject invalid JSON', () => {
      const result = LocalStorage.importData('invalid json')

      expect(result).toBe(false)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalledWith(
        '데이터 가져오기 오류:',
        expect.any(Error)
      )
    })

    it('should reject non-array data', () => {
      const result = LocalStorage.importData('{"not": "an array"}')

      expect(result).toBe(false)
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle storage errors during import', () => {
      // Mock the private saveRecords method to throw error
      const spy = vi.spyOn(LocalStorage as any, 'saveRecords').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const importData = [{ id: '1', coffeeName: 'Test' }]
      const result = LocalStorage.importData(JSON.stringify(importData))

      expect(result).toBe(false)
      expect(mockConsole.error).toHaveBeenCalledWith(
        '데이터 가져오기 오류:',
        expect.any(Error)
      )

      spy.mockRestore()
    })
  })

  describe('getUserStats', () => {
    it('should calculate user stats from records', () => {
      const mockRecords = [
        { id: '1', coffeeName: 'Coffee 1', rating: 4 },
        { id: '2', coffeeName: 'Coffee 2', rating: 5 },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords))

      const mockStats: UserStats = {
        totalRecords: 2,
        averageRating: 4.5,
        achievements: [],
        progress: {
          totalPoints: 100,
          currentLevel: 2,
          nextLevelPoints: 200,
          progressToNext: 50,
        },
      }

      vi.mocked(AchievementSystem.calculateUserStats).mockReturnValue(mockStats)

      const result = LocalStorage.getUserStats()

      expect(AchievementSystem.calculateUserStats).toHaveBeenCalledWith(mockRecords)
      expect(result).toEqual(mockStats)
    })
  })

  describe('getCachedAchievements and setCachedAchievements', () => {
    it('should return cached achievements if within time limit', () => {
      const mockStats: UserStats = {
        totalRecords: 5,
        averageRating: 4.2,
        achievements: [],
        progress: {
          totalPoints: 150,
          currentLevel: 3,
          nextLevelPoints: 200,
          progressToNext: 75,
        },
      }

      // Mock current time to be 1643723400000 (same as mockDateNow)
      // Create a cache time that's 30 minutes ago (within 1 hour limit)
      const currentTime = 1643723400000
      const thirtyMinutesAgo = currentTime - (30 * 60 * 1000)
      const cacheData = {
        stats: mockStats,
        cacheTime: new Date(thirtyMinutesAgo).toISOString(),
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))

      const result = LocalStorage.getCachedAchievements()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cupnote-achievements')
      expect(result).toEqual(mockStats)
    })

    it('should return null for expired cache', () => {
      const mockStats: UserStats = {
        totalRecords: 5,
        averageRating: 4.2,
        achievements: [],
        progress: { totalPoints: 150, currentLevel: 3, nextLevelPoints: 200, progressToNext: 75 },
      }

      // Create a cache time that's 2 hours ago (beyond 1 hour limit)
      const twoHoursAgo = mockDateNow() - (2 * 60 * 60 * 1000)
      const cacheData = {
        stats: mockStats,
        cacheTime: new Date(twoHoursAgo).toISOString(),
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))

      const result = LocalStorage.getCachedAchievements()

      expect(result).toBeNull()
    })

    it('should return null for missing cache', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = LocalStorage.getCachedAchievements()

      expect(result).toBeNull()
    })

    it('should handle malformed cache data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = LocalStorage.getCachedAchievements()

      expect(result).toBeNull()
      expect(mockConsole.error).toHaveBeenCalledWith(
        '성취 캐시 읽기 오류:',
        expect.any(Error)
      )
    })

    it('should set cached achievements', () => {
      const mockStats: UserStats = {
        totalRecords: 10,
        averageRating: 4.0,
        achievements: [],
        progress: { totalPoints: 200, currentLevel: 4, nextLevelPoints: 300, progressToNext: 66 },
      }

      LocalStorage.setCachedAchievements(mockStats)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-achievements',
        expect.stringContaining('"stats"')
      )

      const savedData = localStorageMock.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      expect(parsedData.stats).toEqual(mockStats)
      expect(parsedData.cacheTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should handle cache write errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const mockStats: UserStats = {
        totalRecords: 1,
        averageRating: 3.0,
        achievements: [],
        progress: { totalPoints: 50, currentLevel: 1, nextLevelPoints: 100, progressToNext: 50 },
      }

      // Should not throw
      LocalStorage.setCachedAchievements(mockStats)

      expect(mockConsole.error).toHaveBeenCalledWith(
        '성취 캐시 저장 오류:',
        expect.any(Error)
      )
    })

    it('should return null when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      const result = LocalStorage.getCachedAchievements()

      expect(result).toBeNull()
    })

    it('should not set cache when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      const mockStats: UserStats = {
        totalRecords: 1,
        averageRating: 3.0,
        achievements: [],
        progress: { totalPoints: 50, currentLevel: 1, nextLevelPoints: 100, progressToNext: 50 },
      }

      // Should not throw
      LocalStorage.setCachedAchievements(mockStats)

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('addRecordWithAchievements', () => {
    it('should add record and detect new achievements', () => {
      // Mock existing stats (before adding record)
      const oldStats: UserStats = {
        totalRecords: 4,
        averageRating: 3.5,
        achievements: [
          { id: 'first_record', title: 'First Cup', unlocked: true, progress: { current: 1, target: 1 } },
        ],
        progress: { totalPoints: 100, currentLevel: 2, nextLevelPoints: 200, progressToNext: 50 },
      }

      // Mock new stats (after adding record)
      const newStats: UserStats = {
        totalRecords: 5,
        averageRating: 3.6,
        achievements: [
          { id: 'first_record', title: 'First Cup', unlocked: true, progress: { current: 1, target: 1 } },
          { id: 'coffee_lover', title: 'Coffee Lover', unlocked: true, progress: { current: 5, target: 5 } },
        ],
        progress: { totalPoints: 150, currentLevel: 3, nextLevelPoints: 200, progressToNext: 75 },
      }

      // Set up mocks
      localStorageMock.getItem.mockReturnValue(JSON.stringify([
        { id: '1', coffeeName: 'Existing Coffee 1' },
        { id: '2', coffeeName: 'Existing Coffee 2' },
        { id: '3', coffeeName: 'Existing Coffee 3' },
        { id: '4', coffeeName: 'Existing Coffee 4' },
      ]))

      vi.mocked(AchievementSystem.calculateUserStats)
        .mockReturnValueOnce(oldStats) // First call (before adding)
        .mockReturnValueOnce(newStats) // Second call (after adding)

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'New Achievement Coffee',
        roastery: 'Achievement Roastery',
        taste: 'Rewarding',
        rating: 5,
        mode: 'cafe',
        roastLevel: 'Medium',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecordWithAchievements(newRecordData)

      expect(result.record.coffeeName).toBe('New Achievement Coffee')
      expect(result.newAchievements).toEqual(['coffee_lover'])

      // Should have updated the cache
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cupnote-achievements',
        expect.stringContaining('"totalRecords":5')
      )
    })

    it('should return empty array when no new achievements', () => {
      const stats: UserStats = {
        totalRecords: 2,
        averageRating: 4.0,
        achievements: [
          { id: 'first_record', title: 'First Cup', unlocked: true, progress: { current: 1, target: 1 } },
        ],
        progress: { totalPoints: 75, currentLevel: 2, nextLevelPoints: 100, progressToNext: 75 },
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify([
        { id: '1', coffeeName: 'Existing Coffee' },
      ]))

      vi.mocked(AchievementSystem.calculateUserStats).mockReturnValue(stats)

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'Regular Coffee',
        roastery: 'Regular Roastery',
        taste: 'Normal',
        rating: 3,
        mode: 'cafe',
        roastLevel: 'Medium',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecordWithAchievements(newRecordData)

      expect(result.record.coffeeName).toBe('Regular Coffee')
      expect(result.newAchievements).toEqual([])
    })

    it('should handle multiple new achievements', () => {
      const oldStats: UserStats = {
        totalRecords: 0,
        averageRating: 0,
        achievements: [],
        progress: { totalPoints: 0, currentLevel: 1, nextLevelPoints: 100, progressToNext: 0 },
      }

      const newStats: UserStats = {
        totalRecords: 1,
        averageRating: 5.0,
        achievements: [
          { id: 'first_record', title: 'First Cup', unlocked: true, progress: { current: 1, target: 1 } },
          { id: 'perfect_cup', title: 'Perfect Cup', unlocked: true, progress: { current: 1, target: 1 } },
        ],
        progress: { totalPoints: 75, currentLevel: 2, nextLevelPoints: 100, progressToNext: 75 },
      }

      localStorageMock.getItem.mockReturnValue('[]') // No existing records

      vi.mocked(AchievementSystem.calculateUserStats)
        .mockReturnValueOnce(oldStats)
        .mockReturnValueOnce(newStats)

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'Perfect First Coffee',
        roastery: 'Perfect Roastery',
        taste: 'Perfect',
        rating: 5,
        mode: 'cafe',
        roastLevel: 'Perfect',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      const result = LocalStorage.addRecordWithAchievements(newRecordData)

      expect(result.newAchievements).toEqual(['first_record', 'perfect_cup'])
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle corrupted storage data', () => {
      localStorageMock.getItem.mockReturnValue('not valid json at all')

      const result = LocalStorage.getRecords()

      expect(result).toEqual([])
      expect(mockConsole.error).toHaveBeenCalled()
    })

    it('should handle null storage responses', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = LocalStorage.getRecords()

      expect(result).toEqual([])
    })

    it('should handle large record datasets', () => {
      const largeRecordSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        coffeeName: `Coffee ${i}`,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        rating: (i % 5) + 1,
      }))

      localStorageMock.getItem.mockReturnValue(JSON.stringify(largeRecordSet))

      const result = LocalStorage.getRecords()

      expect(result).toHaveLength(1000)
      // Should be sorted by creation date (newest first)
      expect(parseInt(result[0].id)).toBeLessThan(parseInt(result[1].id))
    })

    it('should handle records with missing fields', () => {
      const incompleteRecords = [
        { id: '1' }, // Missing most fields
        { id: '2', coffeeName: 'Coffee 2', createdAt: '2025-01-31T10:00:00Z' },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteRecords))

      const result = LocalStorage.getRecords()

      expect(result).toHaveLength(2)
      expect(result.find(r => r.id === '1')).toBeDefined()
      expect(result.find(r => r.id === '2')).toBeDefined()
    })

    it('should handle concurrent modifications', () => {
      const initialRecords = [{ id: '1', coffeeName: 'Coffee 1' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialRecords))

      // Simulate concurrent modification
      let callCount = 0
      localStorageMock.setItem.mockImplementation((key, value) => {
        callCount++
        if (callCount === 1) {
          // First call succeeds
          return
        } else {
          // Subsequent calls might have stale data, but should not fail
          const data = JSON.parse(value)
          expect(Array.isArray(data)).toBe(true)
        }
      })

      const newRecordData: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'> = {
        coffeeName: 'Concurrent Coffee',
        roastery: '',
        taste: 'Good',
        rating: 3,
        mode: 'cafe',
        roastLevel: 'Medium',
        temperature: 'Hot',
        date: '2025-01-31',
        tasteMode: 'simple',
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        updatedAt: '2025-01-31T10:00:00Z',
      }

      // Should handle concurrent access gracefully
      const result1 = LocalStorage.addRecord(newRecordData)
      const result2 = LocalStorage.addRecord(newRecordData)

      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })
  })
})