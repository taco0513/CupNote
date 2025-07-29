import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type CoffeeRecord = Database['public']['Tables']['coffee_records']['Row']
type CoffeeRecordInsert = Database['public']['Tables']['coffee_records']['Insert']

interface HomeCafeData {
  dripper: string
  recipe: {
    coffee_amount: number
    water_amount: number
    ratio: number
    water_temp: number
    brew_time: number
    lap_times: number[]
  }
  quick_notes?: string
}

interface SensorySliderData {
  ratings: {
    acidity: number
    sweetness: number
    bitterness: number
    body: number
    aftertaste: number
    balance: number
  }
  overall_score: number
  quick_notes: string
}

interface ProBrewingData {
  extraction_method: string
  grind_size: string
  tds: number
  extraction_yield: number
  water_tds: number
  water_ph: number
  bloom_time: number
  total_time: number
  notes?: string
}

interface TastingSession {
  // Mode
  mode?: 'cafe' | 'homecafe' | 'pro'
  
  // Coffee setup
  coffeeName: string
  cafeName: string
  location: string
  brewingMethod: string
  origin?: string
  variety?: string
  altitude?: string
  process?: string
  roastLevel?: string
  
  // HomeCafe data
  homeCafeData?: HomeCafeData
  
  // Pro brewing data (Pro mode)
  proBrewingData?: ProBrewingData
  
  // Sensory slider data (Pro mode)
  sensorySliderData?: SensorySliderData
  
  // Flavor selection
  selectedFlavors: Array<{ id: number; text: string }>
  
  // Sensory expression
  selectedSensory: Array<{ id: number; category: string; text: string }>
  
  // Notes
  personalNotes: string
  roasterNotes: string | null
  roasterNotesLevel: number // 1: no notes, 2: with notes
}

export const useCoffeeRecordStore = defineStore('coffeeRecord', () => {
  // Current tasting session
  const currentSession = ref<Partial<TastingSession>>({})
  
  // Loading states
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  
  // Coffee records
  const records = ref<CoffeeRecord[]>([])
  
  // Current session methods
  const updateCoffeeSetup = (data: {
    coffeeName: string
    cafeName: string
    location: string
    brewingMethod: string
    origin?: string
    variety?: string
    altitude?: string
    process?: string
    roastLevel?: string
  }) => {
    currentSession.value = {
      ...currentSession.value,
      ...data
    }
  }
  
  const updateFlavorSelection = (flavors: Array<{ id: number; text: string }>) => {
    currentSession.value.selectedFlavors = flavors
  }
  
  const updateSensoryExpression = (sensory: Array<{ id: number; category: string; text: string }>) => {
    currentSession.value.selectedSensory = sensory
  }
  
  const updatePersonalNotes = (notes: string) => {
    currentSession.value.personalNotes = notes
  }
  
  const updateRoasterNotes = (notes: string | null, level: number) => {
    currentSession.value.roasterNotes = notes
    currentSession.value.roasterNotesLevel = level
  }
  
  // Calculate match scores (mock calculation for now)
  const calculateMatchScores = () => {
    // TODO: Implement real match score calculation based on roaster notes
    const flavorScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const sensoryScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const roasterBonus = currentSession.value.roasterNotesLevel === 2 ? 10 : 0
    
    const baseScore = Math.round((flavorScore + sensoryScore) / 2)
    const totalScore = Math.min(100, baseScore + roasterBonus)
    
    return {
      flavorMatchScore: flavorScore,
      sensoryMatchScore: sensoryScore,
      totalMatchScore: totalScore
    }
  }
  
  // Save current session
  const saveCurrentSession = async (userId: string) => {
    if (!currentSession.value.coffeeName) {
      throw new Error('Incomplete session data')
    }
    
    try {
      isSaving.value = true
      error.value = null
      
      const scores = calculateMatchScores()
      
      const recordData: CoffeeRecordInsert = {
        user_id: userId,
        coffee_name: currentSession.value.coffeeName!,
        cafe_name: currentSession.value.cafeName!,
        location: currentSession.value.location!,
        brewing_method: currentSession.value.brewingMethod!,
        origin: currentSession.value.origin || null,
        variety: currentSession.value.variety || null,
        altitude: currentSession.value.altitude || null,
        process: currentSession.value.process || null,
        roast_level: currentSession.value.roastLevel || null,
        selected_flavors: currentSession.value.selectedFlavors || [],
        selected_sensory: currentSession.value.selectedSensory || [],
        personal_notes: currentSession.value.personalNotes || null,
        roaster_notes: currentSession.value.roasterNotes || null,
        roaster_notes_level: currentSession.value.roasterNotesLevel || 1,
        ...scores
      }
      
      const { data, error: saveError } = await supabase
        .from('coffee_records')
        .insert([recordData])
        .select()
        .single()
      
      if (saveError) throw saveError
      
      // Update coffee statistics
      await updateCoffeeStatistics(data)
      
      // Clear current session after successful save
      clearCurrentSession()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save coffee record'
      throw err
    } finally {
      isSaving.value = false
    }
  }
  
  // Update coffee statistics
  const updateCoffeeStatistics = async (record: CoffeeRecord) => {
    try {
      // Check if statistics exist
      const { data: existing } = await supabase
        .from('coffee_statistics')
        .select('*')
        .eq('coffee_name', record.coffee_name)
        .single()
      
      if (existing) {
        // Update existing statistics
        const newTotal = existing.total_records + 1
        const newAverage = ((existing.average_score * existing.total_records) + record.total_match_score!) / newTotal
        
        await supabase
          .from('coffee_statistics')
          .update({
            total_records: newTotal,
            average_score: newAverage,
            updated_at: new Date().toISOString()
          })
          .eq('coffee_name', record.coffee_name)
      } else {
        // Create new statistics
        await supabase
          .from('coffee_statistics')
          .insert({
            coffee_name: record.coffee_name,
            cafe_name: record.cafe_name,
            total_records: 1,
            average_score: record.total_match_score || 0,
            common_flavors: record.selected_flavors
          })
      }
    } catch (err) {
      console.error('Failed to update coffee statistics:', err)
      // Don't throw - statistics update is not critical
    }
  }
  
  // Fetch user's coffee records
  const fetchUserRecords = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      records.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch coffee records'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Get coffee statistics
  const getCoffeeStatistics = async (coffeeName: string) => {
    try {
      const { data, error: statsError } = await supabase
        .from('coffee_statistics')
        .select('*')
        .eq('coffee_name', coffeeName)
        .single()
      
      if (statsError && statsError.code !== 'PGRST116') throw statsError
      
      return data
    } catch (err) {
      console.error('Failed to fetch coffee statistics:', err)
      return null
    }
  }
  
  // Clear current session
  const clearCurrentSession = () => {
    currentSession.value = {}
  }
  
  // Computed properties
  const hasCompleteSession = computed(() => {
    const session = currentSession.value
    return !!(
      session.coffeeName &&
      session.cafeName &&
      session.location &&
      session.brewingMethod &&
      session.selectedFlavors &&
      session.selectedFlavors.length > 0 &&
      session.selectedSensory &&
      session.selectedSensory.length > 0
    )
  })
  
  const latestRecord = computed(() => records.value[0] || null)
  
  return {
    // State
    currentSession,
    records,
    isLoading,
    isSaving,
    error,
    
    // Computed
    hasCompleteSession,
    latestRecord,
    
    // Actions
    updateCoffeeSetup,
    updateFlavorSelection,
    updateSensoryExpression,
    updatePersonalNotes,
    updateRoasterNotes,
    saveCurrentSession,
    fetchUserRecords,
    getCoffeeStatistics,
    clearCurrentSession,
    calculateMatchScores
  }
})