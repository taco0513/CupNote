<template>
  <div class="pro-mode-stepper">
    <!-- Progress Header -->
    <div class="stepper-header">
      <h2 class="stepper-title">🎯 Pro Mode - SCA Cupping Protocol</h2>
      <div class="stepper-progress">
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ currentStepIndex + 1 }} / {{ steps.length }}</span>
      </div>
    </div>

    <!-- Steps Navigation -->
    <div class="steps-nav">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="{
          'active': index === currentStepIndex,
          'completed': index < currentStepIndex,
          'upcoming': index > currentStepIndex
        }"
        @click="navigateToStep(index)"
      >
        <div class="step-circle">
          <span v-if="index < currentStepIndex" class="step-check">✓</span>
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <!-- Current Step Content -->
    <div class="step-content">
      <transition name="fade-slide" mode="out-in">
        <div :key="currentStep.id" class="step-panel">
          <div class="step-header">
            <span class="step-icon">{{ currentStep.icon }}</span>
            <h3 class="step-title">{{ currentStep.title }}</h3>
          </div>
          
          <div class="step-description">
            {{ currentStep.description }}
          </div>

          <!-- Step-specific instructions -->
          <div v-if="currentStep.instructions" class="step-instructions">
            <h4 class="instructions-title">📋 가이드라인</h4>
            <ul class="instructions-list">
              <li 
                v-for="(instruction, idx) in currentStep.instructions" 
                :key="idx"
                class="instruction-item"
              >
                {{ instruction }}
              </li>
            </ul>
          </div>

          <!-- Timer for time-sensitive steps -->
          <div v-if="currentStep.timer" class="step-timer">
            <div class="timer-display" :class="{ 'timer-active': timerRunning }">
              <span class="timer-icon">⏱️</span>
              <span class="timer-value">{{ formatTime(timerValue) }}</span>
            </div>
            <div class="timer-controls">
              <button 
                class="timer-btn"
                @click="startTimer"
                :disabled="timerRunning"
              >
                시작
              </button>
              <button 
                class="timer-btn"
                @click="pauseTimer"
                :disabled="!timerRunning"
              >
                일시정지
              </button>
              <button 
                class="timer-btn"
                @click="resetTimer"
              >
                리셋
              </button>
            </div>
          </div>

          <!-- Tips and best practices -->
          <div v-if="currentStep.tips" class="step-tips">
            <h4 class="tips-title">💡 Pro Tips</h4>
            <div 
              v-for="(tip, idx) in currentStep.tips" 
              :key="idx"
              class="tip-item"
            >
              <span class="tip-icon">{{ tip.icon }}</span>
              <span class="tip-text">{{ tip.text }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Navigation Controls -->
    <div class="stepper-controls">
      <button 
        class="control-btn prev"
        @click="previousStep"
        :disabled="currentStepIndex === 0"
      >
        <span class="btn-icon">←</span>
        <span class="btn-text">이전 단계</span>
      </button>
      
      <button 
        class="control-btn skip"
        @click="skipToEvaluation"
        v-if="currentStepIndex < evaluationStepIndex"
      >
        <span class="btn-text">평가로 건너뛰기</span>
      </button>
      
      <button 
        class="control-btn next"
        @click="nextStep"
        :disabled="currentStepIndex === steps.length - 1"
      >
        <span class="btn-text">다음 단계</span>
        <span class="btn-icon">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['step-complete', 'timer-update'])

// Step definitions
const steps = [
  {
    id: 'preparation',
    label: '준비',
    icon: '🧪',
    title: '샘플 준비',
    description: 'SCA 기준에 따른 커핑 샘플 준비',
    instructions: [
      '원두 8.25g (±0.25g)을 150ml 물에 사용',
      '분쇄도: 중간-굵게 (20 mesh 체로 70-75% 통과)',
      '물 온도: 93°C (±1°C)',
      '컵은 깨끗하고 무취여야 함'
    ],
    tips: [
      { icon: '⚖️', text: '정확한 계량이 일관된 결과의 핵심입니다' },
      { icon: '🌡️', text: '물 온도는 추출 직전에 확인하세요' }
    ]
  },
  {
    id: 'fragrance',
    label: '향기',
    icon: '👃',
    title: '건조 향기 평가',
    description: '분쇄 직후 건조 상태의 향기를 평가합니다',
    timer: true,
    instructions: [
      '분쇄 후 15분 이내 평가',
      '컵을 가볍게 흔들어 향을 맡습니다',
      '향의 강도와 품질을 기록합니다'
    ]
  },
  {
    id: 'infusion',
    label: '추출',
    icon: '💧',
    title: '물 붓기',
    description: '정확한 양의 뜨거운 물을 부어 추출을 시작합니다',
    timer: true,
    instructions: [
      '93°C 물을 컵 가장자리까지 붓습니다',
      '모든 원두가 젖도록 합니다',
      '4분간 추출합니다'
    ]
  },
  {
    id: 'crust-break',
    label: '크러스트',
    icon: '🥄',
    title: '크러스트 브레이킹',
    description: '3-5분 후 표면의 크러스트를 깨뜨리며 향을 평가합니다',
    timer: true,
    instructions: [
      '숟가락으로 표면을 3번 저어 크러스트를 깹니다',
      '코를 가까이 대고 향을 평가합니다',
      '표면의 거품과 부유물을 제거합니다'
    ],
    tips: [
      { icon: '👃', text: '크러스트를 깰 때 나는 향이 가장 강렬합니다' },
      { icon: '🥄', text: '숟가락은 각 샘플마다 깨끗이 헹궈 사용하세요' }
    ]
  },
  {
    id: 'tasting',
    label: '시음',
    icon: '☕',
    title: '맛 평가',
    description: '8-10분 후 시음을 시작하여 다양한 온도에서 평가합니다',
    instructions: [
      '숟가락으로 떠서 후루룩 소리내며 시음',
      '입 전체에 퍼뜨려 맛을 평가',
      '온도가 내려가면서 변화를 관찰'
    ]
  },
  {
    id: 'scoring',
    label: '점수',
    icon: '📊',
    title: '최종 평가',
    description: 'SCA 평가 항목별로 점수를 매깁니다',
    instructions: [
      '각 항목을 6-10점 스케일로 평가',
      '결점이 있다면 감점',
      '총점 계산 및 기록'
    ]
  }
]

// State
const currentStepIndex = ref(0)
const timerValue = ref(0)
const timerRunning = ref(false)
let timerInterval = null

// Computed
const currentStep = computed(() => steps[currentStepIndex.value])
const progressPercentage = computed(() => ((currentStepIndex.value + 1) / steps.length) * 100)
const evaluationStepIndex = computed(() => steps.findIndex(s => s.id === 'tasting'))

// Methods
const navigateToStep = (index) => {
  if (index < currentStepIndex.value || index === currentStepIndex.value + 1) {
    currentStepIndex.value = index
    resetTimer()
  }
}

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) {
    emit('step-complete', currentStep.value.id)
    currentStepIndex.value++
    resetTimer()
    
    // Navigate to appropriate route based on step
    if (currentStep.value.id === 'scoring') {
      router.push('/sensory-slider')
    }
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    resetTimer()
  }
}

const skipToEvaluation = () => {
  currentStepIndex.value = evaluationStepIndex.value
  resetTimer()
}

// Timer functions
const startTimer = () => {
  if (!timerRunning.value) {
    timerRunning.value = true
    timerInterval = setInterval(() => {
      timerValue.value++
      emit('timer-update', timerValue.value)
    }, 1000)
  }
}

const pauseTimer = () => {
  timerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timerValue.value = 0
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Cleanup
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.pro-mode-stepper {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-4);
}

/* Header */
.stepper-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.stepper-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.stepper-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.progress-track {
  width: 200px;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width var(--transition-slow);
}

.progress-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

/* Steps Navigation */
.steps-nav {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-8);
  overflow-x: auto;
  padding: var(--space-2);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-2);
  transition: all var(--transition-base);
  min-width: 80px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  transition: all var(--transition-base);
  border: 3px solid var(--border-color);
  background: var(--bg-card);
}

.step-item.completed .step-circle {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.step-item.active .step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.step-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
}

.step-item.active .step-label {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

/* Step Content */
.step-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-6);
}

.step-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.step-icon {
  font-size: var(--text-3xl);
}

.step-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.step-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* Instructions */
.step-instructions {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.instructions-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.instruction-item {
  padding-left: var(--space-6);
  position: relative;
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.instruction-item::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
  font-weight: var(--font-bold);
}

/* Timer */
.step-timer {
  background: var(--gradient-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}

.timer-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.timer-display.timer-active {
  color: var(--color-primary);
}

.timer-controls {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.timer-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.timer-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--color-primary);
}

.timer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tips */
.step-tips {
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--color-accent);
}

.tips-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  margin-bottom: var(--space-3);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.tip-icon {
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.tip-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* Controls */
.stepper-controls {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.control-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.skip {
  background: var(--bg-secondary);
  border-color: var(--border-color-light);
  color: var(--text-secondary);
}

.control-btn.skip:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .steps-nav {
    justify-content: flex-start;
  }
  
  .step-item {
    min-width: 70px;
  }
  
  .stepper-controls {
    flex-wrap: wrap;
  }
  
  .control-btn {
    flex: 1;
    min-width: 120px;
  }
  
  .control-btn.skip {
    order: 3;
    flex-basis: 100%;
  }
}
</style>