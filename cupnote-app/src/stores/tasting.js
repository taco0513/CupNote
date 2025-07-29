import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTasting } from '@/composables/useTasting'
import { calculateMatchScore } from '@/utils/matchScore'
import { TASTING_STEPS, TASTING_MODES } from '@/constants/tasting'

export const useTastingStore = defineStore('tasting', () => {
  // Composables
  const { saveTasting, getTastings } = useTasting()

  // State
  const currentSession = ref({
    id: null,
    mode: TASTING_MODES.CAFE,
    currentStep: TASTING_STEPS.SETUP,
    startTime: null,
    
    // 커피 정보
    coffeeInfo: {
      name: '',
      roaster: '',
      origin: '',
      roastLevel: '',
      processingMethod: '',
      brewMethod: '',
      notes: ''
    },
    
    // 테이스팅 데이터
    selectedFlavors: [],
    sensoryExpressions: {
      acidity: [],
      sweetness: [],
      bitterness: [],
      body: [],
      aroma: [],
      finish: []
    },
    personalComment: '',
    roasterNotes: '',
    
    // 브루잉 설정 (Lab 모드용)
    brewSettings: {
      coffeeAmount: null,
      waterAmount: null,
      temperature: null,
      brewTime: null,
      grindSize: ''
    },
    
    // 실험 데이터 (Lab 모드용)
    experimentalData: {
      ph: null,
      tds: null,
      extraction: null
    }
  })

  const isLoading = ref(false)
  const error = ref(null)
  const tastingHistory = ref([])

  // Getters
  const isLabMode = computed(() => currentSession.value.mode === TASTING_MODES.LAB)
  
  const sessionProgress = computed(() => {
    const steps = Object.values(TASTING_STEPS)
    const currentIndex = steps.indexOf(currentSession.value.currentStep)
    return Math.round(((currentIndex + 1) / steps.length) * 100)
  })

  const canProceedToNext = computed(() => {
    const { currentStep, coffeeInfo, selectedFlavors } = currentSession.value
    
    switch (currentStep) {
      case TASTING_STEPS.SETUP:
        return coffeeInfo.name && coffeeInfo.roaster
      case TASTING_STEPS.FLAVOR:
        return selectedFlavors.length > 0
      case TASTING_STEPS.SENSORY:
        return true // 감각 표현은 선택사항
      case TASTING_STEPS.NOTES:
        return true // 개인 노트는 선택사항
      default:
        return false
    }
  })

  const hasSensoryExpressions = computed(() => {
    return Object.values(currentSession.value.sensoryExpressions)
      .some(arr => arr && arr.length > 0)
  })

  const currentMatchScore = computed(() => {
    if (!currentSession.value.selectedFlavors.length) return null
    return calculateMatchScore({
      selected_flavors: currentSession.value.selectedFlavors,
      sensory_expressions: currentSession.value.sensoryExpressions,
      roaster_notes: currentSession.value.roasterNotes
    })
  })

  // Actions
  const startNewSession = (mode = TASTING_MODES.CAFE) => {
    currentSession.value = {
      id: generateSessionId(),
      mode,
      currentStep: TASTING_STEPS.SETUP,
      startTime: new Date().toISOString(),
      
      coffeeInfo: {
        name: '',
        roaster: '',
        origin: '',
        roastLevel: '',
        processingMethod: '',
        brewMethod: '',
        notes: ''
      },
      
      selectedFlavors: [],
      sensoryExpressions: {
        acidity: [],
        sweetness: [],
        bitterness: [],
        body: [],
        aroma: [],
        finish: []
      },
      personalComment: '',
      roasterNotes: '',
      
      brewSettings: {
        coffeeAmount: null,
        waterAmount: null,
        temperature: null,
        brewTime: null,
        grindSize: ''
      },
      
      experimentalData: {
        ph: null,
        tds: null,
        extraction: null
      }
    }
    
    error.value = null
  }

  const updateCoffeeInfo = (coffeeInfo) => {
    currentSession.value.coffeeInfo = { ...currentSession.value.coffeeInfo, ...coffeeInfo }
  }

  const addFlavor = (flavor) => {
    if (!currentSession.value.selectedFlavors.includes(flavor)) {
      currentSession.value.selectedFlavors.push(flavor)
    }
  }

  const removeFlavor = (flavor) => {
    const index = currentSession.value.selectedFlavors.indexOf(flavor)
    if (index > -1) {
      currentSession.value.selectedFlavors.splice(index, 1)
    }
  }

  const toggleFlavor = (flavor) => {
    if (currentSession.value.selectedFlavors.includes(flavor)) {
      removeFlavor(flavor)
    } else {
      addFlavor(flavor)
    }
  }

  const updateSensoryExpression = (category, expressions) => {
    currentSession.value.sensoryExpressions[category] = [...expressions]
  }

  const addSensoryExpression = (category, expression) => {
    if (!currentSession.value.sensoryExpressions[category].includes(expression)) {
      currentSession.value.sensoryExpressions[category].push(expression)
    }
  }

  const removeSensoryExpression = (category, expression) => {
    const index = currentSession.value.sensoryExpressions[category].indexOf(expression)
    if (index > -1) {
      currentSession.value.sensoryExpressions[category].splice(index, 1)
    }
  }

  const updatePersonalComment = (comment) => {
    currentSession.value.personalComment = comment
  }

  const updateRoasterNotes = (notes) => {
    currentSession.value.roasterNotes = notes
  }

  const updateBrewSettings = (settings) => {
    currentSession.value.brewSettings = { ...currentSession.value.brewSettings, ...settings }
  }

  const updateExperimentalData = (data) => {
    currentSession.value.experimentalData = { ...currentSession.value.experimentalData, ...data }
  }

  const goToStep = (step) => {
    if (Object.values(TASTING_STEPS).includes(step)) {
      currentSession.value.currentStep = step
    }
  }

  const goToNextStep = () => {
    const steps = Object.values(TASTING_STEPS)
    const currentIndex = steps.indexOf(currentSession.value.currentStep)
    if (currentIndex < steps.length - 1) {
      currentSession.value.currentStep = steps[currentIndex + 1]
    }
  }

  const goToPreviousStep = () => {
    const steps = Object.values(TASTING_STEPS)
    const currentIndex = steps.indexOf(currentSession.value.currentStep)
    if (currentIndex > 0) {
      currentSession.value.currentStep = steps[currentIndex - 1]
    }
  }

  const completeTasting = async () => {
    try {
      isLoading.value = true
      error.value = null

      const tastingData = {
        mode: currentSession.value.mode,
        session_id: currentSession.value.id,
        coffee_info: currentSession.value.coffeeInfo,
        selected_flavors: currentSession.value.selectedFlavors,
        sensory_expressions: currentSession.value.sensoryExpressions,
        personal_comment: currentSession.value.personalComment,
        roaster_notes: currentSession.value.roasterNotes,
        brew_settings: isLabMode.value ? currentSession.value.brewSettings : null,
        experimental_data: isLabMode.value ? currentSession.value.experimentalData : null,
        total_duration: calculateSessionDuration(),
        sensory_skipped: !hasSensoryExpressions.value
      }

      const result = await saveTasting(tastingData)
      
      if (result.error) {
        throw new Error(result.error.message)
      }

      // 히스토리에 추가
      await loadTastingHistory()
      
      return result.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadTastingHistory = async (options = {}) => {
    try {
      isLoading.value = true
      const result = await getTastings(options)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      tastingHistory.value = result.data || []
      return result.data
    } catch (err) {
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  const calculateSessionDuration = () => {
    if (!currentSession.value.startTime) return 0
    const start = new Date(currentSession.value.startTime)
    const now = new Date()
    return Math.floor((now - start) / 1000) // 초 단위
  }

  const resetSession = () => {
    startNewSession(currentSession.value.mode)
  }

  const clearError = () => {
    error.value = null
  }

  // Helper function
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  return {
    // State
    currentSession,
    isLoading,
    error,
    tastingHistory,
    
    // Getters
    isLabMode,
    sessionProgress,
    canProceedToNext,
    hasSensoryExpressions,
    currentMatchScore,
    
    // Actions
    startNewSession,
    updateCoffeeInfo,
    addFlavor,
    removeFlavor,
    toggleFlavor,
    updateSensoryExpression,
    addSensoryExpression,
    removeSensoryExpression,
    updatePersonalComment,
    updateRoasterNotes,
    updateBrewSettings,
    updateExperimentalData,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeTasting,
    loadTastingHistory,
    resetSession,
    clearError
  }
})