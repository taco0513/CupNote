import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTastingSessionStore } from '../tastingSession'
import { supabase } from '../../lib/supabase'

// Integration tests for tastingSession store
// These tests interact with a test database to verify real data operations

describe('TastingSession Store Integration Tests', () => {
  let store: ReturnType<typeof useTastingSessionStore>
  const testUserId = 'test-user-' + Date.now()
  let createdRecordIds: string[] = []

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTastingSessionStore()
  })

  afterEach(async () => {
    // Cleanup: Delete all test records
    if (createdRecordIds.length > 0) {
      await supabase
        .from('tastings')
        .delete()
        .in('id', createdRecordIds)
    }
    createdRecordIds = []
  })

  describe('Complete Tasting Flow', () => {
    it('should handle complete cafe mode flow', async () => {
      // Step 1: Start new session
      store.startNewSession('cafe')
      expect(store.currentSession.mode).toBe('cafe')
      expect(store.currentSession.sessionStartTime).toBeDefined()

      // Step 2: Update coffee info
      store.updateCoffeeSetup({
        coffee_name: 'Test Americano',
        cafe_name: 'Test Cafe',
        location: 'Seoul',
        brewing_method: 'Espresso Machine'
      })
      
      expect(store.currentSession.coffeeInfo?.coffee_name).toBe('Test Americano')
      expect(store.currentSession.coffeeInfo?.cafe_name).toBe('Test Cafe')

      // Step 3: Update flavor selection
      const flavors = [
        { id: 'chocolate', text: '초콜릿' },
        { id: 'nutty', text: '고소한' }
      ]
      store.updateFlavorSelection(flavors)
      expect(store.currentSession.selectedFlavors).toEqual(flavors)

      // Step 4: Update sensory expression
      const sensory = [
        { id: 'acidity-1', category: 'acidity', text: '약한' },
        { id: 'sweetness-3', category: 'sweetness', text: '달콤한' }
      ]
      store.updateSensoryExpression(sensory)
      expect(store.currentSession.sensoryExpressions).toEqual(sensory)

      // Step 5: Update personal comment
      store.updatePersonalComment('정말 맛있는 커피였습니다!')
      expect(store.currentSession.personalComment).toBe('정말 맛있는 커피였습니다!')

      // Step 6: Update roaster notes
      store.updateRoasterNotes('다크 초콜릿과 헤이즐넛 향', 2)
      expect(store.currentSession.roasterNotes).toBe('다크 초콜릿과 헤이즐넛 향')
      expect(store.currentSession.roasterNotesLevel).toBe(2)

      // Step 7: Save session
      const savedRecord = await store.saveCurrentSession(testUserId)
      expect(savedRecord).toBeDefined()
      expect(savedRecord.id).toBeDefined()
      
      if (savedRecord?.id) {
        createdRecordIds.push(savedRecord.id)
      }

      // Verify saved data
      expect(savedRecord.mode).toBe('cafe')
      expect(savedRecord.coffee_info.coffee_name).toBe('Test Americano')
      expect(savedRecord.selected_flavors).toHaveLength(2)
      expect(savedRecord.sensory_expressions).toHaveLength(2)
      expect(savedRecord.personal_comment).toBe('정말 맛있는 커피였습니다!')
      expect(savedRecord.match_score).toBeDefined()
      expect(savedRecord.match_score.total).toBeGreaterThanOrEqual(70)
      expect(savedRecord.match_score.total).toBeLessThanOrEqual(100)

      // Verify session cleared after save
      expect(store.currentSession).toEqual({})
    })

    it('should handle complete homecafe mode flow', async () => {
      // Step 1: Start new session
      store.startNewSession('homecafe')

      // Step 2: Update coffee info
      store.updateCoffeeSetup({
        coffee_name: 'Ethiopia Yirgacheffe',
        cafe_name: 'Home',
        location: 'My Kitchen',
        brewing_method: 'V60',
        origin: 'Ethiopia',
        variety: 'Heirloom',
        altitude: '1900-2100m',
        process: 'Washed',
        roast_level: 'Light'
      })

      // Step 3: Update HomeCafe brewing data
      const brewData = {
        dripper: 'V60',
        recipe: {
          coffee_amount: 15,
          water_amount: 250,
          ratio: 16.7,
          water_temp: 93,
          brew_time: 180,
          lap_times: [30, 60, 90, 120, 150, 180]
        },
        quick_notes: '30초 블루밍, 부드럽게 추출'
      }
      store.updateHomeCafeData(brewData)
      expect(store.currentSession.brewSettings).toEqual(brewData)

      // Step 4-7: Same as cafe mode (flavors, sensory, comment, roaster notes)
      store.updateFlavorSelection([{ id: 'floral', text: '꽃향' }])
      store.updateSensoryExpression([{ id: 'acidity-4', category: 'acidity', text: '밝은' }])
      store.updatePersonalComment('집에서 내린 최고의 커피!')
      store.updateRoasterNotes(null, 1)

      // Step 8: Save session
      const savedRecord = await store.saveCurrentSession(testUserId)
      if (savedRecord?.id) {
        createdRecordIds.push(savedRecord.id)
      }

      // Verify HomeCafe specific data
      expect(savedRecord.mode).toBe('homecafe')
      expect(savedRecord.brew_settings).toBeDefined()
      expect(savedRecord.brew_settings.dripper).toBe('V60')
      expect(savedRecord.brew_settings.recipe.coffee_amount).toBe(15)
    })

    it('should handle complete pro mode flow', async () => {
      // Step 1: Start new session
      store.startNewSession('pro')

      // Step 2: Update coffee info
      store.updateCoffeeSetup({
        coffee_name: 'Colombia Geisha',
        cafe_name: 'Specialty Coffee Lab',
        location: 'Seoul',
        brewing_method: 'Cupping',
        origin: 'Colombia',
        variety: 'Geisha',
        altitude: '1800m',
        process: 'Natural',
        roast_level: 'Light-Medium'
      })

      // Step 3: Update HomeCafe data (required for Pro)
      store.updateHomeCafeData({
        dripper: 'Cupping Bowl',
        recipe: {
          coffee_amount: 12,
          water_amount: 200,
          ratio: 16.7,
          water_temp: 94,
          brew_time: 240,
          lap_times: [240]
        }
      })

      // Step 4: Update Pro brewing data
      store.updateProBrewingData({
        extraction_method: 'Cupping',
        grind_size: 'Medium-Coarse',
        bloom_time: 30,
        total_time: 240,
        notes: 'Standard SCA cupping protocol'
      })

      // Step 5: Update QC measurement data
      store.updateQcMeasurementData({
        tds: 1.35,
        extraction_yield: 19.5,
        water_tds: 120,
        water_ph: 7.2,
        notes: 'Optimal extraction achieved'
      })

      // Step 6: Update flavors and sensory
      store.updateFlavorSelection([
        { id: 'jasmine', text: '자스민' },
        { id: 'honey', text: '꿀' },
        { id: 'bergamot', text: '베르가못' }
      ])

      // Step 7: Update sensory slider data (Pro specific)
      store.updateSensorySliderData({
        ratings: {
          fragrance_aroma: 8.5,
          flavor: 8.75,
          aftertaste: 8.5,
          acidity: 9.0,
          body: 7.5,
          balance: 8.5,
          uniformity: 10,
          clean_cup: 10,
          sweetness: 10,
          defects: 0
        },
        overall_score: 85.25,
        quick_notes: 'Exceptional clarity and floral notes'
      })

      // Step 8: Skip sensory expression for Pro mode
      store.updateSensoryExpression([])

      // Step 9: Update personal comment
      store.updatePersonalComment('Outstanding cupping score!')

      // Step 10: Update roaster notes
      store.updateRoasterNotes('Jasmine, honey, bergamot', 2)

      // Step 11: Save session
      const savedRecord = await store.saveCurrentSession(testUserId)
      if (savedRecord?.id) {
        createdRecordIds.push(savedRecord.id)
      }

      // Verify Pro specific data
      expect(savedRecord.mode).toBe('pro')
      expect(savedRecord.experimental_data).toBeDefined()
      expect(savedRecord.experimental_data.extraction_method).toBe('Cupping')
      expect(savedRecord.experimental_data.tds).toBe(1.35)
      expect(savedRecord.experimental_data.extraction_yield).toBe(19.5)
      expect(savedRecord.selected_flavors).toHaveLength(3)
      expect(savedRecord.sensory_skipped).toBe(true)
    })
  })

  describe('Data Retrieval', () => {
    it('should fetch user records correctly', async () => {
      // Create multiple records
      const modes: Array<'cafe' | 'homecafe' | 'pro'> = ['cafe', 'homecafe', 'pro']
      
      for (const mode of modes) {
        store.startNewSession(mode)
        store.updateCoffeeSetup({
          coffee_name: `Test Coffee ${mode}`,
          cafe_name: `Test Cafe ${mode}`,
          location: 'Seoul',
          brewing_method: mode === 'pro' ? 'Cupping' : 'Espresso'
        })
        store.updateFlavorSelection([{ id: 'test', text: 'Test' }])
        
        const record = await store.saveCurrentSession(testUserId)
        if (record?.id) {
          createdRecordIds.push(record.id)
        }
      }

      // Fetch records
      await store.fetchUserRecords(testUserId)
      
      expect(store.records).toHaveLength(3)
      expect(store.records[0].mode).toBeDefined()
      expect(store.records[0].coffee_info).toBeDefined()
      
      // Verify sorting (newest first)
      const timestamps = store.records.map(r => new Date(r.created_at).getTime())
      expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[1])
      expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[2])
    })

    it('should calculate coffee statistics correctly', async () => {
      // Create multiple records for the same coffee
      const coffeeName = 'Test Statistics Coffee'
      const scores = [85, 90, 88]
      
      for (const score of scores) {
        store.startNewSession('cafe')
        store.updateCoffeeSetup({
          coffee_name: coffeeName,
          cafe_name: 'Test Cafe',
          location: 'Seoul',
          brewing_method: 'Espresso'
        })
        store.updateFlavorSelection([{ id: 'test', text: 'Test' }])
        
        // Mock the score calculation to return specific values
        const originalCalculate = store.calculateMatchScores
        store.calculateMatchScores = () => ({
          flavor_match: score - 5,
          sensory_match: score - 3,
          total: score,
          roaster_bonus: 0
        })
        
        const record = await store.saveCurrentSession(testUserId)
        if (record?.id) {
          createdRecordIds.push(record.id)
        }
        
        store.calculateMatchScores = originalCalculate
      }

      // Get statistics
      const stats = await store.getCoffeeStatistics(coffeeName)
      
      expect(stats).toBeDefined()
      expect(stats?.total_records).toBe(3)
      expect(stats?.average_score).toBe(88) // (85 + 90 + 88) / 3 = 87.67 → 88
      expect(stats?.best_score).toBe(90)
      expect(stats?.latest_score).toBe(88) // Last inserted
    })
  })

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      store.startNewSession('cafe')
      // Don't set required coffee info
      
      await expect(store.saveCurrentSession(testUserId)).rejects.toThrow('Incomplete session data')
      expect(store.error).toBe('Incomplete session data')
    })

    it('should handle fetch errors gracefully', async () => {
      // Use invalid user ID
      await expect(store.fetchUserRecords('')).rejects.toThrow()
      expect(store.error).toBeDefined()
    })
  })

  describe('JSONB Query Performance', () => {
    it('should efficiently query by coffee name', async () => {
      // Create records with different coffee names
      const coffeeNames = ['Coffee A', 'Coffee B', 'Coffee C']
      
      for (const name of coffeeNames) {
        for (let i = 0; i < 3; i++) {
          store.startNewSession('cafe')
          store.updateCoffeeSetup({
            coffee_name: name,
            cafe_name: 'Test Cafe',
            location: 'Seoul',
            brewing_method: 'Espresso'
          })
          store.updateFlavorSelection([{ id: 'test', text: 'Test' }])
          
          const record = await store.saveCurrentSession(testUserId)
          if (record?.id) {
            createdRecordIds.push(record.id)
          }
        }
      }

      // Measure query performance
      const startTime = performance.now()
      const stats = await store.getCoffeeStatistics('Coffee B')
      const endTime = performance.now()
      
      expect(stats?.total_records).toBe(3)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast with proper indexing
    })
  })
})