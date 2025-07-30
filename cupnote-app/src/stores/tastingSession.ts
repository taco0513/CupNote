import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// Interface matching the tastings table schema
interface TastingRecord {
  id?: string
  user_id: string
  coffee_id?: string | null
  mode: 'cafe' | 'homecafe' | 'pro'
  session_id?: string
  coffee_info: {
    coffee_name: string
    cafe_name: string
    location: string
    brewing_method: string
    origin?: string | null
    variety?: string | null
    altitude?: string | null
    process?: string | null
    roast_level?: string | null
  }
  brew_settings?: {
    dripper?: string
    recipe?: {
      coffee_amount: number
      water_amount: number
      ratio: number
      water_temp: number
      brew_time: number
      lap_times: number[]
    }
    quick_notes?: string
  } | null
  experimental_data?: {
    extraction_method?: string
    grind_size?: string
    tds?: number
    extraction_yield?: number
    water_tds?: number
    water_ph?: number
    bloom_time?: number
    total_time?: number
    notes?: string
  } | null
  selected_flavors: Array<{ id: string; text: string }>
  sensory_expressions: Array<{ id: string; category: string; text: string }>
  personal_comment?: string | null
  roaster_notes?: string | null
  match_score?: {
    flavor_match: number
    sensory_match: number
    total: number
    roaster_bonus?: number
  } | null
  total_duration?: number | null
  sensory_skipped: boolean
  completed_at?: string
  created_at?: string
  updated_at?: string
}

// Current session interface (for step-by-step data collection)
interface CurrentSession {
  // Basic info
  mode?: 'cafe' | 'homecafe' | 'pro'
  sessionStartTime?: number
  
  // Coffee info
  coffeeInfo?: {
    coffee_name: string
    cafe_name: string
    location: string
    brewing_method: string
    origin?: string
    variety?: string
    altitude?: string
    process?: string
    roast_level?: string
  }
  
  // Mode-specific data
  brewSettings?: TastingRecord['brew_settings']
  experimentalData?: TastingRecord['experimental_data']
  
  // Tasting data
  selectedFlavors?: Array<{ id: string; text: string }>
  sensoryExpressions?: Array<{ id: string; category: string; text: string }>
  personalComment?: string
  roasterNotes?: string | null
  roasterNotesLevel?: number // 1: no notes, 2: with notes
  
  // Pro mode specific
  sensorySliderData?: {
    ratings: {
      [key: string]: number
    }
    overall_score: number
    quick_notes?: string
  }
  qcMeasurementData?: {
    tds: number
    extraction_yield: number
    water_tds: number
    water_ph: number
    notes?: string
  }
}

export const useTastingSessionStore = defineStore('tastingSession', () => {
  // Current tasting session
  const currentSession = ref<CurrentSession>({})
  
  // Loading states
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  
  // Tasting records
  const records = ref<TastingRecord[]>([])
  
  // Session management
  const startNewSession = (mode: 'cafe' | 'homecafe' | 'pro') => {
    currentSession.value = {
      mode,
      sessionStartTime: Date.now()
    }
  }
  
  // Update methods for each step
  const updateCoffeeSetup = (data: Partial<CurrentSession['coffeeInfo']> & { mode?: 'cafe' | 'homecafe' | 'pro' }) => {
    if (data.mode) {
      currentSession.value.mode = data.mode
    }
    
    currentSession.value.coffeeInfo = {
      ...currentSession.value.coffeeInfo,
      ...data
    } as CurrentSession['coffeeInfo']
  }
  
  const updateHomeCafeData = (data: NonNullable<TastingRecord['brew_settings']>) => {
    currentSession.value.brewSettings = data
  }
  
  const updateProBrewingData = (data: Partial<NonNullable<TastingRecord['experimental_data']>>) => {
    currentSession.value.experimentalData = {
      ...currentSession.value.experimentalData,
      ...data
    }
  }
  
  const updateQcMeasurementData = (data: CurrentSession['qcMeasurementData']) => {
    currentSession.value.qcMeasurementData = data
    // Merge with experimental data
    if (data) {
      currentSession.value.experimentalData = {
        ...currentSession.value.experimentalData,
        tds: data.tds,
        extraction_yield: data.extraction_yield,
        water_tds: data.water_tds,
        water_ph: data.water_ph,
        notes: data.notes
      }
    }
  }
  
  const updateFlavorSelection = (flavors: Array<{ id: string; text: string }>) => {
    currentSession.value.selectedFlavors = flavors
  }
  
  const updateSensoryExpression = (sensory: Array<{ id: string; category: string; text: string }>) => {
    currentSession.value.sensoryExpressions = sensory
  }
  
  const updateSensorySliderData = (data: CurrentSession['sensorySliderData']) => {
    currentSession.value.sensorySliderData = data
  }
  
  const updatePersonalComment = (comment: string) => {
    currentSession.value.personalComment = comment
  }
  
  const updateRoasterNotes = (notes: string | null, level: number) => {
    currentSession.value.roasterNotes = notes
    currentSession.value.roasterNotesLevel = level
  }
  
  const updateProQcReport = (reportData: any) => {
    // Store Pro QC Report data in experimental_data
    currentSession.value.experimentalData = {
      ...currentSession.value.experimentalData,
      qc_report: reportData
    }
  }
  
  // Calculate match scores
  const calculateMatchScores = () => {
    // TODO: Implement real match score calculation
    const flavorScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const sensoryScore = Math.floor(Math.random() * 30) + 70 // 70-100
    const roasterBonus = currentSession.value.roasterNotesLevel === 2 ? 10 : 0
    
    const baseScore = Math.round((flavorScore + sensoryScore) / 2)
    const totalScore = Math.min(100, baseScore + roasterBonus)
    
    return {
      flavor_match: flavorScore,
      sensory_match: sensoryScore,
      total: totalScore,
      roaster_bonus: roasterBonus
    }
  }
  
  // Save current session
  const saveCurrentSession = async (userId: string) => {
    if (!currentSession.value.coffeeInfo || !currentSession.value.mode) {
      throw new Error('Incomplete session data')
    }
    
    try {
      isSaving.value = true
      error.value = null
      
      const scores = calculateMatchScores()
      const duration = currentSession.value.sessionStartTime 
        ? Math.floor((Date.now() - currentSession.value.sessionStartTime) / 1000)
        : null
      
      const recordData: Omit<TastingRecord, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        mode: currentSession.value.mode,
        coffee_info: currentSession.value.coffeeInfo,
        brew_settings: currentSession.value.brewSettings || null,
        experimental_data: currentSession.value.experimentalData || null,
        selected_flavors: currentSession.value.selectedFlavors || [],
        sensory_expressions: currentSession.value.sensoryExpressions || [],
        personal_comment: currentSession.value.personalComment || null,
        roaster_notes: currentSession.value.roasterNotes || null,
        match_score: scores,
        total_duration: duration,
        sensory_skipped: !currentSession.value.sensoryExpressions || currentSession.value.sensoryExpressions.length === 0,
        completed_at: new Date().toISOString()
      }
      
      const { data, error: saveError } = await supabase
        .from('tastings')
        .insert([recordData])
        .select()
        .single()
      
      if (saveError) throw saveError
      
      // Clear current session after successful save
      clearCurrentSession()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save tasting record'
      throw err
    } finally {
      isSaving.value = false
    }
  }
  
  // Fetch user's tasting records
  const fetchUserRecords = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('tastings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      records.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasting records'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Get coffee statistics
  const getCoffeeStatistics = async (coffeeName: string) => {
    try {
      const { data, error: statsError } = await supabase
        .from('tastings')
        .select('match_score, created_at')
        .eq('coffee_info->>coffee_name', coffeeName)
        .order('created_at', { ascending: false })
      
      if (statsError) throw statsError
      
      if (!data || data.length === 0) return null
      
      // Calculate statistics
      const scores = data
        .map(record => record.match_score?.total || 0)
        .filter(score => score > 0)
      
      const totalScore = scores.reduce((sum, score) => sum + score, 0)
      const averageScore = scores.length > 0 ? totalScore / scores.length : 0
      
      return {
        total_records: data.length,
        average_score: Math.round(averageScore),
        best_score: Math.max(...scores),
        latest_score: scores[0] || 0
      }
    } catch (err) {
      console.error('Failed to fetch coffee statistics:', err)
      return null
    }
  }
  
  // Clear current session
  const clearCurrentSession = () => {
    currentSession.value = {}
  }
  
  return {
    // State
    currentSession: computed(() => currentSession.value),
    records: computed(() => records.value),
    isLoading: computed(() => isLoading.value),
    isSaving: computed(() => isSaving.value),
    error: computed(() => error.value),
    
    // Methods
    startNewSession,
    updateCoffeeSetup,
    updateHomeCafeData,
    updateProBrewingData,
    updateQcMeasurementData,
    updateFlavorSelection,
    updateSensoryExpression,
    updateSensorySliderData,
    updatePersonalComment,
    updateRoasterNotes,
    updateProQcReport,
    saveCurrentSession,
    fetchUserRecords,
    getCoffeeStatistics,
    clearCurrentSession,
    calculateMatchScores
  }
})