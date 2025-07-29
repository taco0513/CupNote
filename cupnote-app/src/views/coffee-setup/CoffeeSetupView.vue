<template>
  <div class="coffee-setup-view">
    <!-- Header -->
    <header class="setup-header">
      <h1 class="setup-title">
        ☕ 커피 정보 입력
      </h1>
      <p class="setup-subtitle">
        {{ modeLabels[currentMode] }} 모드
      </p>
    </header>

    <!-- Mode Selection -->
    <section class="mode-selection">
      <h2 class="section-title">모드 선택</h2>
      <div class="mode-buttons">
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="['mode-btn', { active: currentMode === mode.value }]"
          @click="currentMode = mode.value"
        >
          <span class="mode-icon">{{ mode.icon }}</span>
          <span class="mode-label">{{ mode.label }}</span>
          <span class="mode-desc">{{ mode.description }}</span>
        </button>
      </div>
    </section>

    <!-- Coffee Info Form -->
    <form @submit.prevent="handleSubmit" class="coffee-form">
      <!-- Basic Info (All Modes) -->
      <section class="form-section">
        <h3 class="section-title">기본 정보</h3>
        
        <div class="input-group">
          <label for="cafeName" class="input-label required">카페 이름</label>
          <input
            id="cafeName"
            v-model="formData.cafeName"
            type="text"
            class="input-field"
            placeholder="예: 스타벅스 강남점"
            required
          />
        </div>

        <div class="input-group">
          <label for="coffeeName" class="input-label required">커피 이름</label>
          <input
            id="coffeeName"
            v-model="formData.coffeeName"
            type="text"
            class="input-field"
            placeholder="예: 아메리카노, 에티오피아 예가체프"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label required">온도</label>
          <div class="radio-group">
            <label class="radio-item">
              <input
                v-model="formData.temperature"
                type="radio"
                value="hot"
                class="radio-input"
              />
              <span class="radio-label">🔥 HOT</span>
            </label>
            <label class="radio-item">
              <input
                v-model="formData.temperature"
                type="radio"
                value="iced"
                class="radio-input"
              />
              <span class="radio-label">❄️ ICED</span>
            </label>
          </div>
        </div>

        <!-- Optional Fields (Collapsible) -->
        <div class="optional-section">
          <button
            type="button"
            class="expand-btn"
            @click="showOptionalFields = !showOptionalFields"
          >
            <span>선택 정보 {{ showOptionalFields ? '접기' : '펼치기' }}</span>
            <span class="expand-icon">{{ showOptionalFields ? '▲' : '▼' }}</span>
          </button>
          
          <div v-show="showOptionalFields" class="optional-fields">
            <div class="input-group">
              <label for="origin" class="input-label">원산지</label>
              <input
                id="origin"
                v-model="formData.origin"
                type="text"
                class="input-field"
                placeholder="예: 에티오피아, 콜롬비아"
              />
            </div>

            <div class="input-group">
              <label for="variety" class="input-label">품종</label>
              <input
                id="variety"
                v-model="formData.variety"
                type="text"
                class="input-field"
                placeholder="예: 아라비카, 게이샤"
              />
            </div>

            <div class="input-group">
              <label for="process" class="input-label">가공방식</label>
              <select
                id="process"
                v-model="formData.process"
                class="select-field"
              >
                <option value="">선택하세요</option>
                <option value="washed">워시드</option>
                <option value="natural">내추럴</option>
                <option value="honey">허니</option>
                <option value="anaerobic">무산소</option>
              </select>
            </div>

            <div class="input-group">
              <label for="roastLevel" class="input-label">로스팅 레벨</label>
              <select
                id="roastLevel"
                v-model="formData.roastLevel"
                class="select-field"
              >
                <option value="">선택하세요</option>
                <option value="light">라이트</option>
                <option value="medium">미디엄</option>
                <option value="dark">다크</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Brew Settings (HomeCafe + Lab Modes) -->
      <section v-if="showBrewSettings" class="form-section">
        <h3 class="section-title">브루잉 설정</h3>
        
        <div class="input-group">
          <label class="input-label">드리퍼</label>
          <div class="dripper-grid">
            <button
              v-for="dripper in drippers"
              :key="dripper.value"
              type="button"
              :class="['dripper-btn', { active: formData.dripper === dripper.value }]"
              @click="formData.dripper = dripper.value"
            >
              <span class="dripper-icon">{{ dripper.icon }}</span>
              <span class="dripper-name">{{ dripper.name }}</span>
            </button>
          </div>
        </div>

        <div class="brew-controls">
          <div class="input-group">
            <label for="coffeeAmount" class="input-label">원두량</label>
            <div class="amount-control">
              <button
                type="button"
                class="amount-btn"
                @click="adjustAmount(-1)"
                :disabled="formData.coffeeAmount <= 15"
              >
                -
              </button>
              <span class="amount-display">{{ formData.coffeeAmount }}g</span>
              <button
                type="button"
                class="amount-btn"
                @click="adjustAmount(1)"
                :disabled="formData.coffeeAmount >= 25"
              >
                +
              </button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">비율</label>
            <div class="ratio-buttons">
              <button
                v-for="ratio in ratios"
                :key="ratio.value"
                type="button"
                :class="['ratio-btn', { active: formData.ratio === ratio.value }]"
                @click="formData.ratio = ratio.value"
              >
                {{ ratio.label }}
              </button>
            </div>
          </div>

          <div class="calculated-info">
            <span class="calc-label">물량:</span>
            <span class="calc-value">{{ calculatedWater }}ml</span>
          </div>
        </div>
      </section>

      <!-- Lab Data (Lab Mode Only) -->
      <section v-if="currentMode === 'lab'" class="form-section">
        <h3 class="section-title">실험 데이터</h3>
        
        <div class="lab-controls">
          <div class="input-group">
            <label for="grindSize" class="input-label">분쇄도</label>
            <select
              id="grindSize"
              v-model="formData.grindSize"
              class="select-field"
            >
              <option value="">선택하세요</option>
              <option value="coarse">Coarse</option>
              <option value="medium">Medium</option>
              <option value="fine">Fine</option>
              <option value="extra-fine">Extra Fine</option>
            </select>
          </div>

          <div class="input-group">
            <label for="waterTemp" class="input-label">물온도</label>
            <div class="temp-control">
              <button
                type="button"
                class="temp-btn"
                @click="adjustTemp(-1)"
                :disabled="formData.waterTemp <= 85"
              >
                -
              </button>
              <span class="temp-display">{{ formData.waterTemp }}°C</span>
              <button
                type="button"
                class="temp-btn"
                @click="adjustTemp(1)"
                :disabled="formData.waterTemp >= 100"
              >
                +
              </button>
            </div>
          </div>

          <div class="input-group">
            <label for="tds" class="input-label">TDS</label>
            <input
              id="tds"
              v-model.number="formData.tds"
              type="number"
              step="0.01"
              class="input-field"
              placeholder="1.35"
            />
            <span class="input-unit">%</span>
          </div>

          <div class="input-group">
            <label for="extractionYield" class="input-label">추출 수율</label>
            <input
              id="extractionYield"
              v-model.number="formData.extractionYield"
              type="number"
              step="0.1"
              class="input-field"
              placeholder="20.0"
            />
            <span class="input-unit">%</span>
          </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button type="button" class="btn-secondary" @click="$router.go(-1)">
          취소
        </button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          다음 단계
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// Mode Configuration
const modes = [
  {
    value: 'cafe',
    label: '카페',
    icon: '🏪',
    description: '간단한 정보만'
  },
  {
    value: 'homecafe',
    label: '홈카페',
    icon: '🏠',
    description: '브루잉 설정 포함'
  },
  {
    value: 'lab',
    label: '랩',
    icon: '🔬',
    description: '전문적인 데이터'
  }
]

const modeLabels = {
  cafe: '카페',
  homecafe: '홈카페',
  lab: '랩'
}

// State
const currentMode = ref('cafe')
const showOptionalFields = ref(false)

// Form Data
const formData = ref({
  // Basic Info
  cafeName: '',
  coffeeName: '',
  temperature: 'hot',
  origin: '',
  variety: '',
  process: '',
  roastLevel: '',
  
  // Brew Settings
  dripper: 'v60',
  coffeeAmount: 20,
  ratio: 16,
  
  // Lab Data
  grindSize: '',
  waterTemp: 93,
  tds: null,
  extractionYield: null
})

// Options
const drippers = [
  { value: 'v60', name: 'V60', icon: '⭕' },
  { value: 'kalita', name: 'Kalita', icon: '🔺' },
  { value: 'chemex', name: 'Chemex', icon: '⌛' },
  { value: 'aeropress', name: 'Aeropress', icon: '🔥' },
  { value: 'french-press', name: 'French Press', icon: '☕' }
]

const ratios = [
  { value: 15, label: '1:15' },
  { value: 16, label: '1:16' },
  { value: 17, label: '1:17' }
]

// Computed Properties
const showBrewSettings = computed(() => 
  currentMode.value === 'homecafe' || currentMode.value === 'lab'
)

const calculatedWater = computed(() => 
  Math.round(formData.value.coffeeAmount * formData.value.ratio)
)

const isFormValid = computed(() => {
  const { cafeName, coffeeName, temperature } = formData.value
  return cafeName.trim() && coffeeName.trim() && temperature
})

// Methods
const adjustAmount = (delta) => {
  const newAmount = formData.value.coffeeAmount + delta
  if (newAmount >= 15 && newAmount <= 25) {
    formData.value.coffeeAmount = newAmount
  }
}

const adjustTemp = (delta) => {
  const newTemp = formData.value.waterTemp + delta
  if (newTemp >= 85 && newTemp <= 100) {
    formData.value.waterTemp = newTemp
  }
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  // Create location string based on mode
  const location = currentMode.value === 'cafe' 
    ? formData.value.cafeName 
    : currentMode.value === 'homecafe' 
      ? '홈카페' 
      : '랩'
  
  // Create brewing method string
  let brewingMethod = `${currentMode.value === 'cafe' ? '카페' : formData.value.dripper || '기타'}`
  
  if (currentMode.value !== 'cafe') {
    brewingMethod += ` - ${formData.value.coffeeAmount}g, 1:${formData.value.ratio}`
    if (currentMode.value === 'lab' && formData.value.waterTemp) {
      brewingMethod += `, ${formData.value.waterTemp}°C`
    }
  }
  
  // Save to store
  coffeeRecordStore.updateCoffeeSetup({
    coffeeName: formData.value.coffeeName,
    cafeName: formData.value.cafeName,
    location: location,
    brewingMethod: brewingMethod
  })
  
  console.log('Coffee setup saved:', coffeeRecordStore.currentSession)
  
  // Navigate to flavor selection
  router.push('/flavor-selection')
}

// Reset form when mode changes
watch(currentMode, () => {
  showOptionalFields.value = false
})
</script>

<style scoped>
.coffee-setup-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

.setup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.setup-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.setup-subtitle {
  color: #A0796A;
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
  border-bottom: 2px solid #E8D5C4;
  padding-bottom: 0.5rem;
}

/* Mode Selection */
.mode-selection {
  margin-bottom: 2rem;
}

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.mode-btn {
  background: white;
  border: 2px solid #E8D5C4;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-btn:hover {
  border-color: #D4B896;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 88, 66, 0.2);
}

.mode-btn.active {
  border-color: #7C5842;
  background: #7C5842;
  color: white;
}

.mode-icon {
  font-size: 2rem;
}

.mode-label {
  font-weight: 600;
  font-size: 1.1rem;
}

.mode-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Form Styles */
.coffee-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.input-label.required::after {
  content: ' *';
  color: #E74C3C;
}

.input-field,
.select-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #7C5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.input-unit {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #A0796A;
  font-size: 0.9rem;
}

/* Radio Groups */
.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-input {
  margin-right: 0.5rem;
}

.radio-label {
  font-size: 1.1rem;
}

/* Optional Fields */
.optional-section {
  margin-top: 1.5rem;
}

.expand-btn {
  background: #F8F4F0;
  border: 1px solid #E8D5C4;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #7C5842;
  transition: background-color 0.2s ease;
}

.expand-btn:hover {
  background: #F0E8DC;
}

.optional-fields {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E8D5C4;
}

/* Dripper Grid */
.dripper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
}

.dripper-btn {
  background: white;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  padding: 1rem 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dripper-btn:hover {
  border-color: #D4B896;
}

.dripper-btn.active {
  border-color: #7C5842;
  background: #7C5842;
  color: white;
}

.dripper-icon {
  font-size: 1.5rem;
}

.dripper-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Brew Controls */
.brew-controls {
  display: grid;
  gap: 1rem;
}

.amount-control,
.temp-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.amount-btn,
.temp-btn {
  background: #7C5842;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.amount-btn:hover:not(:disabled),
.temp-btn:hover:not(:disabled) {
  background: #5D3F2E;
}

.amount-btn:disabled,
.temp-btn:disabled {
  background: #CCC;
  cursor: not-allowed;
}

.amount-display,
.temp-display {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  min-width: 60px;
  text-align: center;
}

.ratio-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.ratio-btn {
  background: white;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.ratio-btn:hover {
  border-color: #D4B896;
}

.ratio-btn.active {
  border-color: #7C5842;
  background: #7C5842;
  color: white;
}

.calculated-info {
  text-align: center;
  padding: 1rem;
  background: #F8F4F0;
  border-radius: 8px;
  border: 1px solid #E8D5C4;
}

.calc-label {
  color: #A0796A;
  margin-right: 0.5rem;
}

.calc-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
}

/* Lab Controls */
.lab-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E8D5C4;
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

.btn-primary:hover:not(:disabled) {
  background: #5D3F2E;
  border-color: #5D3F2E;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #CCC;
  border-color: #CCC;
  cursor: not-allowed;
  transform: none;
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

/* Responsive Design */
@media (max-width: 768px) {
  .coffee-setup-view {
    padding: 0.5rem;
  }
  
  .coffee-form {
    padding: 1.5rem;
  }
  
  .setup-title {
    font-size: 1.5rem;
  }
  
  .mode-buttons {
    grid-template-columns: 1fr;
  }
  
  .dripper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>