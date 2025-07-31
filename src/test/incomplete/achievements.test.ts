import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkAchievements,
  getNextMilestones,
  calculateLevel,
  formatAchievementDate,
  type Achievement,
} from '../achievements'
import type { CoffeeRecord } from '@/types/coffee'

describe('achievements', () => {
  const mockRecord: CoffeeRecord = {
    id: 'test-id',
    userId: 'test-user',
    coffeeName: 'Test Coffee',
    roastery: 'Test Roastery',
    origin: 'Ethiopia',
    roastLevel: 'Medium',
    brewMethod: 'V60',
    taste: 'Fruity',
    memo: 'Great coffee',
    rating: 4,
    mode: 'cafe',
    createdAt: '2025-01-31T10:00:00Z',
    updatedAt: '2025-01-31T10:00:00Z',
    images: [],
    matchScore: {
      overall: 85,
      flavorMatching: 80,
      expressionAccuracy: 90,
      consistency: 85,
      strengths: ['Good flavor description'],
      improvements: ['More detailed notes'],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkAchievements', () => {
    it('should detect first record achievement', () => {
      const records = [mockRecord]
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(records, existingAchievements)

      expect(newAchievements).toHaveLength(1)
      expect(newAchievements[0]).toMatchObject({
        id: 'first_record',
        title: '첫 번째 기록',
        description: '첫 번째 커피 기록을 작성했습니다!',
        icon: '☕',
        category: 'milestone',
        unlockedAt: expect.any(String),
      })
    })

    it('should detect record count milestones', () => {
      const records = Array.from({ length: 10 }, (_, i) => ({
        ...mockRecord,
        id: `test-id-${i}`,
      }))
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(records, existingAchievements)

      const milestoneAchievements = newAchievements.filter(a => 
        ['first_record', 'record_5', 'record_10'].includes(a.id)
      )
      expect(milestoneAchievements).toHaveLength(3)
    })

    it('should detect origin diversity achievement', () => {
      const records = [
        { ...mockRecord, origin: 'Ethiopia' },
        { ...mockRecord, id: 'test-2', origin: 'Colombia' },
        { ...mockRecord, id: 'test-3', origin: 'Brazil' },
        { ...mockRecord, id: 'test-4', origin: 'Guatemala' },
        { ...mockRecord, id: 'test-5', origin: 'Kenya' },
      ]
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(records, existingAchievements)

      const diversityAchievement = newAchievements.find(a => a.id === 'origin_explorer')
      expect(diversityAchievement).toBeDefined()
      expect(diversityAchievement?.title).toBe('원산지 탐험가')
    })

    it('should detect high rating achievement', () => {
      const highRatedRecord = { ...mockRecord, rating: 5 }
      const records = [highRatedRecord]
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(records, existingAchievements)

      const perfectRatingAchievement = newAchievements.find(a => a.id === 'perfect_rating')
      expect(perfectRatingAchievement).toBeDefined()
      expect(perfectRatingAchievement?.title).toBe('완벽한 평가')
    })

    it('should detect consistency achievement', () => {
      const consistentRecords = Array.from({ length: 7 }, (_, i) => ({
        ...mockRecord,
        id: `test-id-${i}`,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      }))
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(consistentRecords, existingAchievements)

      const consistencyAchievement = newAchievements.find(a => a.id === 'consistency_week')
      expect(consistencyAchievement).toBeDefined()
      expect(consistencyAchievement?.title).toBe('꾸준한 기록자')
    })

    it('should not return already unlocked achievements', () => {
      const records = [mockRecord]
      const existingAchievements: Achievement[] = [
        {
          id: 'first_record',
          title: '첫 번째 기록',
          description: '첫 번째 커피 기록을 작성했습니다!',
          icon: '☕',
          category: 'milestone',
          unlockedAt: '2025-01-30T10:00:00Z',
        },
      ]

      const newAchievements = checkAchievements(records, existingAchievements)

      expect(newAchievements).not.toContainEqual(
        expect.objectContaining({ id: 'first_record' })
      )
    })

    it('should handle image-related achievements', () => {
      const recordWithImages = {
        ...mockRecord,
        images: ['image1.jpg', 'image2.jpg'],
      }
      const records = [recordWithImages]
      const existingAchievements: Achievement[] = []

      const newAchievements = checkAchievements(records, existingAchievements)

      const photographerAchievement = newAchievements.find(a => a.id === 'photographer')
      expect(photographerAchievement).toBeDefined()
      expect(photographerAchievement?.title).toBe('사진작가')
    })
  })

  describe('getNextMilestones', () => {
    it('should return next record count milestone', () => {
      const records = Array.from({ length: 3 }, (_, i) => ({
        ...mockRecord,
        id: `test-id-${i}`,
      }))

      const milestones = getNextMilestones(records)

      expect(milestones).toContainEqual(
        expect.objectContaining({
          id: 'record_5',
          current: 3,
          target: 5,
        })
      )
    })

    it('should return next origin diversity milestone', () => {
      const records = [
        { ...mockRecord, origin: 'Ethiopia' },
        { ...mockRecord, id: 'test-2', origin: 'Colombia' },
        { ...mockRecord, id: 'test-3', origin: 'Brazil' },
      ]

      const milestones = getNextMilestones(records)

      expect(milestones).toContainEqual(
        expect.objectContaining({
          id: 'origin_explorer',
          current: 3,
          target: 5,
        })
      )
    })

    it('should return perfect rating milestone', () => {
      const records = [
        { ...mockRecord, rating: 4 },
        { ...mockRecord, id: 'test-2', rating: 3 },
      ]

      const milestones = getNextMilestones(records)

      expect(milestones).toContainEqual(
        expect.objectContaining({
          id: 'perfect_rating',
          current: 0,
          target: 1,
        })
      )
    })

    it('should limit returned milestones', () => {
      const records = [mockRecord]

      const milestones = getNextMilestones(records)

      expect(milestones.length).toBeLessThanOrEqual(5)
    })
  })

  describe('calculateLevel', () => {
    it('should calculate correct level for record count', () => {
      expect(calculateLevel(0)).toBe(1)
      expect(calculateLevel(1)).toBe(1)
      expect(calculateLevel(5)).toBe(2)
      expect(calculateLevel(15)).toBe(3)
      expect(calculateLevel(30)).toBe(4)
      expect(calculateLevel(50)).toBe(5)
      expect(calculateLevel(100)).toBe(6)
    })

    it('should handle high record counts', () => {
      expect(calculateLevel(500)).toBe(11)
      expect(calculateLevel(1000)).toBe(16)
    })
  })

  describe('formatAchievementDate', () => {
    it('should format date correctly for Korean locale', () => {
      const date = '2025-01-31T10:30:00Z'
      const formatted = formatAchievementDate(date)

      expect(formatted).toMatch(/2025년 1월 31일/)
    })

    it('should handle different date formats', () => {
      const date = new Date('2025-01-31T10:30:00Z').toISOString()
      const formatted = formatAchievementDate(date)

      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })
  })
})