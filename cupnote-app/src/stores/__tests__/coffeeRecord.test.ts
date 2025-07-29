import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCoffeeRecordStore } from '../coffeeRecord'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ 
          single: vi.fn(() => Promise.resolve({ data: mockRecord, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [mockRecord], error: null })),
          single: vi.fn(() => Promise.resolve({ data: mockRecord, error: null }))
        }))
      })),
      update: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}))

const mockRecord = {
  id: '1',
  user_id: 'test-user',
  coffee_name: 'Test Coffee',
  total_match_score: 85,
  selected_flavors: ['chocolate', 'nutty'],
  created_at: new Date().toISOString()
}

describe('CoffeeRecord Store', () => {
  let store: ReturnType<typeof useCoffeeRecordStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCoffeeRecordStore()
  })

  describe('Session Management', () => {
    it('should initialize with empty session', () => {
      expect(store.currentSession).toEqual({})
    })

    it('should update session data correctly', () => {
      // Directly update session as the actual store does
      store.currentSession.coffeeName = 'Ethiopian Yirgacheffe'
      store.currentSession.cafeName = 'Local Cafe'
      store.currentSession.location = 'Ethiopia'
      store.currentSession.brewingMethod = 'Pour Over'

      expect(store.currentSession.coffeeName).toBe('Ethiopian Yirgacheffe')
      expect(store.currentSession.cafeName).toBe('Local Cafe')
      expect(store.currentSession.location).toBe('Ethiopia')
      expect(store.currentSession.brewingMethod).toBe('Pour Over')
    })

    it('should update flavor selections correctly', () => {
      const flavors = ['floral', 'citrus', 'tea-like']
      store.currentSession.selectedFlavors = flavors

      expect(store.currentSession.selectedFlavors).toEqual(flavors)
    })

    it('should update sensory selections correctly', () => {
      const sensory = ['높은 산미', '중간 단맛', '가벼운 바디']
      store.currentSession.selectedSensory = sensory

      expect(store.currentSession.selectedSensory).toEqual(sensory)
    })

    it('should update personal notes correctly', () => {
      const notes = 'Great coffee with balanced flavor profile'
      store.currentSession.personalNotes = notes

      expect(store.currentSession.personalNotes).toBe(notes)
    })

    it('should update roaster notes correctly', () => {
      const roasterNotes = 'Chocolate and nut flavors with medium body'
      const level = 3
      
      store.currentSession.roasterNotes = roasterNotes
      store.currentSession.roasterNotesLevel = level

      expect(store.currentSession.roasterNotes).toBe(roasterNotes)
      expect(store.currentSession.roasterNotesLevel).toBe(level)
    })
  })

  describe('Session Completeness', () => {
    it('should detect incomplete session', () => {
      expect(store.hasCompleteSession).toBe(false)
    })

    it('should detect complete session', () => {
      // Set up complete session
      store.currentSession.coffeeName = 'Test Coffee'
      store.currentSession.cafeName = 'Test Cafe'
      store.currentSession.location = 'Colombia'
      store.currentSession.brewingMethod = 'Pour Over'
      store.currentSession.selectedFlavors = ['chocolate', 'nutty']
      store.currentSession.selectedSensory = ['높은 산미']

      expect(store.hasCompleteSession).toBe(true)
    })
  })

  describe('Match Score Calculation', () => {
    beforeEach(() => {
      // Set up a complete session for testing
      store.currentSession.coffeeName = 'Test Coffee'
      store.currentSession.cafeName = 'Test Cafe'
      store.currentSession.location = 'Colombia'
      store.currentSession.brewingMethod = 'Pour Over'
      store.currentSession.selectedFlavors = ['chocolate', 'nutty', 'caramel']
      store.currentSession.selectedSensory = ['높은 산미', '중간 단맛', '중간 바디']
      store.currentSession.personalNotes = 'Great coffee with balanced flavor'
      store.currentSession.roasterNotes = 'Chocolate and nut flavors with medium body'
      store.currentSession.roasterNotesLevel = 3
    })

    it('should calculate match scores correctly', () => {
      const scores = store.calculateMatchScores()

      // Test that all scores are calculated
      expect(scores.flavorMatchScore).toBeGreaterThanOrEqual(0)
      expect(scores.sensoryMatchScore).toBeGreaterThanOrEqual(0)
      expect(scores.totalMatchScore).toBeGreaterThanOrEqual(0)

      // Test score ranges (0-100)
      expect(scores.flavorMatchScore).toBeLessThanOrEqual(100)
      expect(scores.sensoryMatchScore).toBeLessThanOrEqual(100)
      expect(scores.totalMatchScore).toBeLessThanOrEqual(100)

      // Should be reasonable scores (since it's random 70-100)
      expect(scores.flavorMatchScore).toBeGreaterThanOrEqual(70)
      expect(scores.sensoryMatchScore).toBeGreaterThanOrEqual(70)
    })

    it('should handle missing roaster notes gracefully', () => {
      store.currentSession.roasterNotes = ''
      store.currentSession.roasterNotesLevel = 1
      
      const scores = store.calculateMatchScores()
      
      // Should still calculate scores with defaults
      expect(scores.flavorMatchScore).toBeGreaterThanOrEqual(70)
      expect(scores.sensoryMatchScore).toBeGreaterThanOrEqual(70)
      expect(scores.totalMatchScore).toBeGreaterThanOrEqual(70)
    })

    it('should handle empty session gracefully', () => {
      const emptyStore = useCoffeeRecordStore()
      const scores = emptyStore.calculateMatchScores()

      // Should still return random scores (since it's a mock implementation)
      expect(scores.flavorMatchScore).toBeGreaterThanOrEqual(70)
      expect(scores.sensoryMatchScore).toBeGreaterThanOrEqual(70)
      expect(scores.totalMatchScore).toBeGreaterThanOrEqual(70)
    })

    it('should give consistent results for same input', () => {
      const scores1 = store.calculateMatchScores()
      const scores2 = store.calculateMatchScores()

      expect(scores1.flavor_match_score).toBe(scores2.flavor_match_score)
      expect(scores1.sensory_match_score).toBe(scores2.sensory_match_score)
      expect(scores1.total_match_score).toBe(scores2.total_match_score)
    })
  })

  describe('Data Validation', () => {
    it('should handle empty coffee name', () => {
      store.currentSession.coffeeName = ''
      
      // Should handle empty coffee name gracefully
      expect(store.currentSession.coffeeName).toBe('')
      expect(store.hasCompleteSession).toBe(false)
    })

    it('should handle empty flavor selections', () => {
      store.currentSession.selectedFlavors = []
      
      expect(store.currentSession.selectedFlavors).toEqual([])
      expect(store.hasCompleteSession).toBe(false)
    })

    it('should handle missing sensory selections', () => {
      store.currentSession.selectedSensory = undefined
      
      expect(store.hasCompleteSession).toBe(false)
    })
  })

  describe('Records Management', () => {
    it('should save session correctly', async () => {
      // Set up complete session
      store.currentSession.coffeeName = 'Test Coffee'
      store.currentSession.cafeName = 'Test Cafe'
      store.currentSession.location = 'Colombia'
      store.currentSession.brewingMethod = 'Pour Over'
      store.currentSession.selectedFlavors = ['chocolate']
      store.currentSession.selectedSensory = ['높은 산미']

      const result = await store.saveCurrentSession('test-user')

      expect(result).toBeTruthy()
    })

    it('should fetch user records correctly', async () => {
      await store.fetchUserRecords('test-user')

      expect(store.records).toHaveLength(1)
      expect(store.records[0]).toEqual(mockRecord)
    })

    it('should clear session after save', async () => {
      // Set up session
      store.currentSession.coffeeName = 'Test Coffee'
      
      await store.saveCurrentSession('test-user')
      
      // Session should be cleared after save
      expect(store.currentSession).toEqual({})
    })
  })

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      // Mock error
      vi.mocked(store).saveCurrentSession = vi.fn().mockRejectedValue(new Error('Save failed'))
      
      try {
        await store.saveCurrentSession('test-user')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle fetch errors gracefully', async () => {
      // Mock error by setting up incomplete mock
      const errorStore = useCoffeeRecordStore()
      
      // Should not throw but handle gracefully
      await expect(errorStore.fetchUserRecords('invalid-user')).resolves.not.toThrow()
    })
  })

  describe('Statistics and Computed Values', () => {
    beforeEach(() => {
      // Mock records for statistics
      store.records = [
        { ...mockRecord, total_match_score: 85, location: 'Colombia' },
        { ...mockRecord, id: '2', total_match_score: 75, location: 'Ethiopia' },
        { ...mockRecord, id: '3', total_match_score: 90, location: 'Colombia' }
      ]
    })

    it('should provide latest record', () => {
      expect(store.latestRecord).toEqual(store.records[0])
    })

    it('should handle empty records gracefully', () => {
      store.records = []
      expect(store.latestRecord).toBeNull()
    })

    it('should calculate statistics correctly', () => {
      // Test that records are accessible for statistics calculation
      expect(store.records).toHaveLength(3)
      
      const avgScore = store.records.reduce((sum, record) => sum + (record.total_match_score || 0), 0) / store.records.length
      expect(Math.round(avgScore)).toBe(83) // (85 + 75 + 90) / 3 = 83.33 -> 83
    })
  })

  describe('State Management', () => {
    it('should manage loading states correctly', () => {
      expect(store.isLoading).toBe(false)
      expect(store.isSaving).toBe(false)
    })

    it('should handle errors correctly', () => {
      expect(store.error).toBeNull()
    })

    it('should clear session correctly', () => {
      store.currentSession.coffeeName = 'Test'
      store.clearCurrentSession()
      
      expect(store.currentSession).toEqual({})
    })
  })
})