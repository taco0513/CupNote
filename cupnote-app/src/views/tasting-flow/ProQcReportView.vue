<template>
  <div class="pro-qc-report-view">
    <!-- Header -->
    <header class="screen-header">
      <button class="back-btn" @click="$router.push('/result')">
        ←
      </button>
      <h1 class="screen-title">Pro QC 종합 리포트</h1>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: '100%' }"></div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- Report Summary -->
      <section class="report-summary">
        <div class="summary-header">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <h2 class="summary-title">SCA 품질 분석 종합 리포트</h2>
            <p class="summary-subtitle">{{ getCurrentDateTime() }}</p>
            <div class="coffee-info">
              <span class="coffee-name">{{ coffeeInfo.name || '커피명 없음' }}</span>
              <span class="coffee-origin">{{ coffeeInfo.origin || '원산지 미기록' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Overall Quality Score -->
        <div class="overall-score">
          <div class="score-circle" :style="{ background: `conic-gradient(${overallScoreColor} ${overallScorePercent}%, #e0e0e0 0%)` }">
            <div class="score-inner">
              <span class="score-value">{{ overallQualityScore }}</span>
              <span class="score-unit">/5.0</span>
            </div>
          </div>
          <div class="score-details">
            <h3 class="score-title">종합 품질 점수</h3>
            <p class="score-description">{{ qualityDescription }}</p>
            <div class="score-confidence">
              <span class="confidence-label">신뢰도:</span>
              <span class="confidence-value">{{ confidenceLevel }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SCA Compliance Analysis -->
      <section class="compliance-section">
        <h2 class="section-title">SCA 표준 준수 분석</h2>
        
        <div class="compliance-overview">
          <div class="compliance-score">
            <span class="compliance-value">{{ scaComplianceScore }}%</span>
            <span class="compliance-label">SCA 준수율</span>
          </div>
          <div class="compliance-grade" :class="complianceGradeClass">
            {{ complianceGrade }}
          </div>
        </div>

        <div class="compliance-breakdown">
          <div class="compliance-item" :class="{ 'compliant': brewingCompliance.ratio }">
            <div class="item-header">
              <span class="item-icon">⚖️</span>
              <span class="item-title">추출 비율</span>
            </div>
            <div class="item-value">{{ brewRatioValue }}</div>
            <div class="item-status">{{ brewingCompliance.ratio ? '적합' : '부적합' }}</div>
          </div>
          
          <div class="compliance-item" :class="{ 'compliant': brewingCompliance.temperature }">
            <div class="item-header">
              <span class="item-icon">🌡️</span>
              <span class="item-title">추출 온도</span>
            </div>
            <div class="item-value">{{ waterTemperature }}°C</div>
            <div class="item-status">{{ brewingCompliance.temperature ? '적합' : '부적합' }}</div>
          </div>
          
          <div class="compliance-item" :class="{ 'compliant': brewingCompliance.water_quality }">
            <div class="item-header">
              <span class="item-icon">💧</span>
              <span class="item-title">물 품질</span>
            </div>
            <div class="item-value">TDS {{ waterTds }}ppm, pH {{ waterPh }}</div>
            <div class="item-status">{{ brewingCompliance.water_quality ? '적합' : '부적합' }}</div>
          </div>
        </div>
      </section>

      <!-- Extraction Analysis -->
      <section class="extraction-section">
        <h2 class="section-title">추출 분석</h2>
        
        <div class="extraction-metrics">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">📈</span>
              <h3 class="metric-title">추출 수율</h3>
            </div>
            <div class="metric-value">{{ extractionYield }}%</div>
            <div class="metric-status" :class="yieldStatusClass">
              {{ yieldStatusText }}
            </div>
            <div class="metric-range">
              <span class="range-label">SCA 권장 범위:</span>
              <span class="range-value">18-22%</span>
            </div>
          </div>

          <div class="metric-card" v-if="tdsEnabled">
            <div class="metric-header">
              <span class="metric-icon">🔬</span>
              <h3 class="metric-title">TDS 농도</h3>
            </div>
            <div class="metric-value">{{ tdsValue }}%</div>
            <div class="metric-status" :class="tdsStatusClass">
              {{ tdsStatusText }}
            </div>
            <div class="metric-range">
              <span class="range-label">SCA 권장 범위:</span>
              <span class="range-value">1.15-1.45%</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-icon">⏱️</span>
              <h3 class="metric-title">추출 시간</h3>
            </div>
            <div class="metric-value">{{ totalBrewTime }}</div>
            <div class="metric-status" :class="timeStatusClass">
              {{ timeStatusText }}
            </div>
            <div class="metric-range">
              <span class="range-label">권장 범위:</span>
              <span class="range-value">{{ getTimeRangeForMethod() }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quality Predictions -->
      <section class="prediction-section">
        <h2 class="section-title">품질 예측 분석</h2>
        
        <div class="prediction-grid">
          <div class="prediction-card">
            <h3 class="prediction-title">추출 품질 예측</h3>
            <div class="prediction-score">{{ predictedQuality }}/5.0</div>
            <div class="prediction-factors">
              <h4 class="factors-title">영향 요소:</h4>
              <ul class="factors-list">
                <li v-for="factor in qualityFactors" :key="factor" class="factor-item">
                  {{ factor }}
                </li>
              </ul>
            </div>
          </div>

          <div class="prediction-card">
            <h3 class="prediction-title">개선 제안</h3>
            <div class="recommendations">
              <div v-for="rec in recommendations" :key="rec.category" class="recommendation-item">
                <div class="rec-header">
                  <span class="rec-icon">💡</span>
                  <span class="rec-category">{{ rec.category }}</span>
                </div>
                <p class="rec-text">{{ rec.action }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Environmental Conditions -->
      <section class="environment-section">
        <h2 class="section-title">환경 조건</h2>
        
        <div class="environment-grid">
          <div class="env-item">
            <span class="env-label">실내 온도</span>
            <span class="env-value">{{ roomTemp || 'N/A' }}°C</span>
          </div>
          <div class="env-item">
            <span class="env-label">습도</span>
            <span class="env-value">{{ humidity || 'N/A' }}%</span>
          </div>
          <div class="env-item">
            <span class="env-label">추출량</span>
            <span class="env-value">{{ brewVolume || 'N/A' }}ml</span>
          </div>
          <div class="env-item">
            <span class="env-label">드립 손실</span>
            <span class="env-value">{{ dripLoss || 'N/A' }}ml</span>
          </div>
        </div>
      </section>

      <!-- Equipment Information -->
      <section class="equipment-section">
        <h2 class="section-title">장비 정보</h2>
        
        <div class="equipment-details">
          <div class="equipment-item">
            <span class="equipment-label">추출 방법</span>
            <span class="equipment-value">{{ extractionMethod }}</span>
          </div>
          <div class="equipment-item" v-if="grinderModel">
            <span class="equipment-label">그라인더</span>
            <span class="equipment-value">{{ grinderModel }}</span>
          </div>
          <div class="equipment-item" v-if="filterType">
            <span class="equipment-label">필터</span>
            <span class="equipment-value">{{ getFilterTypeName(filterType) }}</span>
          </div>
          <div class="equipment-item" v-if="tdsDevice">
            <span class="equipment-label">TDS 미터</span>
            <span class="equipment-value">{{ getTdsDeviceName(tdsDevice) }}</span>
          </div>
        </div>

        <div class="equipment-notes" v-if="equipmentNotes">
          <h3 class="notes-title">추가 장비 설정</h3>
          <p class="notes-content">{{ equipmentNotes }}</p>
        </div>
      </section>

      <!-- QC Notes -->
      <section class="notes-section" v-if="qcNotes">
        <h2 class="section-title">QC 메모</h2>
        <div class="notes-content">
          <p>{{ qcNotes }}</p>
        </div>
      </section>
    </main>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/result')">
        돌아가기
      </button>
      <button type="button" class="btn-export" @click="showExportMenu = !showExportMenu">
        <span class="export-icon">📤</span>
        리포트 내보내기
      </button>
      
      <!-- Export Menu -->
      <div v-if="showExportMenu" class="export-menu">
        <button @click="exportAsJSON" class="export-option">
          <span class="option-icon">📄</span>
          JSON 파일
        </button>
        <button @click="exportAsCSV" class="export-option">
          <span class="option-icon">📊</span>
          CSV 파일
        </button>
        <button @click="exportAsPDF" class="export-option">
          <span class="option-icon">📑</span>
          PDF 인쇄
        </button>
        <button @click="exportAll" class="export-option">
          <span class="option-icon">📦</span>
          전체 내보내기
        </button>
      </div>
      <button type="button" class="btn-primary" @click="saveReport">
        리포트 저장
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'
import { 
  calculateScaComplianceScore, 
  predictQualityScore, 
  evaluateExtractionYield,
  getComplianceGrade,
  generateRecommendations,
  validateBrewTime,
  formatBrewTime
} from '../../utils/scaCalculations'
import { 
  exportReport as exportReportUtil, 
  printPDFReport, 
  downloadFile, 
  generateFilename,
  generateReportData 
} from '../../utils/reportGenerator'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// UI State
const showExportMenu = ref(false)

// Get data from store
const currentSession = computed(() => coffeeRecordStore.currentSession)
const proBrewingData = computed(() => currentSession.value.proBrewingData || {})
const qcMeasurementData = computed(() => currentSession.value.qcMeasurementData || {})
const coffeeInfo = computed(() => currentSession.value.coffeeInfo || {})

// Coffee Information
const coffeeAmount = computed(() => {
  return currentSession.value.homeCafeData?.recipe?.coffee_amount || 20
})

// Pro Brewing Data
const extractionMethod = computed(() => proBrewingData.value.extraction_method || 'pourover')
const brewRatio = computed(() => proBrewingData.value.brew_ratio || 16)
const waterTemperature = computed(() => proBrewingData.value.water_temp || 93)
const waterTds = computed(() => proBrewingData.value.water_tds || 150)
const waterPh = computed(() => proBrewingData.value.water_ph || 7.0)
const grinderModel = computed(() => proBrewingData.value.grinder_model)
const filterType = computed(() => proBrewingData.value.filter_type)
const equipmentNotes = computed(() => proBrewingData.value.equipment_notes)
const totalBrewTime = computed(() => proBrewingData.value.total_time || '2:30')

// QC Measurement Data
const tdsEnabled = computed(() => qcMeasurementData.value.tds_enabled || false)
const tdsValue = computed(() => qcMeasurementData.value.tds_value || 0)
const extractionYield = computed(() => qcMeasurementData.value.extraction_yield || 0)
const brewVolume = computed(() => qcMeasurementData.value.brew_volume || 320)
const dripLoss = computed(() => qcMeasurementData.value.drip_loss || 20)
const roomTemp = computed(() => qcMeasurementData.value.room_temp)
const humidity = computed(() => qcMeasurementData.value.humidity)
const predictedQuality = computed(() => qcMeasurementData.value.predicted_quality || 3.0)
const qcNotes = computed(() => qcMeasurementData.value.qc_notes)
const tdsDevice = computed(() => qcMeasurementData.value.tds_device)

// SCA Compliance
const brewingCompliance = computed(() => proBrewingData.value.sca_compliance || {})
const scaComplianceScore = computed(() => qcMeasurementData.value.sca_compliance_score || 0)

// Calculated values
const brewRatioValue = computed(() => `1:${brewRatio.value}`)

const overallQualityScore = computed(() => {
  return predictedQuality.value.toFixed(1)
})

const overallScorePercent = computed(() => {
  return (predictedQuality.value / 5.0) * 100
})

const overallScoreColor = computed(() => {
  const score = predictedQuality.value
  if (score >= 4.5) return '#4CAF50'
  if (score >= 4.0) return '#8BC34A'
  if (score >= 3.5) return '#CDDC39'
  if (score >= 3.0) return '#FFC107'
  if (score >= 2.5) return '#FF9800'
  return '#F44336'
})

const qualityDescription = computed(() => {
  const score = predictedQuality.value
  if (score >= 4.5) return '탁월한 품질'
  if (score >= 4.0) return '우수한 품질'
  if (score >= 3.5) return '좋은 품질'
  if (score >= 3.0) return '보통 품질'
  if (score >= 2.5) return '개선 필요'
  return '품질 개선 필요'
})

const confidenceLevel = computed(() => {
  // Calculate confidence based on data completeness
  let dataPoints = 0
  if (tdsEnabled.value && tdsValue.value) dataPoints++
  if (scaComplianceScore.value > 0) dataPoints++
  if (waterTemperature.value) dataPoints++
  if (brewRatio.value) dataPoints++
  if (totalBrewTime.value) dataPoints++
  
  return Math.round((dataPoints / 5) * 100)
})

const complianceGrade = computed(() => {
  const score = scaComplianceScore.value
  if (score >= 90) return 'A (우수)'
  if (score >= 70) return 'B (양호)'
  if (score >= 50) return 'C (보통)'
  return 'D (개선 필요)'
})

const complianceGradeClass = computed(() => {
  const score = scaComplianceScore.value
  if (score >= 90) return 'grade-a'
  if (score >= 70) return 'grade-b'
  if (score >= 50) return 'grade-c'
  return 'grade-d'
})

// Extraction Analysis
const yieldStatusClass = computed(() => {
  const yield = extractionYield.value
  if (yield < 18) return 'under'
  if (yield >= 18 && yield <= 22) return 'optimal'
  return 'over'
})

const yieldStatusText = computed(() => {
  const yield = extractionYield.value
  if (yield < 18) return '미추출'
  if (yield >= 18 && yield <= 22) return '적정'
  return '과추출'
})

const tdsStatusClass = computed(() => {
  if (!tdsEnabled.value) return 'not-measured'
  const tds = tdsValue.value
  if (tds < 1.15) return 'under'
  if (tds >= 1.15 && tds <= 1.45) return 'optimal'
  return 'over'
})

const tdsStatusText = computed(() => {
  if (!tdsEnabled.value) return '측정 안함'
  const tds = tdsValue.value
  if (tds < 1.15) return '낮음'
  if (tds >= 1.15 && tds <= 1.45) return '적정'
  return '높음'
})

const timeStatusClass = computed(() => {
  const timeValidation = validateBrewTime(parseTimeToSeconds(totalBrewTime.value), extractionMethod.value)
  return timeValidation.valid ? 'optimal' : 'suboptimal'
})

const timeStatusText = computed(() => {
  const timeValidation = validateBrewTime(parseTimeToSeconds(totalBrewTime.value), extractionMethod.value)
  return timeValidation.valid ? '적정' : '범위 벗어남'
})

// Quality factors and recommendations
const qualityFactors = computed(() => {
  const factors = []
  
  if (scaComplianceScore.value >= 80) {
    factors.push('SCA 기준 우수 준수')
  } else if (scaComplianceScore.value >= 60) {
    factors.push('SCA 기준 양호 준수')
  } else {
    factors.push('SCA 기준 개선 필요')
  }
  
  if (tdsEnabled.value && tdsValue.value) {
    const eval = evaluateExtractionYield(extractionYield.value)
    if (eval.status === 'optimal') {
      factors.push('최적 추출 수율')
    } else {
      factors.push(eval.description)
    }
  }
  
  return factors
})

const recommendations = computed(() => {
  const brewingData = {
    coffeeAmount: coffeeAmount.value,
    waterAmount: coffeeAmount.value * brewRatio.value,
    waterTemp: waterTemperature.value,
    waterTds: waterTds.value,
    waterPh: waterPh.value
  }
  
  const complianceResult = calculateScaComplianceScore(brewingData)
  return generateRecommendations(complianceResult.evaluations)
})

// Methods
const getCurrentDateTime = () => {
  const now = new Date()
  return now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeRangeForMethod = () => {
  const method = extractionMethod.value.toLowerCase()
  const ranges = {
    pourover: '2:30 - 6:00',
    immersion: '4:00 - 8:00',
    pressure: '0:25 - 0:35',
    'cold-brew': '12:00:00 - 24:00:00'
  }
  return ranges[method] || '2:30 - 6:00'
}

const parseTimeToSeconds = (timeString) => {
  if (!timeString) return 0
  const parts = timeString.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  return 0
}

const getFilterTypeName = (type) => {
  const names = {
    paper: '종이 필터',
    metal: '메탈 필터',
    cloth: '천 필터'
  }
  return names[type] || type
}

const getTdsDeviceName = (device) => {
  const names = {
    'atago-pal3': 'ATAGO PAL-3',
    'hanna-hi96801': 'Hanna HI96801',
    'milwaukee-ma871': 'Milwaukee MA871'
  }
  return names[device] || device
}

// Export functions
const exportAsJSON = () => {
  exportReportUtil(currentSession.value, ['json'])
  showExportMenu.value = false
}

const exportAsCSV = () => {
  exportReportUtil(currentSession.value, ['csv'])
  showExportMenu.value = false
}

const exportAsPDF = () => {
  const reportData = generateReportData(currentSession.value)
  printPDFReport(reportData)
  showExportMenu.value = false
}

const exportAll = () => {
  exportReportUtil(currentSession.value, ['json', 'csv'])
  showExportMenu.value = false
}

const saveReport = async () => {
  try {
    // Save report to coffee record store
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: parseFloat(overallQualityScore.value),
      scaCompliance: scaComplianceScore.value,
      extractionYield: extractionYield.value,
      recommendations: recommendations.value,
      confidenceLevel: confidenceLevel.value
    }
    
    coffeeRecordStore.updateCoffeeSetup({
      ...currentSession.value,
      proQcReport: reportData
    })
    
    // Show success message (could implement toast notification)
    alert('QC 리포트가 저장되었습니다.')
    
    // Navigate back to results
    router.push('/result')
  } catch (error) {
    console.error('Report save failed:', error)
    alert('리포트 저장 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.pro-qc-report-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #F3F8FF 0%, #E8F4FD 100%);
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
  color: #1976D2;
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
  background-color: rgba(25, 118, 210, 0.1);
}

.screen-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1976D2;
  margin-bottom: 0.5rem;
}

.progress-bar {
  max-width: 300px;
  height: 4px;
  background: #BBDEFB;
  border-radius: 2px;
  margin: 1rem auto 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1976D2;
  transition: width 0.3s ease;
}

/* Content */
.content {
  margin-bottom: 2rem;
}

/* Report Summary */
.report-summary {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  border: 1px solid #E3F2FD;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 0.5rem 0;
}

.summary-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0 0 1rem 0;
}

.coffee-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.coffee-name {
  font-weight: 600;
  color: #333;
  padding: 0.25rem 0.75rem;
  background: #E3F2FD;
  border-radius: 12px;
  font-size: 0.9rem;
}

.coffee-origin {
  color: #666;
  padding: 0.25rem 0.75rem;
  background: #F5F5F5;
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Overall Score */
.overall-score {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  border-radius: 16px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.score-inner {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1976D2;
}

.score-unit {
  font-size: 0.9rem;
  color: #666;
  margin-top: -0.25rem;
}

.score-details {
  flex: 1;
}

.score-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 0.5rem 0;
}

.score-description {
  font-size: 1rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.score-confidence {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.confidence-label {
  font-size: 0.9rem;
  color: #666;
}

.confidence-value {
  font-weight: 600;
  color: #1976D2;
}

/* Section Styles */
.compliance-section,
.extraction-section,
.prediction-section,
.environment-section,
.equipment-section,
.notes-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.1);
  border: 1px solid #E3F2FD;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976D2;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #E3F2FD;
  padding-bottom: 0.5rem;
}

/* Compliance Overview */
.compliance-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #F8FBFF;
  border-radius: 12px;
}

.compliance-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compliance-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1976D2;
}

.compliance-label {
  font-size: 0.9rem;
  color: #666;
}

.compliance-grade {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.compliance-grade.grade-a {
  background: #E8F5E9;
  color: #2E7D32;
}

.compliance-grade.grade-b {
  background: #E3F2FD;
  color: #1976D2;
}

.compliance-grade.grade-c {
  background: #FFF3E0;
  color: #F57C00;
}

.compliance-grade.grade-d {
  background: #FFEBEE;
  color: #D32F2F;
}

/* Compliance Breakdown */
.compliance-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.compliance-item {
  padding: 1rem;
  background: #F8FBFF;
  border-radius: 12px;
  border: 2px solid #FFCDD2;
  text-align: center;
}

.compliance-item.compliant {
  border-color: #C8E6C9;
  background: #F1F8E9;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.item-icon {
  font-size: 1.2rem;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.item-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1976D2;
  margin-bottom: 0.25rem;
}

.item-status {
  font-size: 0.8rem;
  font-weight: 600;
  color: #D32F2F;
}

.compliance-item.compliant .item-status {
  color: #2E7D32;
}

/* Extraction Metrics */
.extraction-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1.5rem;
  background: #F8FBFF;
  border-radius: 12px;
  border: 1px solid #E3F2FD;
  text-align: center;
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
  font-size: 1rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1976D2;
  margin-bottom: 0.5rem;
}

.metric-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.metric-status.under,
.metric-status.suboptimal {
  background: #FFEBEE;
  color: #D32F2F;
}

.metric-status.optimal {
  background: #E8F5E9;
  color: #2E7D32;
}

.metric-status.over {
  background: #FFF3E0;
  color: #F57C00;
}

.metric-status.not-measured {
  background: #F5F5F5;
  color: #666;
}

.metric-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.range-label {
  font-size: 0.8rem;
  color: #666;
}

.range-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1976D2;
}

/* Prediction Grid */
.prediction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.prediction-card {
  padding: 1.5rem;
  background: #F8FBFF;
  border-radius: 12px;
  border: 1px solid #E3F2FD;
}

.prediction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 1rem 0;
  text-align: center;
}

.prediction-score {
  font-size: 2rem;
  font-weight: 700;
  color: #1976D2;
  text-align: center;
  margin-bottom: 1rem;
}

.prediction-factors {
  margin-top: 1rem;
}

.factors-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.factors-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.factor-item {
  font-size: 0.85rem;
  color: #666;
  padding: 0.25rem 0;
  border-left: 3px solid #E3F2FD;
  padding-left: 0.75rem;
  margin-bottom: 0.25rem;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #E3F2FD;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rec-icon {
  font-size: 1rem;
}

.rec-category {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1976D2;
}

.rec-text {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* Environment Grid */
.environment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.env-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #F8FBFF;
  border-radius: 12px;
  text-align: center;
}

.env-label {
  font-size: 0.85rem;
  color: #666;
}

.env-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976D2;
}

/* Equipment Details */
.equipment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.equipment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #F8FBFF;
  border-radius: 8px;
}

.equipment-label {
  font-size: 0.9rem;
  color: #666;
}

.equipment-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1976D2;
}

.equipment-notes {
  padding: 1rem;
  background: #F8FBFF;
  border-radius: 12px;
}

.notes-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 0.5rem 0;
}

.notes-content {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
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
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(25, 118, 210, 0.1);
  position: relative;
}

.btn-primary,
.btn-secondary,
.btn-export {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  color: white;
  border-color: #1976D2;
  flex: 1;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1565C0, #0D47A1);
  border-color: #1565C0;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #1976D2;
  border-color: #E3F2FD;
  flex: 1;
}

.btn-secondary:hover {
  border-color: #BBDEFB;
  transform: translateY(-1px);
}

.btn-export {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  border-color: #4CAF50;
  flex: 1;
}

.btn-export:hover {
  background: linear-gradient(135deg, #388E3C, #2E7D32);
  border-color: #388E3C;
  transform: translateY(-1px);
}

.export-icon {
  font-size: 1rem;
}

/* Export Menu */
.export-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.15);
  border: 1px solid #E3F2FD;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 1000;
  min-width: 200px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1976D2;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.export-option:hover {
  background: #E3F2FD;
  transform: translateX(2px);
}

.option-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .overall-score {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .compliance-breakdown,
  .extraction-metrics,
  .prediction-grid,
  .environment-grid,
  .equipment-details {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .compliance-overview {
    flex-direction: column;
    gap: 1rem;
  }
  
  .export-menu {
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
}
</style>