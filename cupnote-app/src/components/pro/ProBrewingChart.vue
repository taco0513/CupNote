<template>
  <div class="pro-brewing-chart">
    <!-- Extraction Yield Chart -->
    <div class="chart-container">
      <h3 class="chart-title">☕ 추출 수율 차트</h3>
      <div class="extraction-chart">
        <!-- SCA Golden Cup Zone -->
        <div class="golden-zone" :style="goldenZoneStyle">
          <span class="zone-label">SCA Golden Cup</span>
        </div>
        
        <!-- Current Point -->
        <div 
          class="current-point" 
          :style="currentPointStyle"
          v-if="tds && extractionYield"
        >
          <div class="point-marker"></div>
          <div class="point-tooltip">
            <span class="tooltip-title">현재 추출</span>
            <span class="tooltip-value">TDS: {{ tds }}%</span>
            <span class="tooltip-value">수율: {{ extractionYield }}%</span>
          </div>
        </div>
        
        <!-- Axes -->
        <div class="x-axis">
          <span class="axis-label">TDS (%)</span>
          <div class="axis-ticks">
            <span v-for="tick in xTicks" :key="tick" class="tick">{{ tick }}</span>
          </div>
        </div>
        <div class="y-axis">
          <span class="axis-label">추출 수율 (%)</span>
          <div class="axis-ticks">
            <span v-for="tick in yTicks" :key="tick" class="tick">{{ tick }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Brewing Profile -->
    <div class="profile-container">
      <h3 class="chart-title">⏱️ 추출 프로파일</h3>
      <div class="brewing-timeline">
        <div class="timeline-track">
          <div 
            v-for="(phase, index) in brewingPhases" 
            :key="phase.name"
            class="phase-segment"
            :style="{ width: phase.percentage + '%' }"
            :class="phase.class"
          >
            <span class="phase-label">{{ phase.name }}</span>
            <span class="phase-time">{{ phase.time }}s</span>
          </div>
        </div>
        
        <!-- Pouring Points -->
        <div class="pouring-points">
          <div 
            v-for="pour in pourPoints" 
            :key="pour.time"
            class="pour-marker"
            :style="{ left: pour.position + '%' }"
          >
            <div class="pour-dot"></div>
            <span class="pour-label">{{ pour.amount }}ml</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quality Indicators -->
    <div class="quality-indicators">
      <div 
        v-for="indicator in qualityIndicators" 
        :key="indicator.name"
        class="indicator-card"
        :class="indicator.status"
      >
        <span class="indicator-icon">{{ indicator.icon }}</span>
        <span class="indicator-name">{{ indicator.name }}</span>
        <span class="indicator-value">{{ indicator.value }}</span>
        <div class="indicator-bar">
          <div 
            class="indicator-fill" 
            :style="{ width: indicator.percentage + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tds: {
    type: Number,
    default: null
  },
  extractionYield: {
    type: Number,
    default: null
  },
  brewTime: {
    type: Number,
    default: 240
  },
  lapTimes: {
    type: Array,
    default: () => []
  },
  coffeeAmount: {
    type: Number,
    default: 20
  },
  waterAmount: {
    type: Number,
    default: 340
  },
  waterTemp: {
    type: Number,
    default: 93
  }
})

// Chart configuration
const xTicks = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8]
const yTicks = [16, 18, 20, 22, 24]

// SCA Golden Cup standards
const goldenCupBounds = {
  tdsMin: 1.15,
  tdsMax: 1.35,
  yieldMin: 18,
  yieldMax: 22
}

// Calculate positions
const goldenZoneStyle = computed(() => {
  const left = ((goldenCupBounds.tdsMin - 0.8) / 1.0) * 100
  const width = ((goldenCupBounds.tdsMax - goldenCupBounds.tdsMin) / 1.0) * 100
  const bottom = ((goldenCupBounds.yieldMin - 16) / 8) * 100
  const height = ((goldenCupBounds.yieldMax - goldenCupBounds.yieldMin) / 8) * 100
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    bottom: `${bottom}%`,
    height: `${height}%`
  }
})

const currentPointStyle = computed(() => {
  if (!props.tds || !props.extractionYield) return null
  
  const x = ((props.tds - 0.8) / 1.0) * 100
  const y = ((props.extractionYield - 16) / 8) * 100
  
  return {
    left: `${x}%`,
    bottom: `${y}%`
  }
})

// Brewing phases
const brewingPhases = computed(() => {
  const phases = []
  let lastTime = 0
  
  // Blooming phase (first 30-45s)
  if (props.lapTimes.length > 0) {
    const bloomTime = Math.min(props.lapTimes[0], 45)
    phases.push({
      name: '블루밍',
      time: bloomTime,
      percentage: (bloomTime / props.brewTime) * 100,
      class: 'phase-bloom'
    })
    lastTime = bloomTime
  }
  
  // Main pour phases
  if (props.lapTimes.length > 1) {
    for (let i = 1; i < props.lapTimes.length; i++) {
      const phaseTime = props.lapTimes[i] - lastTime
      phases.push({
        name: `${i}차 추출`,
        time: phaseTime,
        percentage: (phaseTime / props.brewTime) * 100,
        class: `phase-pour-${i}`
      })
      lastTime = props.lapTimes[i]
    }
  }
  
  // Dripping phase
  if (lastTime < props.brewTime) {
    phases.push({
      name: '드리핑',
      time: props.brewTime - lastTime,
      percentage: ((props.brewTime - lastTime) / props.brewTime) * 100,
      class: 'phase-drip'
    })
  }
  
  return phases
})

// Pour points for visualization
const pourPoints = computed(() => {
  const ratio = props.waterAmount / props.coffeeAmount
  const points = []
  
  // Calculate pour amounts based on common patterns
  if (props.lapTimes.length > 0) {
    // Bloom (usually 2x coffee weight)
    points.push({
      time: props.lapTimes[0],
      amount: Math.round(props.coffeeAmount * 2),
      position: (props.lapTimes[0] / props.brewTime) * 100
    })
    
    // Subsequent pours
    const remainingWater = props.waterAmount - (props.coffeeAmount * 2)
    const remainingPours = props.lapTimes.length - 1
    
    for (let i = 1; i < props.lapTimes.length; i++) {
      points.push({
        time: props.lapTimes[i],
        amount: Math.round(remainingWater / remainingPours),
        position: (props.lapTimes[i] / props.brewTime) * 100
      })
    }
  }
  
  return points
})

// Quality indicators
const qualityIndicators = computed(() => {
  const indicators = []
  
  // TDS indicator
  if (props.tds) {
    const tdsOptimal = props.tds >= goldenCupBounds.tdsMin && props.tds <= goldenCupBounds.tdsMax
    indicators.push({
      name: 'TDS',
      icon: '💧',
      value: `${props.tds}%`,
      percentage: Math.min((props.tds / 2) * 100, 100),
      status: tdsOptimal ? 'optimal' : props.tds < goldenCupBounds.tdsMin ? 'low' : 'high'
    })
  }
  
  // Extraction Yield indicator
  if (props.extractionYield) {
    const yieldOptimal = props.extractionYield >= goldenCupBounds.yieldMin && 
                        props.extractionYield <= goldenCupBounds.yieldMax
    indicators.push({
      name: '추출 수율',
      icon: '📊',
      value: `${props.extractionYield}%`,
      percentage: Math.min((props.extractionYield / 30) * 100, 100),
      status: yieldOptimal ? 'optimal' : props.extractionYield < goldenCupBounds.yieldMin ? 'low' : 'high'
    })
  }
  
  // Water temperature indicator
  const tempOptimal = props.waterTemp >= 90 && props.waterTemp <= 96
  indicators.push({
    name: '물 온도',
    icon: '🌡️',
    value: `${props.waterTemp}°C`,
    percentage: ((props.waterTemp - 80) / 20) * 100,
    status: tempOptimal ? 'optimal' : props.waterTemp < 90 ? 'low' : 'high'
  })
  
  // Brew ratio indicator
  const ratio = props.waterAmount / props.coffeeAmount
  const ratioOptimal = ratio >= 15 && ratio <= 17
  indicators.push({
    name: '추출 비율',
    icon: '⚖️',
    value: `1:${ratio.toFixed(1)}`,
    percentage: Math.min((ratio / 20) * 100, 100),
    status: ratioOptimal ? 'optimal' : ratio < 15 ? 'low' : 'high'
  })
  
  return indicators
})
</script>

<style scoped>
.pro-brewing-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Chart Container */
.chart-container {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.chart-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Extraction Chart */
.extraction-chart {
  position: relative;
  width: 100%;
  height: 300px;
  background: linear-gradient(to top, var(--bg-secondary) 1px, transparent 1px),
              linear-gradient(to right, var(--bg-secondary) 1px, transparent 1px);
  background-size: 10% 10%;
  border-left: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
  margin: var(--space-8) var(--space-4) var(--space-4) var(--space-8);
}

.golden-zone {
  position: absolute;
  background: var(--color-success);
  opacity: 0.15;
  border: 2px dashed var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-label {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-success);
  opacity: 0.8;
}

.current-point {
  position: absolute;
  transform: translate(-50%, 50%);
  z-index: 10;
}

.point-marker {
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border: 3px solid var(--bg-card);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.point-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tooltip-title {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: center;
}

.tooltip-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Axes */
.x-axis, .y-axis {
  position: absolute;
  display: flex;
  align-items: center;
}

.x-axis {
  bottom: -40px;
  left: 0;
  right: 0;
  flex-direction: column;
  gap: var(--space-2);
}

.y-axis {
  left: -60px;
  top: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.axis-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.axis-ticks {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: absolute;
}

.x-axis .axis-ticks {
  bottom: -20px;
}

.y-axis .axis-ticks {
  right: -30px;
  top: 0;
  bottom: 0;
  flex-direction: column-reverse;
  writing-mode: horizontal-tb;
}

.tick {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* Brewing Timeline */
.profile-container {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.brewing-timeline {
  position: relative;
  margin-top: var(--space-4);
}

.timeline-track {
  display: flex;
  height: 60px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.phase-segment {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  border-right: 1px solid var(--bg-card);
  transition: all var(--transition-base);
}

.phase-bloom { background: var(--color-info); opacity: 0.7; }
.phase-pour-1 { background: var(--color-primary); opacity: 0.8; }
.phase-pour-2 { background: var(--color-primary); opacity: 0.7; }
.phase-pour-3 { background: var(--color-primary); opacity: 0.6; }
.phase-drip { background: var(--color-accent); opacity: 0.5; }

.phase-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--bg-card);
}

.phase-time {
  font-size: var(--text-xs);
  color: var(--bg-card);
  opacity: 0.8;
}

/* Pouring Points */
.pouring-points {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
}

.pour-marker {
  position: absolute;
  transform: translateX(-50%);
}

.pour-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border: 2px solid var(--bg-card);
  border-radius: 50%;
  margin: 0 auto;
}

.pour-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
}

/* Quality Indicators */
.quality-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.indicator-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border: 2px solid transparent;
  transition: all var(--transition-base);
}

.indicator-card.optimal {
  border-color: var(--color-success);
  background: linear-gradient(to bottom, var(--bg-card), rgba(34, 197, 94, 0.05));
}

.indicator-card.low {
  border-color: var(--color-warning);
  background: linear-gradient(to bottom, var(--bg-card), rgba(251, 191, 36, 0.05));
}

.indicator-card.high {
  border-color: var(--color-error);
  background: linear-gradient(to bottom, var(--bg-card), rgba(239, 68, 68, 0.05));
}

.indicator-icon {
  font-size: var(--text-2xl);
  align-self: center;
}

.indicator-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.indicator-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.indicator-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-1);
}

.indicator-fill {
  height: 100%;
  background: currentColor;
  transition: width var(--transition-slow);
}

.optimal .indicator-fill { background: var(--color-success); }
.low .indicator-fill { background: var(--color-warning); }
.high .indicator-fill { background: var(--color-error); }

/* Responsive */
@media (max-width: 768px) {
  .extraction-chart {
    height: 250px;
  }
  
  .quality-indicators {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>