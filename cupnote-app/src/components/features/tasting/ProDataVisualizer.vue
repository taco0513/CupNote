<template>
  <div class="pro-data-visualizer">
    <!-- Sensory Spider Chart -->
    <div class="chart-section">
      <h3 class="section-title">🕷️ 감각 평가 차트</h3>
      <div class="spider-chart-container">
        <canvas ref="spiderCanvas" width="300" height="300"></canvas>
        <div class="spider-legend">
          <div v-for="(item, key) in sensoryData" :key="key" class="legend-item">
            <span class="legend-dot" :style="{ background: getColorForScore(item) }"></span>
            <span class="legend-label">{{ getSensoryLabel(key) }}</span>
            <span class="legend-value">{{ item.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Flavor Wheel Mini -->
    <div class="chart-section">
      <h3 class="section-title">🎨 플레이버 분포</h3>
      <div class="flavor-wheel-mini">
        <div
          v-for="category in flavorCategories"
          :key="category.id"
          class="flavor-category"
          :style="{ background: category.color }"
        >
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ category.count }}</span>
        </div>
      </div>
    </div>

    <!-- Extraction Analytics -->
    <div class="chart-section">
      <h3 class="section-title">📈 추출 분석</h3>
      <div class="analytics-grid">
        <div class="analytic-card">
          <span class="analytic-label">추출 강도</span>
          <div class="strength-meter">
            <div
              class="strength-fill"
              :style="{ width: extractionStrength + '%' }"
              :class="strengthClass"
            ></div>
          </div>
          <span class="analytic-value">{{ extractionStrengthLabel }}</span>
        </div>

        <div class="analytic-card">
          <span class="analytic-label">균형도</span>
          <div class="balance-chart">
            <div class="balance-bar acidity" :style="{ height: acidityLevel + '%' }">
              <span class="bar-label">산미</span>
            </div>
            <div class="balance-bar sweetness" :style="{ height: sweetnessLevel + '%' }">
              <span class="bar-label">단맛</span>
            </div>
            <div class="balance-bar bitterness" :style="{ height: bitternessLevel + '%' }">
              <span class="bar-label">쓴맛</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Score Breakdown -->
    <div class="chart-section">
      <h3 class="section-title">🏆 점수 분석</h3>
      <div class="score-breakdown">
        <div class="total-score">
          <span class="score-label">총점</span>
          <span class="score-value">{{ totalScore.toFixed(2) }}</span>
          <span class="score-grade">{{ getGrade(totalScore) }}</span>
        </div>

        <div class="score-components">
          <div v-for="component in scoreComponents" :key="component.name" class="score-component">
            <div class="component-header">
              <span class="component-name">{{ component.name }}</span>
              <span class="component-score">{{ component.score }}/{{ component.max }}</span>
            </div>
            <div class="component-bar">
              <div
                class="component-fill"
                :style="{
                  width: (component.score / component.max) * 100 + '%',
                  background: component.color,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  sensorySliderData: {
    type: Object,
    default: () => ({}),
  },
  selectedFlavors: {
    type: Array,
    default: () => [],
  },
  tds: {
    type: Number,
    default: null,
  },
  extractionYield: {
    type: Number,
    default: null,
  },
})

const spiderCanvas = ref(null)

// Sensory data processing
const sensoryData = computed(() => {
  const ratings = props.sensorySliderData?.ratings || {}
  return {
    fragrance_aroma: ratings.fragrance_aroma || 0,
    flavor: ratings.flavor || 0,
    aftertaste: ratings.aftertaste || 0,
    acidity: ratings.acidity || 0,
    body: ratings.body || 0,
    balance: ratings.balance || 0,
    uniformity: ratings.uniformity || 0,
    clean_cup: ratings.clean_cup || 0,
    sweetness: ratings.sweetness || 0,
  }
})

// Flavor categories
const flavorCategories = computed(() => {
  const categoryMap = new Map()

  // Predefined categories with colors
  const categories = [
    { id: 'fruity', name: '과일', color: '#FF6B6B' },
    { id: 'floral', name: '꽃', color: '#F06292' },
    { id: 'sweet', name: '달콤', color: '#FFB74D' },
    { id: 'nutty', name: '견과', color: '#8D6E63' },
    { id: 'spices', name: '향신료', color: '#A1887F' },
    { id: 'roasted', name: '로스팅', color: '#6D4C41' },
    { id: 'other', name: '기타', color: '#90A4AE' },
  ]

  // Count flavors by category
  props.selectedFlavors.forEach((flavor) => {
    // Simple category detection based on flavor id
    let categoryId = 'other'
    if (flavor.id.includes('fruit') || flavor.id.includes('berry')) categoryId = 'fruity'
    else if (flavor.id.includes('floral') || flavor.id.includes('flower')) categoryId = 'floral'
    else if (flavor.id.includes('sweet') || flavor.id.includes('honey')) categoryId = 'sweet'
    else if (flavor.id.includes('nut') || flavor.id.includes('cocoa')) categoryId = 'nutty'
    else if (flavor.id.includes('spice') || flavor.id.includes('herb')) categoryId = 'spices'
    else if (flavor.id.includes('roast') || flavor.id.includes('smoke')) categoryId = 'roasted'

    categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + 1)
  })

  // Return categories with counts
  return categories
    .map((cat) => ({
      ...cat,
      count: categoryMap.get(cat.id) || 0,
    }))
    .filter((cat) => cat.count > 0)
})

// Extraction analytics
const extractionStrength = computed(() => {
  if (!props.tds) return 0
  // Convert TDS to strength percentage (0.8-1.8% → 0-100%)
  return Math.min(Math.max((props.tds - 0.8) * 100, 0), 100)
})

const extractionStrengthLabel = computed(() => {
  if (!props.tds) return '측정 필요'
  if (props.tds < 1.15) return '연한 추출'
  if (props.tds <= 1.35) return '적정 추출'
  return '진한 추출'
})

const strengthClass = computed(() => {
  if (!props.tds) return ''
  if (props.tds < 1.15) return 'weak'
  if (props.tds <= 1.35) return 'optimal'
  return 'strong'
})

// Balance levels (from sensory data)
const acidityLevel = computed(() => (sensoryData.value.acidity / 10) * 100)
const sweetnessLevel = computed(() => (sensoryData.value.sweetness / 10) * 100)
const bitternessLevel = computed(() => {
  // Estimate bitterness from body and aftertaste
  const estimated = 10 - (sensoryData.value.aftertaste + sensoryData.value.sweetness) / 2
  return Math.max(0, Math.min(10, estimated)) * 10
})

// Score calculation
const totalScore = computed(() => {
  return props.sensorySliderData?.overall_score || 0
})

const scoreComponents = computed(() => {
  const ratings = props.sensorySliderData?.ratings || {}
  return [
    { name: '향미', score: ratings.fragrance_aroma || 0, max: 10, color: '#9C27B0' },
    { name: '맛', score: ratings.flavor || 0, max: 10, color: '#2196F3' },
    { name: '후미', score: ratings.aftertaste || 0, max: 10, color: '#00BCD4' },
    { name: '산미', score: ratings.acidity || 0, max: 10, color: '#4CAF50' },
    { name: '바디', score: ratings.body || 0, max: 10, color: '#FF9800' },
    { name: '균형', score: ratings.balance || 0, max: 10, color: '#795548' },
    { name: '균일성', score: ratings.uniformity || 0, max: 10, color: '#607D8B' },
    { name: '깨끗함', score: ratings.clean_cup || 0, max: 10, color: '#00ACC1' },
    { name: '단맛', score: ratings.sweetness || 0, max: 10, color: '#FFC107' },
  ]
})

// Helper functions
const getSensoryLabel = (key) => {
  const labels = {
    fragrance_aroma: '향미',
    flavor: '맛',
    aftertaste: '후미',
    acidity: '산미',
    body: '바디',
    balance: '균형',
    uniformity: '균일성',
    clean_cup: '깨끗함',
    sweetness: '단맛',
  }
  return labels[key] || key
}

const getColorForScore = (score) => {
  if (score >= 8) return '#4CAF50'
  if (score >= 7) return '#8BC34A'
  if (score >= 6) return '#FFC107'
  return '#FF9800'
}

const getGrade = (score) => {
  if (score >= 90) return 'Outstanding'
  if (score >= 85) return 'Excellent'
  if (score >= 80) return 'Very Good'
  if (score >= 75) return 'Good'
  if (score >= 70) return 'Fair'
  return 'Poor'
}

// Draw spider chart
const drawSpiderChart = () => {
  if (!spiderCanvas.value) return

  const ctx = spiderCanvas.value.getContext('2d')
  const centerX = 150
  const centerY = 150
  const radius = 100
  const data = Object.values(sensoryData.value)
  const labels = Object.keys(sensoryData.value)
  const angleStep = (Math.PI * 2) / data.length

  // Clear canvas
  ctx.clearRect(0, 0, 300, 300)

  // Draw grid
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1

    for (let j = 0; j < data.length; j++) {
      const angle = j * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * ((radius * i) / 5)
      const y = centerY + Math.sin(angle) * ((radius * i) / 5)

      if (j === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()
  }

  // Draw axes
  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#E0E0E0'
    ctx.stroke()

    // Draw labels
    const labelX = centerX + Math.cos(angle) * (radius + 20)
    const labelY = centerY + Math.sin(angle) * (radius + 20)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(getSensoryLabel(labels[i]), labelX, labelY)
  }

  // Draw data
  ctx.beginPath()
  ctx.fillStyle = 'rgba(124, 88, 66, 0.3)'
  ctx.strokeStyle = '#7C5842'
  ctx.lineWidth = 2

  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    const value = data[i] / 10 // Normalize to 0-1
    const x = centerX + Math.cos(angle) * (radius * value)
    const y = centerY + Math.sin(angle) * (radius * value)

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Draw points
  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    const value = data[i] / 10
    const x = centerX + Math.cos(angle) * (radius * value)
    const y = centerY + Math.sin(angle) * (radius * value)

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#7C5842'
    ctx.fill()
  }
}

// Watch for data changes
watch(
  () => props.sensorySliderData,
  () => {
    drawSpiderChart()
  },
  { deep: true },
)

onMounted(() => {
  drawSpiderChart()
})
</script>

<style scoped>
.pro-data-visualizer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.chart-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Spider Chart */
.spider-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spider-legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  width: 100%;
  font-size: var(--text-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-label {
  color: var(--text-secondary);
  flex: 1;
}

.legend-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Flavor Wheel Mini */
.flavor-wheel-mini {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}

.flavor-category {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  color: white;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.category-name {
  font-weight: var(--font-medium);
}

.category-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-bold);
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  gap: var(--space-4);
}

.analytic-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.analytic-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.analytic-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-align: center;
}

/* Strength Meter */
.strength-meter {
  height: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width var(--transition-slow);
  background: var(--color-warning);
}

.strength-fill.weak {
  background: var(--color-info);
}
.strength-fill.optimal {
  background: var(--color-success);
}
.strength-fill.strong {
  background: var(--color-error);
}

/* Balance Chart */
.balance-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 80px;
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.balance-bar {
  width: 60px;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: var(--space-1);
  transition: height var(--transition-slow);
}

.balance-bar.acidity {
  background: linear-gradient(to top, #4caf50, #8bc34a);
}
.balance-bar.sweetness {
  background: linear-gradient(to top, #ffc107, #ffd54f);
}
.balance-bar.bitterness {
  background: linear-gradient(to top, #795548, #a1887f);
}

.bar-label {
  font-size: var(--text-xs);
  color: white;
  font-weight: var(--font-semibold);
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Score Breakdown */
.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.total-score {
  text-align: center;
  padding: var(--space-4);
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: white;
}

.score-label {
  display: block;
  font-size: var(--text-sm);
  opacity: 0.9;
  margin-bottom: var(--space-1);
}

.score-value {
  display: block;
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.score-grade {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.score-components {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.score-component {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.component-name {
  color: var(--text-secondary);
}

.component-score {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.component-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.component-fill {
  height: 100%;
  transition: width var(--transition-slow);
}

/* Responsive */
@media (max-width: 768px) {
  .pro-data-visualizer {
    grid-template-columns: 1fr;
  }

  .spider-legend {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
