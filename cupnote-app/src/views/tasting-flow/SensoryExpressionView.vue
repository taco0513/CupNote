<template>
  <div class="sensory-expression-view">
    <!-- Header -->
    <header class="sensory-header">
      <h1 class="sensory-title">👅 감각으로 표현해주세요</h1>
      <p class="sensory-subtitle">입 안에서 느껴지는 감각을 선택해주세요 (선택사항)</p>
    </header>

    <!-- Progress Indicator -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <p class="progress-text">{{ completedCategories }}/{{ totalCategories }} 완료</p>
    </div>

    <!-- Sensory Categories -->
    <section class="categories-section">
      <div class="sensory-categories">
        <div v-for="category in sensoryCategories" :key="category.id" class="sensory-category">
          <div class="category-header">
            <div class="category-info">
              <span class="category-icon">{{ category.icon }}</span>
              <h3 class="category-title">{{ category.name }}</h3>
              <span class="category-description">{{ category.description }}</span>
            </div>
            <div class="category-status">
              <span v-if="selectedExpressions[category.id]" class="selected-indicator">✓</span>
            </div>
          </div>

          <div class="expressions-grid">
            <button
              v-for="expression in category.expressions"
              :key="expression.id"
              :class="[
                'expression-btn',
                {
                  selected: selectedExpressions[category.id]?.id === expression.id,
                  'has-selection': selectedExpressions[category.id],
                },
              ]"
              @click="selectExpression(category.id, expression)"
            >
              <span class="expression-text">{{ expression.text }}</span>
              <span class="expression-description">{{ expression.description }}</span>
            </button>
          </div>

          <!-- Clear Selection Button -->
          <div v-if="selectedExpressions[category.id]" class="clear-section">
            <button @click="clearSelection(category.id)" class="clear-selection-btn">
              선택 해제
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Selected Summary -->
    <section class="summary-section">
      <div class="summary-card">
        <h3 class="summary-title">선택한 감각 표현</h3>
        <div class="selected-expressions">
          <div
            v-for="(expression, categoryId) in selectedExpressions"
            :key="categoryId"
            class="selected-expression-item"
          >
            <span class="selected-category">{{ getCategoryName(categoryId) }}</span>
            <span class="selected-text">{{ expression.text }}</span>
          </div>
          <div v-if="Object.keys(selectedExpressions).length === 0" class="no-selections">
            아직 선택한 감각 표현이 없습니다
          </div>
        </div>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <div class="help-card">
        <h4 class="help-title">💡 감각 표현 가이드</h4>
        <ul class="help-list">
          <li><strong>산미</strong>: 입 안에서 느끼는 신맛의 정도와 특성</li>
          <li><strong>단맛</strong>: 혀끝에서 느끼는 달콤함의 종류</li>
          <li><strong>바디</strong>: 입 안에서 느끼는 무게감과 질감</li>
          <li><strong>여운</strong>: 삼킨 후 입 안에 남는 뒷맛</li>
        </ul>
        <p class="help-note">
          모든 카테고리를 선택할 필요는 없어요. 확실히 느껴지는 것만 선택해주세요.
        </p>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.go(-1)">이전</button>
      <button type="button" class="btn-primary" @click="handleNext">다음 단계</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// State
const selectedExpressions = ref({})

// Sensory Categories Data
const sensoryCategories = ref([
  {
    id: 'acidity',
    name: '산미',
    icon: '🍋',
    description: '신맛의 정도와 특성',
    expressions: [
      {
        id: 'bright',
        text: '밝고 상큼한',
        description: '레몬이나 라임 같은 밝은 산미',
      },
      {
        id: 'mild',
        text: '부드럽고 은은한',
        description: '사과나 배 같은 온화한 산미',
      },
      {
        id: 'sharp',
        text: '톡 쏘는',
        description: '시트러스 같은 강한 산미',
      },
      {
        id: 'wine-like',
        text: '와인 같은',
        description: '발효된 과일 같은 복합적 산미',
      },
    ],
  },
  {
    id: 'sweetness',
    name: '단맛',
    icon: '🍯',
    description: '달콤함의 종류와 정도',
    expressions: [
      {
        id: 'caramel',
        text: '캐러멜 같은',
        description: '구운 설탕의 진한 단맛',
      },
      {
        id: 'honey',
        text: '꿀 같은',
        description: '부드럽고 자연스러운 단맛',
      },
      {
        id: 'chocolate',
        text: '초콜릿 같은',
        description: '진하고 달콤한 카카오 단맛',
      },
      {
        id: 'fruity-sweet',
        text: '과일 같은',
        description: '신선한 과일의 상큼한 단맛',
      },
    ],
  },
  {
    id: 'body',
    name: '바디',
    icon: '💪',
    description: '무게감과 질감',
    expressions: [
      {
        id: 'light',
        text: '가볍고 깔끔한',
        description: '물처럼 가벼운 질감',
      },
      {
        id: 'medium',
        text: '적당히 묵직한',
        description: '우유처럼 부드러운 질감',
      },
      {
        id: 'full',
        text: '진하고 무거운',
        description: '크림처럼 진한 질감',
      },
      {
        id: 'silky',
        text: '부드럽고 실키한',
        description: '실크처럼 부드러운 질감',
      },
    ],
  },
  {
    id: 'aftertaste',
    name: '여운',
    icon: '✨',
    description: '삼킨 후 남는 뒷맛',
    expressions: [
      {
        id: 'clean',
        text: '깔끔하게 마무리',
        description: '뒷맛이 깔끔하고 상쾌함',
      },
      {
        id: 'lingering',
        text: '오래 남는',
        description: '좋은 맛이 오랫동안 지속됨',
      },
      {
        id: 'sweet-finish',
        text: '달콤한 마무리',
        description: '단맛으로 마무리되는 여운',
      },
      {
        id: 'complex',
        text: '복합적인',
        description: '여러 맛이 복합적으로 나타남',
      },
    ],
  },
])

// Computed
const totalCategories = computed(() => sensoryCategories.value.length)
const completedCategories = computed(() => Object.keys(selectedExpressions.value).length)
const progressPercentage = computed(() => (completedCategories.value / totalCategories.value) * 100)

// Methods
const selectExpression = (categoryId, expression) => {
  // If same expression is clicked, deselect it
  if (selectedExpressions.value[categoryId]?.id === expression.id) {
    delete selectedExpressions.value[categoryId]
  } else {
    // Select new expression
    selectedExpressions.value[categoryId] = expression
  }
}

const clearSelection = (categoryId) => {
  delete selectedExpressions.value[categoryId]
}

const getCategoryName = (categoryId) => {
  const category = sensoryCategories.value.find((cat) => cat.id === categoryId)
  return category ? category.name : categoryId
}

const handleNext = () => {
  // Convert selected expressions to array format for storage
  const sensoryArray = []

  Object.entries(selectedExpressions.value).forEach(([categoryId, expression]) => {
    sensoryArray.push({
      id: expression.id,
      category: getCategoryName(categoryId),
      text: expression.text,
    })
  })

  // Save to store
  tastingSessionStore.updateSensoryExpression(sensoryArray)

  console.log('Sensory expressions saved:', sensoryArray)

  // Get current mode from store
  const currentMode = tastingSessionStore.currentSession.mode || 'homecafe'

  // Navigate based on mode
  if (currentMode === 'pro') {
    router.push('/sensory-slider')
  } else {
    router.push('/personal-comment')
  }
}
</script>

<style scoped>
.sensory-expression-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
  min-height: 100vh;
}

/* Header */
.sensory-header {
  text-align: center;
  margin-bottom: 2rem;
}

.sensory-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.sensory-subtitle {
  color: #a0796a;
  font-size: 1.1rem;
}

/* Progress Section */
.progress-section {
  margin-bottom: 2rem;
  text-align: center;
}

.progress-bar {
  background: #e8d5c4;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, #7c5842 0%, #a0796a 100%);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #a0796a;
  font-size: 0.9rem;
  margin: 0;
}

/* Categories Section */
.categories-section {
  margin-bottom: 2rem;
}

.sensory-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sensory-category {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

/* Category Header */
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f4f0;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.category-icon {
  font-size: 1.5rem;
}

.category-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0;
}

.category-description {
  color: #a0796a;
  font-size: 0.9rem;
  font-style: italic;
}

.category-status {
  display: flex;
  align-items: center;
}

.selected-indicator {
  background: #7c5842;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Expressions Grid */
.expressions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.expression-btn {
  background: white;
  border: 2px solid #e8d5c4;
  border-radius: 12px;
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.expression-btn:hover {
  border-color: #d4b896;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.15);
}

.expression-btn.selected {
  border-color: #7c5842;
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.3);
}

.expression-btn.has-selection:not(.selected) {
  opacity: 0.6;
  transform: none;
}

.expression-btn.has-selection:not(.selected):hover {
  opacity: 0.8;
}

.expression-text {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
}

.expression-description {
  font-size: 0.85rem;
  opacity: 0.8;
  line-height: 1.4;
}

.expression-btn.selected .expression-description {
  opacity: 0.9;
}

/* Clear Selection */
.clear-section {
  text-align: center;
  margin-top: 0.5rem;
}

.clear-selection-btn {
  background: none;
  border: 1px solid #e8d5c4;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #a0796a;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-selection-btn:hover {
  border-color: #d4b896;
  background: #f8f4f0;
}

/* Summary Section */
.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}

.selected-expressions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-expression-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f4f0;
  border-radius: 8px;
  border: 1px solid #f0e8dc;
}

.selected-category {
  font-weight: 600;
  color: #7c5842;
  min-width: 60px;
}

.selected-text {
  color: #666;
  flex: 1;
}

.no-selections {
  text-align: center;
  color: #a0796a;
  font-style: italic;
  padding: 1.5rem;
}

/* Help Section */
.help-section {
  margin-bottom: 2rem;
}

.help-card {
  background: #fff8f0;
  border: 1px solid #f0e8dc;
  border-radius: 12px;
  padding: 1.5rem;
}

.help-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}

.help-list {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.help-note {
  color: #a0796a;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
  text-align: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f0e8dc;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e8d5c4;
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
  background: #7c5842;
  color: white;
  border: 2px solid #7c5842;
}

.btn-primary:hover {
  background: #5d3f2e;
  border-color: #5d3f2e;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #7c5842;
  border: 2px solid #e8d5c4;
}

.btn-secondary:hover {
  border-color: #d4b896;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sensory-expression-view {
    padding: 0.5rem;
  }

  .sensory-title {
    font-size: 1.5rem;
  }

  .sensory-category {
    padding: 1rem;
  }

  .expressions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .expression-btn {
    padding: 0.875rem;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .category-info {
    width: 100%;
  }

  .category-status {
    align-self: flex-end;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .category-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .category-title {
    font-size: 1.1rem;
  }

  .selected-expression-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .selected-category {
    min-width: auto;
    font-size: 0.9rem;
  }
}
</style>
