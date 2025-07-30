<template>
  <div class="pro-brewing-view">
    <!-- Header -->
    <header class="screen-header">
      <button class="back-btn" @click="$router.push('/home-cafe')">←</button>
      <h1 class="screen-title">Pro 추출 프로토콜</h1>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: '43%' }"></div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- SCA Protocol Notice -->
      <section class="sca-notice">
        <div class="notice-icon">🎯</div>
        <div class="notice-content">
          <h3 class="notice-title">SCA 표준 프로토콜</h3>
          <p class="notice-text">Specialty Coffee Association 기준에 따른 전문가급 추출 설정</p>
        </div>
      </section>

      <!-- Extraction Method -->
      <section class="data-section">
        <h2 class="section-title">추출 방법</h2>
        <div class="extraction-grid">
          <button
            v-for="method in extractionMethods"
            :key="method.value"
            :class="['method-btn', { active: selectedMethod === method.value }]"
            @click="selectedMethod = method.value"
          >
            <span class="method-icon">{{ method.icon }}</span>
            <span class="method-name">{{ method.name }}</span>
            <span class="method-sca">{{ method.scaStandard }}</span>
          </button>
        </div>
      </section>

      <!-- SCA Brewing Parameters -->
      <section class="data-section">
        <h2 class="section-title">SCA 추출 파라미터</h2>

        <!-- Brew Ratio -->
        <div class="parameter-group">
          <h3 class="parameter-title">원두:물 비율 (SCA 권장: 1:15-1:17)</h3>
          <div class="ratio-controls">
            <button
              v-for="ratio in scaRatios"
              :key="ratio.value"
              :class="['ratio-btn', { active: selectedRatio === ratio.value }]"
              @click="selectedRatio = ratio.value"
            >
              <span class="ratio-value">1:{{ ratio.value }}</span>
              <span class="ratio-desc">{{ ratio.description }}</span>
            </button>
          </div>
          <div class="ratio-calculation">
            <span>계산 결과: {{ coffeeAmount }}g → {{ waterAmount }}ml</span>
          </div>
        </div>

        <!-- Water Temperature -->
        <div class="parameter-group">
          <h3 class="parameter-title">물 온도 (SCA 기준: 90-96°C)</h3>
          <div class="temp-control">
            <input
              v-model.number="waterTemp"
              type="range"
              min="85"
              max="100"
              step="1"
              class="temp-slider"
              :class="{ 'sca-compliant': isScaTemp }"
            />
            <div class="temp-display">
              <span class="temp-value">{{ waterTemp }}°C</span>
              <span class="temp-status" :class="{ 'sca-ok': isScaTemp }">
                {{ isScaTemp ? 'SCA 기준 적합' : 'SCA 기준 벗어남' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Grind Size -->
        <div class="parameter-group">
          <h3 class="parameter-title">분쇄도 (1-10 스케일)</h3>
          <div class="grind-control">
            <div class="grind-scale">
              <input
                v-model="grindSize"
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="grind-slider"
              />
              <div class="grind-labels">
                <span>극세분쇄</span>
                <span>중간</span>
                <span>극조분쇄</span>
              </div>
            </div>
            <div class="grind-display">
              <span class="grind-value">{{ grindSize }}</span>
              <span class="grind-description">{{ getGrindDescription(grindSize) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Water Quality Analysis -->
      <section class="data-section">
        <h2 class="section-title">물 품질 분석</h2>
        <div class="water-grid">
          <div class="water-field">
            <label class="water-label">물 경도 (TDS)</label>
            <div class="water-input-group">
              <input
                v-model.number="waterTds"
                type="number"
                min="0"
                max="500"
                placeholder="150"
                class="water-input"
              />
              <span class="water-unit">ppm</span>
            </div>
            <p class="water-hint">SCA 권장: 75-250 ppm</p>
          </div>
          <div class="water-field">
            <label class="water-label">pH 수치</label>
            <div class="water-input-group">
              <input
                v-model.number="waterPh"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="7.0"
                class="water-input"
              />
            </div>
            <p class="water-hint">SCA 권장: 6.5-7.5</p>
          </div>
        </div>
      </section>

      <!-- Advanced Timing -->
      <section class="data-section">
        <h2 class="section-title">고급 타이밍 설정</h2>
        <div class="timing-grid">
          <div class="timing-item">
            <label class="timing-label">블루밍 시간</label>
            <div class="timing-input-group">
              <input
                v-model.number="bloomTime"
                type="number"
                min="0"
                max="120"
                placeholder="30"
                class="timing-input"
              />
              <span class="timing-unit">초</span>
            </div>
            <p class="timing-hint">일반적: 30-45초</p>
          </div>
          <div class="timing-item">
            <label class="timing-label">총 추출 시간</label>
            <div class="timing-input-group">
              <input
                v-model="totalTime"
                type="text"
                placeholder="2:30"
                pattern="[0-9]+:[0-9]{2}"
                class="timing-input"
              />
            </div>
            <p class="timing-hint">SCA 권장: 2:30-6:00</p>
          </div>
          <div class="timing-item">
            <label class="timing-label">물 유속</label>
            <div class="timing-input-group">
              <input
                v-model.number="flowRate"
                type="number"
                step="0.1"
                min="0"
                placeholder="2.0"
                class="timing-input"
              />
              <span class="timing-unit">g/s</span>
            </div>
            <p class="timing-hint">일관성 유지 중요</p>
          </div>
          <div class="timing-item">
            <label class="timing-label">온도 변화</label>
            <div class="timing-input-group">
              <input
                v-model.number="tempDrop"
                type="number"
                step="0.1"
                min="0"
                placeholder="5.0"
                class="timing-input"
              />
              <span class="timing-unit">°C</span>
            </div>
            <p class="timing-hint">추출 중 온도 감소</p>
          </div>
        </div>
      </section>

      <!-- Equipment Documentation -->
      <section class="data-section">
        <h2 class="section-title">장비 상세 정보</h2>
        <div class="equipment-grid">
          <div class="equipment-field">
            <label class="equipment-label">그라인더 모델</label>
            <input
              v-model="grinderModel"
              type="text"
              placeholder="예: Comandante C40"
              class="equipment-input"
            />
          </div>
          <div class="equipment-field">
            <label class="equipment-label">필터 종류</label>
            <select v-model="filterType" class="equipment-select">
              <option value="">선택하세요</option>
              <option value="paper">종이 필터</option>
              <option value="metal">메탈 필터</option>
              <option value="cloth">천 필터</option>
            </select>
          </div>
        </div>
        <div class="equipment-notes">
          <label class="equipment-label">추가 장비 설정</label>
          <textarea
            v-model="equipmentNotes"
            placeholder="특별한 장비 설정, 교정 정보, 환경 조건 등..."
            class="equipment-textarea"
            rows="3"
          ></textarea>
        </div>
      </section>

      <!-- SCA Compliance Status -->
      <section class="compliance-status">
        <h3 class="compliance-title">SCA 표준 준수 상태</h3>
        <div class="compliance-grid">
          <div class="compliance-item" :class="{ compliant: isScaRatio }">
            <span class="compliance-label">추출 비율</span>
            <span class="compliance-status">{{ isScaRatio ? '✓' : '⚠' }}</span>
          </div>
          <div class="compliance-item" :class="{ compliant: isScaTemp }">
            <span class="compliance-label">물 온도</span>
            <span class="compliance-status">{{ isScaTemp ? '✓' : '⚠' }}</span>
          </div>
          <div class="compliance-item" :class="{ compliant: isScaWater }">
            <span class="compliance-label">물 품질</span>
            <span class="compliance-status">{{ isScaWater ? '✓' : '⚠' }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/home-cafe')">이전</button>
      <button type="button" class="btn-primary" @click="handleNext">다음: QC 측정</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'
import ProBrewingChart from '../../components/pro/ProBrewingChart.vue'
import ProModeStepper from '../../components/pro/ProModeStepper.vue'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// SCA-compliant extraction methods
const extractionMethods = [
  {
    value: 'pourover',
    name: 'Pour Over',
    icon: '☕',
    scaStandard: 'V60, Chemex',
  },
  {
    value: 'immersion',
    name: 'Immersion',
    icon: '🫖',
    scaStandard: 'French Press, AeroPress',
  },
  {
    value: 'pressure',
    name: 'Pressure',
    icon: '💨',
    scaStandard: 'Espresso',
  },
  {
    value: 'cold-brew',
    name: 'Cold Brew',
    icon: '🧊',
    scaStandard: 'Cold Extraction',
  },
]

// SCA ratios
const scaRatios = [
  { value: 15, description: '진한 맛' },
  { value: 16, description: '균형' },
  { value: 17, description: '밝은 맛' },
]

// State
const selectedMethod = ref('pourover')
const selectedRatio = ref(16)
const waterTemp = ref(93)
const grindSize = ref(6)
const waterTds = ref(150)
const waterPh = ref(7.0)
const bloomTime = ref(30)
const totalTime = ref('2:30')
const flowRate = ref(null)
const tempDrop = ref(null)
const grinderModel = ref('')
const filterType = ref('')
const equipmentNotes = ref('')

// Get coffee amount from store
const coffeeAmount = computed(() => {
  return tastingSessionStore.currentSession.brewSettings?.recipe?.coffee_amount || 20
})

// Calculate water amount based on ratio
const waterAmount = computed(() => {
  return coffeeAmount.value * selectedRatio.value
})

// SCA Compliance checks
const isScaRatio = computed(() => {
  return selectedRatio.value >= 15 && selectedRatio.value <= 17
})

const isScaTemp = computed(() => {
  return waterTemp.value >= 90 && waterTemp.value <= 96
})

const isScaWater = computed(() => {
  const tdsOk = waterTds.value >= 75 && waterTds.value <= 250
  const phOk = waterPh.value >= 6.5 && waterPh.value <= 7.5
  return tdsOk && phOk
})

// Methods
const getGrindDescription = (value) => {
  if (value <= 2) return '에스프레소용 (매우 세밀)'
  if (value <= 4) return '모카포트용 (세밀)'
  if (value <= 6) return 'V60/드립용 (중간)'
  if (value <= 8) return '케멕스용 (거침)'
  return '프렌치프레스용 (매우 거침)'
}

const handleNext = () => {
  // Save pro brewing data to store
  const proBrewingData = {
    extraction_method: selectedMethod.value,
    brew_ratio: selectedRatio.value,
    water_temp: waterTemp.value,
    grind_size: grindSize.value,
    water_tds: waterTds.value,
    water_ph: waterPh.value,
    bloom_time: bloomTime.value,
    total_time: totalTime.value,
    flow_rate: flowRate.value,
    temp_drop: tempDrop.value,
    grinder_model: grinderModel.value,
    filter_type: filterType.value,
    equipment_notes: equipmentNotes.value,

    // SCA compliance status
    sca_compliance: {
      ratio: isScaRatio.value,
      temperature: isScaTemp.value,
      water_quality: isScaWater.value,
    },
  }

  tastingSessionStore.updateProBrewingData(proBrewingData)

  // Navigate to QC measurement
  router.push('/qc-measurement')
}
</script>

<style scoped>
.pro-brewing-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
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
  color: #7c5842;
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
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.progress-bar {
  max-width: 300px;
  height: 4px;
  background: #e8d5c4;
  border-radius: 2px;
  margin: 1rem auto 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #7c5842;
  transition: width 0.3s ease;
}

/* SCA Notice */
.sca-notice {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.notice-text {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}

/* Content */
.content {
  margin-bottom: 2rem;
}

.data-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f8f4f0;
  padding-bottom: 0.5rem;
}

/* Extraction Methods */
.extraction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.method-btn {
  background: white;
  border: 2px solid #e8d5c4;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.method-btn:hover {
  border-color: #d4b896;
  transform: translateY(-1px);
}

.method-btn.active {
  border-color: #2196f3;
  background: #e3f2fd;
  color: #1976d2;
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.method-sca {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

/* Parameter Groups */
.parameter-group {
  margin-bottom: 2rem;
}

.parameter-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}

/* Ratio Controls */
.ratio-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ratio-btn {
  background: white;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.ratio-btn:hover {
  border-color: #d4b896;
}

.ratio-btn.active {
  border-color: #2196f3;
  background: #e3f2fd;
  color: #1976d2;
}

.ratio-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.ratio-desc {
  font-size: 0.8rem;
}

.ratio-calculation {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
}

/* Temperature Control */
.temp-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.temp-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #ff5722 0%, #ffc107 50%, #4caf50 100%);
  border-radius: 4px;
  outline: none;
}

.temp-slider.sca-compliant {
  background: linear-gradient(to right, #e0e0e0 0%, #4caf50 37%, #4caf50 62%, #e0e0e0 100%);
}

.temp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #2196f3;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.temp-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.temp-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c5842;
}

.temp-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #ffe4e1;
  color: #d32f2f;
}

.temp-status.sca-ok {
  background: #e8f5e9;
  color: #388e3c;
}

/* Grind Control */
.grind-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grind-scale {
  position: relative;
}

.grind-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #8d6e63 0%, #bcaaa4 100%);
  border-radius: 4px;
  outline: none;
}

.grind-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #7c5842;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.3);
}

.grind-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #a0796a;
}

.grind-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f4f0;
  border-radius: 8px;
}

.grind-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c5842;
}

.grind-description {
  font-size: 0.9rem;
  color: #a0796a;
}

/* Water Quality */
.water-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.water-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.water-label {
  font-size: 0.9rem;
  color: #7c5842;
  font-weight: 500;
}

.water-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.water-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
}

.water-input:focus {
  outline: none;
  border-color: #2196f3;
}

.water-unit {
  font-size: 0.9rem;
  color: #a0796a;
}

.water-hint {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}

/* Timing Grid */
.timing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.timing-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timing-label {
  font-size: 0.85rem;
  color: #7c5842;
  font-weight: 500;
}

.timing-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timing-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 0.95rem;
}

.timing-input:focus {
  outline: none;
  border-color: #2196f3;
}

.timing-unit {
  font-size: 0.8rem;
  color: #a0796a;
}

.timing-hint {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
}

/* Equipment */
.equipment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.equipment-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.equipment-label {
  font-size: 0.9rem;
  color: #7c5842;
  font-weight: 500;
}

.equipment-input,
.equipment-select {
  padding: 0.5rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 0.95rem;
}

.equipment-input:focus,
.equipment-select:focus {
  outline: none;
  border-color: #2196f3;
}

.equipment-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.equipment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.equipment-textarea:focus {
  outline: none;
  border-color: #2196f3;
}

/* Compliance Status */
.compliance-status {
  background: #f8f4f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #e8d5c4;
}

.compliance-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
  text-align: center;
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.compliance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #ffe4e1;
}

.compliance-item.compliant {
  border-color: #e8f5e9;
  background: #f1f8e9;
}

.compliance-label {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.compliance-status {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d32f2f;
}

.compliance-item.compliant .compliance-status {
  color: #388e3c;
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
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border: 2px solid #2196f3;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  border-color: #1976d2;
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

/* Responsive */
@media (max-width: 768px) {
  .extraction-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ratio-controls {
    flex-direction: column;
  }

  .water-grid,
  .timing-grid,
  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .compliance-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
