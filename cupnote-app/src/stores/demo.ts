import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDemoStore = defineStore('demo', () => {
  // Demo mode state
  const isDemo = ref(false)
  const currentStep = ref(0)
  
  // Demo data for cafe mode
  const demoData = ref({
    mode: 'cafe',
    coffee_info: {
      cafe_name: '블루보틀 청담점',
      coffee_name: '에티오피아 구지 워시드',
      temperature: 'hot',
      origin: '에티오피아',
      variety: '헤이룸',
      process: '워시드',
      roast_level: '라이트 로스트',
      altitude: 2100
    },
    flavor_data: {
      selected_flavors: ['레몬', '블루베리', '재스민', '다크초콜릿']
    },
    sensory_expression: {
      acidity: ['상큼한', '밝은'],
      sweetness: ['달콤한', '캐러멜향의'],
      bitterness: [],
      body: ['가벼운', '부드러운'],
      aftertaste: ['깔끔한', '여운이 긴'],
      balance: ['조화로운', '균형잡힌']
    },
    personal_comment: {
      quick_tags: ['☀️ 아침에 마시기 좋아요', '✨ 산미가 매력적이에요', '😌 부드럽고 편안해요'],
      free_text: '블루베리와 레몬의 밝은 산미가 인상적이고, 재스민 향이 우아하게 느껴집니다. 아침에 마시기 정말 좋은 커피네요!'
    },
    roaster_notes: '에티오피아 구지 지역의 헤이룸 품종으로, 블루베리와 레몬의 밝은 산미, 재스민의 플로럴 향이 특징입니다. 라이트 로스팅으로 원두 본연의 향미를 살렸습니다.'
  })

  // Demo flow steps for cafe mode
  const demoSteps = [
    { name: 'mode-selection', path: '/demo', title: '모드 선택', progress: 0 },
    { name: 'coffee-info', path: '/demo/coffee-info', title: '커피 정보', progress: 25 },
    { name: 'unified-flavor', path: '/demo/unified-flavor', title: '향미 선택', progress: 50 },
    { name: 'sensory-expression', path: '/demo/sensory-expression', title: '감각 표현', progress: 70 },
    { name: 'personal-comment', path: '/demo/personal-comment', title: '개인 평가', progress: 85 },
    { name: 'roaster-notes', path: '/demo/roaster-notes', title: '로스터 노트', progress: 95 },
    { name: 'result', path: '/demo/result', title: '결과 확인', progress: 100 }
  ]

  // Computed
  const currentStepInfo = computed(() => demoSteps[currentStep.value])
  const progress = computed(() => currentStepInfo.value?.progress || 0)
  const isLastStep = computed(() => currentStep.value === demoSteps.length - 1)
  const isFirstStep = computed(() => currentStep.value === 0)

  // Actions
  const startDemo = () => {
    isDemo.value = true
    currentStep.value = 0
  }

  const endDemo = () => {
    isDemo.value = false
    currentStep.value = 0
  }

  const nextStep = () => {
    if (!isLastStep.value) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (!isFirstStep.value) {
      currentStep.value--
    }
  }

  const setStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < demoSteps.length) {
      currentStep.value = stepIndex
    }
  }

  const getNextStepPath = () => {
    if (isLastStep.value) return '/demo/result'
    return demoSteps[currentStep.value + 1]?.path || '/demo'
  }

  const getPrevStepPath = () => {
    if (isFirstStep.value) return '/'
    return demoSteps[currentStep.value - 1]?.path || '/demo'
  }

  // Demo guidance messages
  const getStepGuidance = (stepName: string) => {
    const guidance = {
      'mode-selection': {
        title: '🎯 데모 모드입니다',
        message: '카페모드를 선택하여 간편한 테이스팅 기록을 체험해보세요!'
      },
      'coffee-info': {
        title: '☕ 커피 정보를 확인하세요',
        message: '데모용 커피 정보가 미리 입력되어 있습니다. 실제 사용시에는 직접 입력하실 수 있어요!'
      },
      'unified-flavor': {
        title: '🍓 향미를 선택해보세요',
        message: '느껴지는 향과 맛을 선택해주세요. 최대 5개까지 선택할 수 있습니다!'
      },
      'sensory-expression': {
        title: '💭 감각을 표현해보세요',
        message: '각 카테고리별로 느낀 감각을 한국어 표현으로 선택해주세요!'
      },
      'personal-comment': {
        title: '✍️ 개인적인 평가를 남겨보세요',
        message: '퀵 태그와 자유 텍스트로 이 커피에 대한 생각을 기록해보세요!'
      },
      'roaster-notes': {
        title: '📝 로스터 노트를 확인하세요',
        message: '로스터가 의도한 향미와 여러분이 느낀 것을 비교해보세요!'
      },
      'result': {
        title: '🎉 테이스팅 완료!',
        message: '매치 스코어와 함께 테이스팅 결과를 확인해보세요!'
      }
    }
    return guidance[stepName] || { title: '데모 진행 중', message: '단계별로 체험해보세요!' }
  }

  return {
    // State
    isDemo,
    currentStep,
    demoData,
    demoSteps,
    
    // Computed
    currentStepInfo,
    progress,
    isLastStep,
    isFirstStep,
    
    // Actions
    startDemo,
    endDemo,
    nextStep,
    prevStep,
    setStep,
    getNextStepPath,
    getPrevStepPath,
    getStepGuidance
  }
})