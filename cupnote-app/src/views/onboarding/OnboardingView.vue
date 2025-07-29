<template>
  <div class="onboarding-view">
    <div class="onboarding-container">
      <!-- 헤더 -->
      <header class="onboarding-header">
        <div class="logo-section">
          <div class="app-logo">☕</div>
          <h1 class="app-title">CupNote</h1>
          <p class="app-subtitle">나의 커피 감각 저널</p>
        </div>
      </header>

      <!-- 온보딩 단계 -->
      <div class="onboarding-steps">
        <div v-for="(step, index) in onboardingSteps" :key="index" 
             :class="['step-card', { active: currentStep === index }]">
          
          <div class="step-icon">{{ step.icon }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
          
          <div v-if="step.features" class="step-features">
            <div v-for="feature in step.features" :key="feature" class="feature-item">
              <span class="feature-bullet">•</span>
              <span>{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 네비게이션 -->
      <div class="onboarding-navigation">
        <BaseButton 
          v-if="currentStep > 0"
          variant="outline" 
          @click="previousStep"
        >
          이전
        </BaseButton>
        
        <div class="step-indicators">
          <div v-for="(_, index) in onboardingSteps" :key="index"
               :class="['step-dot', { active: currentStep === index }]">
          </div>
        </div>
        
        <BaseButton 
          v-if="currentStep < onboardingSteps.length - 1"
          @click="nextStep"
        >
          다음
        </BaseButton>
        
        <BaseButton 
          v-else
          @click="startTasting"
          size="large"
        >
          시작하기
        </BaseButton>
      </div>

      <!-- 모드 선택 (마지막 단계) -->
      <div v-if="currentStep === onboardingSteps.length - 1" class="mode-selection">
        <h3>테이스팅 모드를 선택하세요</h3>
        <div class="mode-cards">
          <div v-for="mode in tastingModes" :key="mode.value"
               :class="['mode-card', { selected: selectedMode === mode.value }]"
               @click="selectedMode = mode.value">
            <div class="mode-icon">{{ mode.icon }}</div>
            <h4>{{ mode.label }}</h4>
            <p>{{ mode.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useTastingStore } from '@/stores/tasting'
import { TASTING_MODES, TASTING_MODE_LABELS } from '@/constants/tasting'

const router = useRouter()
const tastingStore = useTastingStore()

const currentStep = ref(0)
const selectedMode = ref(TASTING_MODES.CAFE)

const onboardingSteps = [
  {
    icon: '👋',
    title: 'CupNote에 오신 걸 환영합니다!',
    description: '커피의 향미와 감각을 기록하고 분석하는 개인 맞춤 커피 저널입니다.',
    features: [
      '체계적인 테이스팅 노트 작성',
      '개인화된 매치 스코어 분석',
      '커피 경험 기록 및 관리'
    ]
  },
  {
    icon: '📝',
    title: '테이스팅 노트 작성',
    description: '단계별 가이드를 통해 쉽고 정확하게 커피를 평가해보세요.',
    features: [
      '향미 선택 (딸기, 초콜릿, 견과류 등)',
      '감각 표현 (산미, 단맛, 바디 등)',
      '개인적인 코멘트 추가'
    ]
  },
  {
    icon: '🎯',
    title: '매치 스코어 분석',
    description: '로스터 노트와 비교해서 나만의 매치 스코어를 확인하세요.',
    features: [
      '향미 일치도 분석',
      '감각 표현 매칭',
      '개인화된 점수 시스템'
    ]
  },
  {
    icon: '📊',
    title: '커피 여정 추적',
    description: '시간이 지나면서 변화하는 나의 커피 취향을 발견해보세요.',
    features: [
      '테이스팅 히스토리 관리',
      '선호도 패턴 분석',
      '커피 발견 기록'
    ]
  }
]

const tastingModes = [
  {
    value: TASTING_MODES.CAFE,
    label: TASTING_MODE_LABELS[TASTING_MODES.CAFE],
    icon: '☕',
    description: '카페에서 마시는 커피를 간단히 기록'
  },
  {
    value: TASTING_MODES.HOMECAFE,
    label: TASTING_MODE_LABELS[TASTING_MODES.HOMECAFE],
    icon: '🏠',
    description: '집에서 내린 커피를 자세히 분석'
  },
  {
    value: TASTING_MODES.LAB,
    label: TASTING_MODE_LABELS[TASTING_MODES.LAB],
    icon: '🔬',
    description: '전문적인 커핑과 실험 데이터 기록'
  }
]

const nextStep = () => {
  if (currentStep.value < onboardingSteps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const startTasting = () => {
  tastingStore.startNewSession(selectedMode.value)
  router.push('/tasting')
}
</script>

<style scoped>
.onboarding-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.onboarding-container {
  max-width: 600px;
  width: 100%;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(124, 88, 66, 0.1);
}

.app-logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  font-size: 1.125rem;
  color: #A0796A;
  margin: 0;
}

.onboarding-steps {
  margin-bottom: 3rem;
}

.step-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  display: none;
  text-align: center;
}

.step-card.active {
  display: block;
  animation: fadeIn 0.5s ease-in-out;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.step-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.step-features {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.feature-bullet {
  color: #7C5842;
  font-weight: bold;
  margin-right: 0.5rem;
}

.onboarding-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.step-indicators {
  display: flex;
  gap: 0.5rem;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E8DDD0;
  transition: all 0.2s ease;
}

.step-dot.active {
  background: #7C5842;
  transform: scale(1.2);
}

.mode-selection {
  margin-top: 2rem;
  text-align: center;
}

.mode-selection h3 {
  color: #7C5842;
  margin-bottom: 1.5rem;
}

.mode-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.mode-card {
  background: white;
  border: 2px solid #E8DDD0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.mode-card:hover {
  border-color: #A0796A;
  transform: translateY(-2px);
}

.mode-card.selected {
  border-color: #7C5842;
  background: #FFF8F0;
}

.mode-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.mode-card h4 {
  color: #7C5842;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.mode-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .mode-cards {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .onboarding-navigation {
    padding: 0 2rem;
  }
}
</style>