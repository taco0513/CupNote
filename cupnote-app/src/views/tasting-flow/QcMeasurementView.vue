<template>
  <div class="qc-measurement-view">
    <!-- Header -->
    <header class="screen-header">
      <button class="back-btn" @click="$router.push('/pro-brewing')">
        ←
      </button>
      <h1 class="screen-title">QC 측정</h1>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: '57%' }"></div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- QC Introduction -->
      <section class="qc-intro">
        <div class="intro-icon">📊</div>
        <div class="intro-content">
          <h3 class="intro-title">품질 관리 측정</h3>
          <p class="intro-text">SCA 기준에 따른 추출 품질 측정 및 평가</p>
        </div>
      </section>

      <!-- TDS Measurement -->
      <section class="measurement-section">
        <h2 class="section-title">TDS 측정 (Total Dissolved Solids)</h2>
        
        <div class="tds-measurement">
          <div class="tds-input-section">
            <div class="tds-toggle">
              <label class="toggle-label">
                <input
                  v-model="tdsEnabled"
                  type="checkbox"
                  class="toggle-checkbox"
                />
                <span class="toggle-slider"></span>
                TDS 측정 사용
              </label>
              <p class="toggle-hint">
                {{ tdsEnabled ? 'TDS 미터로 측정한 값을 입력하세요' : 'TDS 측정 없이 진행합니다' }}
              </p>
            </div>

            <div v-if="tdsEnabled" class="tds-input-group">
              <div class="tds-field">
                <label class="tds-label">TDS 수치</label>
                <div class="tds-input-wrapper">
                  <input
                    v-model.number="tdsValue"
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    placeholder="1.30"
                    class="tds-input"
                    :class="{ 'error': tdsValue && !isValidTds }"
                  />
                  <span class="tds-unit">%</span>
                </div>
                <p class="tds-hint">SCA 권장 범위: 1.15 - 1.45%</p>
              </div>

              <div class="tds-device-info">
                <label class="device-label">TDS 미터 정보</label>
                <select v-model="tdsDevice" class="device-select">
                  <option value="">미터 선택</option>
                  <option value="atago-pal3">ATAGO PAL-3</option>
                  <option value="hanna-hi96801">Hanna HI96801</option>
                  <option value="milwaukee-ma871">Milwaukee MA871</option>
                  <option value="other">기타</option>
                </select>
                <input
                  v-if="tdsDevice === 'other'"
                  v-model="customDevice"
                  type="text"
                  placeholder="미터 모델명"
                  class="device-input"
                />
              </div>
            </div>
          </div>

          <div v-if="tdsEnabled && tdsValue" class="tds-results">
            <h3 class="results-title">추출 수율 계산</h3>
            <div class="yield-calculation">
              <div class="yield-formula">
                <span class="formula-text">추출 수율 = (TDS × 추출량) ÷ 원두량</span>
                <span class="formula-calculation">= ({{ tdsValue }}% × {{ brewVolume }}ml) ÷ {{ coffeeAmount }}g</span>
              </div>
              <div class="yield-result">
                <span class="yield-value">{{ extractionYield }}%</span>
                <span class="yield-status" :class="yieldStatusClass">{{ yieldStatusText }}</span>
              </div>
            </div>

            <!-- SCA Standard Comparison -->
            <div class="sca-comparison">
              <h4 class="comparison-title">SCA 기준 비교</h4>
              <div class="comparison-chart">
                <div class="chart-bar">
                  <div class="chart-label">미추출</div>
                  <div class="chart-range under">
                    <span>< 18%</span>
                  </div>
                </div>
                <div class="chart-bar">
                  <div class="chart-label">적정</div>
                  <div class="chart-range optimal">
                    <span>18-22%</span>
                  </div>
                </div>
                <div class="chart-bar">
                  <div class="chart-label">과추출</div>
                  <div class="chart-range over">
                    <span>> 22%</span>
                  </div>
                </div>
              </div>
              <div class="current-position">
                <div class="position-indicator" :style="{ left: yieldPosition + '%' }">
                  <span>{{ extractionYield }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quality Assessment -->
      <section class="measurement-section">
        <h2 class="section-title">품질 평가</h2>
        
        <div class="quality-metrics">
          <div class="metric-card" :class="{ 'disabled': !tdsEnabled }">
            <div class="metric-header">
              <span class="metric-icon">📈</span>
              <h3 class="metric-title">추출 효율성</h3>
            </div>
            <div class="metric-value">
              {{ tdsEnabled && tdsValue ? extractionYield + '%' : 'N/A' }}
            </div>
            <div class="metric-status" :class="yieldStatusClass">
              {{ tdsEnabled && tdsValue ? yieldStatusText : 'TDS 측정 필요' }}
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">⚖️</span>
              <h3 class="metric-title">SCA 준수도</h3>
            </div>
            <div class="metric-value">{{ scaComplianceScore }}%</div>
            <div class="metric-status" :class="complianceClass">
              {{ complianceText }}
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">🎯</span>
              <h3 class="metric-title">예상 품질</h3>
            </div>
            <div class="metric-value">{{ predictedQuality }}/5</div>
            <div class="metric-status">
              {{ qualityDescription }}
            </div>
          </div>
        </div>
      </section>

      <!-- Additional Measurements -->
      <section class="measurement-section">
        <h2 class="section-title">추가 측정값</h2>
        
        <div class="additional-measurements">
          <div class="measurement-group">
            <h3 class="group-title">추출 데이터</h3>
            <div class="measurement-grid">
              <div class="measurement-field">
                <label class="measurement-label">최종 추출량</label>
                <div class="measurement-input-group">
                  <input
                    v-model.number="brewVolume"
                    type="number"
                    min="0"
                    placeholder="320"
                    class="measurement-input"
                  />
                  <span class="measurement-unit">ml</span>
                </div>
              </div>
              <div class="measurement-field">
                <label class="measurement-label">드립 손실</label>
                <div class="measurement-input-group">
                  <input
                    v-model.number="dripLoss"
                    type="number"
                    min="0"
                    placeholder="20"
                    class="measurement-input"
                  />
                  <span class="measurement-unit">ml</span>
                </div>
              </div>
            </div>
          </div>

          <div class="measurement-group">
            <h3 class="group-title">환경 조건</h3>
            <div class="measurement-grid">
              <div class="measurement-field">
                <label class="measurement-label">실내 온도</label>
                <div class="measurement-input-group">
                  <input
                    v-model.number="roomTemp"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="23"
                    class="measurement-input"
                  />
                  <span class="measurement-unit">°C</span>
                </div>
              </div>
              <div class="measurement-field">
                <label class="measurement-label">습도</label>
                <div class="measurement-input-group">
                  <input
                    v-model.number="humidity"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="60"
                    class="measurement-input"
                  />
                  <span class="measurement-unit">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- QC Notes -->
      <section class="measurement-section">
        <h2 class="section-title">QC 메모</h2>
        <div class="qc-notes">
          <textarea
            v-model="qcNotes"
            placeholder="측정 과정에서 특이사항, 장비 상태, 환경 변화 등을 기록하세요..."
            class="qc-textarea"
            rows="4"
          ></textarea>
        </div>
      </section>
    </main>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/pro-brewing')">
        이전
      </button>
      <button type="button" class="btn-primary" @click="handleNext">
        다음: 향미 평가
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// State
const tdsEnabled = ref(true)
const tdsValue = ref(null)
const tdsDevice = ref('')
const customDevice = ref('')
const brewVolume = ref(320)
const dripLoss = ref(20)
const roomTemp = ref(23)
const humidity = ref(60)
const qcNotes = ref('')

// Get data from store
const coffeeAmount = computed(() => {
  return tastingSessionStore.currentSession.brewSettings?.recipe?.coffee_amount || 20
})

const proBrewingData = computed(() => {
  return tastingSessionStore.currentSession.experimentalData || {}
})

// TDS Validation
const isValidTds = computed(() => {
  if (!tdsValue.value) return true
  return tdsValue.value >= 0.5 && tdsValue.value <= 3.0
})

// Extraction Yield Calculation
const extractionYield = computed(() => {
  if (!tdsEnabled.value || !tdsValue.value || !brewVolume.value || !coffeeAmount.value) {
    return '0.00'
  }
  
  const yieldValue = (tdsValue.value * brewVolume.value) / coffeeAmount.value
  return yieldValue.toFixed(2)
})

// Yield Status
const yieldStatusClass = computed(() => {
  const yieldValue = parseFloat(extractionYield.value)
  if (yieldValue < 18) return 'under'
  if (yieldValue >= 18 && yieldValue <= 22) return 'optimal'
  return 'over'
})

const yieldStatusText = computed(() => {
  const yieldValue = parseFloat(extractionYield.value)
  if (yieldValue < 18) return '미추출'
  if (yieldValue >= 18 && yieldValue <= 22) return '적정'
  return '과추출'
})

// Yield Position for Chart
const yieldPosition = computed(() => {
  const yieldValue = parseFloat(extractionYield.value)
  if (yieldValue <= 18) return (yieldValue / 18) * 33.33
  if (yieldValue <= 22) return 33.33 + ((yieldValue - 18) / 4) * 33.33
  return 66.66 + Math.min(((yieldValue - 22) / 8) * 33.33, 33.33)
})

// SCA Compliance Score
const scaComplianceScore = computed(() => {
  let score = 0
  const brewing = proBrewingData.value.sca_compliance || {}
  
  if (brewing.ratio) score += 33
  if (brewing.temperature) score += 33
  if (brewing.water_quality) score += 34
  
  return Math.round(score)
})

const complianceClass = computed(() => {
  const score = scaComplianceScore.value
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'needs-improvement'
})

const complianceText = computed(() => {
  const score = scaComplianceScore.value
  if (score >= 90) return '우수'
  if (score >= 70) return '양호'
  if (score >= 50) return '보통'
  return '개선 필요'
})

// Predicted Quality
const predictedQuality = computed(() => {
  let score = 3.0 // Base score
  
  // TDS contribution
  if (tdsEnabled.value && tdsValue.value) {
    const yieldValue = parseFloat(extractionYield.value)
    if (yieldValue >= 18 && yieldValue <= 22) {
      score += 0.5
    } else if (yieldValue >= 16 && yieldValue <= 24) {
      score += 0.2
    } else {
      score -= 0.3
    }
  }
  
  // SCA compliance contribution
  const compliance = scaComplianceScore.value
  if (compliance >= 90) score += 0.5
  else if (compliance >= 70) score += 0.3
  else if (compliance < 50) score -= 0.3
  
  return Math.max(1.0, Math.min(5.0, score)).toFixed(1)
})

const qualityDescription = computed(() => {
  const quality = parseFloat(predictedQuality.value)
  if (quality >= 4.5) return '탁월'
  if (quality >= 4.0) return '우수'
  if (quality >= 3.5) return '좋음'
  if (quality >= 3.0) return '보통'
  return '개선 필요'
})

// Methods
const handleNext = () => {
  // Save QC measurement data to store
  const qcMeasurementData = {
    tds_enabled: tdsEnabled.value,
    tds_value: tdsEnabled.value ? tdsValue.value : null,
    tds_device: tdsEnabled.value ? (tdsDevice.value === 'other' ? customDevice.value : tdsDevice.value) : null,
    extraction_yield: tdsEnabled.value && tdsValue.value ? parseFloat(extractionYield.value) : null,
    yield_status: tdsEnabled.value && tdsValue.value ? yieldStatusText.value : null,
    brew_volume: brewVolume.value,
    drip_loss: dripLoss.value,
    room_temp: roomTemp.value,
    humidity: humidity.value,
    sca_compliance_score: scaComplianceScore.value,
    predicted_quality: parseFloat(predictedQuality.value),
    qc_notes: qcNotes.value
  }
  
  tastingSessionStore.updateQcMeasurementData(qcMeasurementData)
  
  // Navigate to unified flavor (SCA flavor wheel will be integrated later)
  router.push('/flavor-selection')
}

// Watch for TDS toggle
watch(tdsEnabled, (newValue) => {
  if (!newValue) {
    tdsValue.value = null
    tdsDevice.value = ''
    customDevice.value = ''
  }
})
</script>

<style scoped>
.qc-measurement-view {
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

/* QC Introduction */
.qc-intro {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.intro-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.intro-text {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}

/* Content */
.content {
  margin-bottom: 2rem;
}

.measurement-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #F8F4F0;
  padding-bottom: 0.5rem;
}

/* TDS Measurement */
.tds-measurement {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tds-input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Toggle */
.tds-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #7C5842;
}

.toggle-checkbox {
  display: none;
}

.toggle-slider {
  width: 50px;
  height: 24px;
  background: #E8D5C4;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked + .toggle-slider {
  background: #4CAF50;
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.toggle-hint {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* TDS Input */
.tds-input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.tds-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tds-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #7C5842;
}

.tds-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tds-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 600;
}

.tds-input:focus {
  outline: none;
  border-color: #FF9800;
}

.tds-input.error {
  border-color: #F44336;
  background: #FFEBEE;
}

.tds-unit {
  font-size: 1rem;
  color: #A0796A;
  font-weight: 500;
}

.tds-hint {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}

.tds-device-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #7C5842;
}

.device-select,
.device-input {
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 0.95rem;
}

.device-select:focus,
.device-input:focus {
  outline: none;
  border-color: #FF9800;
}

/* TDS Results */
.tds-results {
  background: #F8F4F0;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E8D5C4;
}

.results-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.yield-calculation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.yield-formula {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.formula-text {
  font-size: 0.9rem;
  color: #666;
}

.formula-calculation {
  font-size: 0.85rem;
  color: #888;
  font-family: monospace;
}

.yield-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #E8D5C4;
}

.yield-value {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
}

.yield-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.yield-status.under {
  background: #FFEBEE;
  color: #D32F2F;
}

.yield-status.optimal {
  background: #E8F5E9;
  color: #388E3C;
}

.yield-status.over {
  background: #FFF3E0;
  color: #F57C00;
}

/* SCA Comparison Chart */
.sca-comparison {
  margin-top: 1rem;
}

.comparison-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
}

.comparison-chart {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chart-label {
  padding: 0.5rem;
  background: #F5F5F5;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #E0E0E0;
}

.chart-range {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.chart-range.under {
  background: #FFCDD2;
  color: #D32F2F;
}

.chart-range.optimal {
  background: #C8E6C9;
  color: #388E3C;
}

.chart-range.over {
  background: #FFE0B2;
  color: #F57C00;
}

.current-position {
  position: relative;
  height: 30px;
  background: #F5F5F5;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.position-indicator {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #7C5842;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Quality Metrics */
.quality-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: #F8F4F0;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E8D5C4;
  text-align: center;
  transition: all 0.2s ease;
}

.metric-card.disabled {
  opacity: 0.6;
  background: #F5F5F5;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 1.2rem;
}

.metric-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.metric-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.metric-status.under,
.metric-status.needs-improvement {
  background: #FFEBEE;
  color: #D32F2F;
}

.metric-status.optimal,
.metric-status.excellent {
  background: #E8F5E9;
  color: #388E3C;
}

.metric-status.over,
.metric-status.good {
  background: #E3F2FD;
  color: #1976D2;
}

/* Additional Measurements */
.additional-measurements {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.measurement-group {
  background: #F8F4F0;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E8D5C4;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.measurement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.measurement-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.measurement-label {
  font-size: 0.85rem;
  color: #7C5842;
  font-weight: 500;
}

.measurement-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.measurement-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
}

.measurement-input:focus {
  outline: none;
  border-color: #FF9800;
}

.measurement-unit {
  font-size: 0.8rem;
  color: #A0796A;
}

/* QC Notes */
.qc-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qc-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.qc-textarea:focus {
  outline: none;
  border-color: #FF9800;
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
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  border: 2px solid #FF9800;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #F57C00, #E65100);
  border-color: #F57C00;
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
  .tds-input-group {
    grid-template-columns: 1fr;
  }
  
  .quality-metrics {
    grid-template-columns: 1fr;
  }
  
  .measurement-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-chart {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>