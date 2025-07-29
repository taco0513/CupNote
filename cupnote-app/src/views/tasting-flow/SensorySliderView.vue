<template>
  <div class="sensory-slider-view">
    <!-- Header -->
    <header class="screen-header">
      <button class="back-btn" @click="$router.push('/sensory-expression')">
        ←
      </button>
      <h1 class="screen-title">감각 평가</h1>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: '86%' }"></div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <p class="description">
        커피의 각 특성을 1-5 스케일로 평가해주세요
      </p>

      <!-- Sensory Sliders -->
      <div class="sliders-container">
        <div
          v-for="attribute in sensoryAttributes"
          :key="attribute.id"
          class="slider-item"
        >
          <div class="slider-header">
            <div class="attribute-info">
              <span class="attribute-icon">{{ attribute.icon }}</span>
              <h3 class="attribute-name">{{ attribute.name }}</h3>
            </div>
            <div class="value-display">
              <span class="value-number">{{ sliderValues[attribute.id] }}</span>
              <span class="value-label">{{ getValueLabel(attribute.id, sliderValues[attribute.id]) }}</span>
            </div>
          </div>

          <div class="slider-body">
            <div class="slider-wrapper">
              <input
                v-model="sliderValues[attribute.id]"
                type="range"
                min="1"
                max="5"
                step="1"
                class="sensory-slider"
                :style="{ '--value': ((sliderValues[attribute.id] - 1) / 4) * 100 + '%' }"
              />
              <div class="slider-ticks">
                <span v-for="n in 5" :key="n" class="tick">{{ n }}</span>
              </div>
            </div>
            <div class="slider-labels">
              <span class="label-min">{{ attribute.minLabel }}</span>
              <span class="label-max">{{ attribute.maxLabel }}</span>
            </div>
          </div>

          <p class="attribute-description">{{ attribute.description }}</p>
        </div>
      </div>

      <!-- Overall Score -->
      <section class="overall-section">
        <h2 class="overall-title">종합 평가</h2>
        <div class="overall-score">
          <div class="score-circle">
            <span class="score-value">{{ overallScore }}</span>
            <span class="score-max">/5</span>
          </div>
          <p class="score-description">{{ getOverallDescription(overallScore) }}</p>
        </div>
      </section>

      <!-- Quick Notes -->
      <section class="notes-section">
        <h3 class="notes-title">빠른 메모</h3>
        <textarea
          v-model="quickNotes"
          placeholder="특별히 기억에 남는 감각이나 인상..."
          class="notes-textarea"
          rows="3"
        ></textarea>
      </section>
    </main>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/sensory-expression')">
        이전
      </button>
      <button type="button" class="btn-primary" @click="handleNext">
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// Sensory attributes
const sensoryAttributes = [
  {
    id: 'acidity',
    name: '산미',
    icon: '🍋',
    minLabel: '약함',
    maxLabel: '강함',
    description: '신맛의 강도와 질',
    labels: ['약함', '보통', '적당', '선명', '강함']
  },
  {
    id: 'sweetness',
    name: '단맛',
    icon: '🍯',
    minLabel: '약함',
    maxLabel: '강함',
    description: '달콤함의 정도와 질',
    labels: ['약함', '보통', '적당', '선명', '강함']
  },
  {
    id: 'bitterness',
    name: '쓴맛',
    icon: '🌿',
    minLabel: '약함',
    maxLabel: '강함',
    description: '쓴맛의 강도와 특성',
    labels: ['약함', '보통', '적당', '선명', '강함']
  },
  {
    id: 'body',
    name: '바디',
    icon: '💪',
    minLabel: '가볍',
    maxLabel: '무겁',
    description: '입 안에서의 무게감',
    labels: ['가볍', '약간 가볍', '보통', '약간 무겁', '무겁']
  },
  {
    id: 'aftertaste',
    name: '여운',
    icon: '✨',
    minLabel: '짧음',
    maxLabel: '김',
    description: '마신 후 남는 맛',
    labels: ['짧음', '약간 짧음', '보통', '약간 김', '김']
  },
  {
    id: 'balance',
    name: '균형',
    icon: '⚖️',
    minLabel: '불균형',
    maxLabel: '완벽',
    description: '전체적인 맛의 조화',
    labels: ['불균형', '약간 불균형', '보통', '좋음', '완벽']
  }
]

// State
const sliderValues = ref({
  acidity: 3,
  sweetness: 3,
  bitterness: 3,
  body: 3,
  aftertaste: 3,
  balance: 3
})

const quickNotes = ref('')

// Computed
const overallScore = computed(() => {
  const values = Object.values(sliderValues.value)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return (sum / values.length).toFixed(1)
})

// Methods
const getValueLabel = (attributeId, value) => {
  const attribute = sensoryAttributes.find(attr => attr.id === attributeId)
  return attribute ? attribute.labels[value - 1] : ''
}

const getOverallDescription = (score) => {
  const numScore = parseFloat(score)
  if (numScore >= 4.5) return '탁월한 커피입니다!'
  if (numScore >= 4.0) return '매우 훌륭한 커피입니다'
  if (numScore >= 3.5) return '좋은 커피입니다'
  if (numScore >= 3.0) return '괜찮은 커피입니다'
  if (numScore >= 2.5) return '보통 수준의 커피입니다'
  return '개선이 필요한 커피입니다'
}

const handleNext = () => {
  // Save sensory slider data to store
  const sensorySliderData = {
    ratings: { ...sliderValues.value },
    overall_score: parseFloat(overallScore.value),
    quick_notes: quickNotes.value
  }
  
  coffeeRecordStore.updateCoffeeSetup({
    ...coffeeRecordStore.currentSession,
    sensorySliderData: sensorySliderData
  })
  
  // Navigate to personal comment
  router.push('/personal-comment')
}
</script>

<style scoped>
.sensory-slider-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.screen-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-top: 2rem;
}

.back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #7C5842;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(124, 88, 66, 0.1);
}

.screen-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.progress-bar {
  max-width: 300px;
  height: 4px;
  background: #E8D5C4;
  border-radius: 2px;
  margin: 1rem auto 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #7C5842;
  transition: width 0.3s ease;
}

/* Content */
.content {
  margin-bottom: 2rem;
}

.description {
  text-align: center;
  color: #A0796A;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Sliders Container */
.sliders-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.slider-item {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

/* Slider Header */
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.attribute-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attribute-icon {
  font-size: 1.5rem;
}

.attribute-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.value-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.value-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7C5842;
}

.value-label {
  font-size: 0.9rem;
  color: #A0796A;
}

/* Slider Body */
.slider-body {
  margin-bottom: 0.75rem;
}

.slider-wrapper {
  position: relative;
  margin-bottom: 0.5rem;
}

.sensory-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #E8D5C4;
  border-radius: 4px;
  outline: none;
  position: relative;
}

.sensory-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  background: #7C5842;
  border: 4px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.3);
  transition: all 0.2s ease;
}

.sensory-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(124, 88, 66, 0.4);
}

/* Slider background fill */
.sensory-slider {
  background: linear-gradient(
    to right,
    #7C5842 0%,
    #7C5842 var(--value),
    #E8D5C4 var(--value),
    #E8D5C4 100%
  );
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 14px;
  margin-top: 8px;
}

.tick {
  font-size: 0.75rem;
  color: #A0796A;
  font-weight: 500;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #A0796A;
  font-style: italic;
}

.attribute-description {
  font-size: 0.9rem;
  color: #A0796A;
  margin: 0;
  text-align: center;
}

/* Overall Section */
.overall-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  text-align: center;
}

.overall-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1.5rem;
}

.overall-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #7C5842 0%, #A0796A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.3);
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.score-max {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.score-description {
  font-size: 1.1rem;
  color: #7C5842;
  font-weight: 500;
  margin: 0;
}

/* Notes Section */
.notes-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

.notes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.notes-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.notes-textarea:focus {
  outline: none;
  border-color: #7C5842;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  position: sticky;
  bottom: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 -2px 10px rgba(124, 88, 66, 0.1);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: #7C5842;
  color: white;
  border: 2px solid #7C5842;
}

.btn-primary:hover {
  background: #5D3F2E;
  border-color: #5D3F2E;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover {
  border-color: #D4B896;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .slider-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .value-display {
    align-self: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>