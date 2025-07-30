<template>
  <div class="home-cafe-view">
    <!-- Header -->
    <header class="screen-header">
      <button class="back-btn" @click="$router.push('/coffee-info')">
        ←
      </button>
      <h1 class="screen-title">홈카페 설정</h1>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: '43%' }"></div>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <!-- Dripper Selection -->
      <section class="dripper-section">
        <h2 class="section-title">드리퍼 선택</h2>
        <div class="dripper-grid">
          <button
            v-for="dripper in drippers"
            :key="dripper.value"
            :class="['dripper-btn', { active: selectedDripper === dripper.value }]"
            @click="selectedDripper = dripper.value"
          >
            <span class="dripper-icon">{{ dripper.icon }}</span>
            <span class="dripper-name">{{ dripper.name }}</span>
          </button>
        </div>
      </section>

      <!-- Recipe Settings -->
      <section class="recipe-section">
        <h2 class="section-title">레시피 설정</h2>
        
        <!-- Coffee Amount -->
        <div class="recipe-field">
          <h3 class="field-label">원두량</h3>
          <div class="dial-control">
            <button 
              class="dial-btn minus" 
              @click="adjustCoffeeAmount(-1)"
              :disabled="coffeeAmount <= 10"
            >
              -
            </button>
            <div class="dial-display">
              <span class="amount">{{ coffeeAmount }}</span>
              <span class="unit">g</span>
            </div>
            <button 
              class="dial-btn plus" 
              @click="adjustCoffeeAmount(1)"
              :disabled="coffeeAmount >= 50"
            >
              +
            </button>
          </div>
          <div class="water-calculation">
            <span class="water-label">물량:</span>
            <span class="water-amount">{{ waterAmount }}ml</span>
          </div>
        </div>

        <!-- Ratio Presets -->
        <div class="recipe-field">
          <h3 class="field-label">추출 비율</h3>
          <div class="ratio-buttons">
            <button
              v-for="preset in ratioPresets"
              :key="preset.value"
              :class="['ratio-btn', { active: ratio === preset.value }]"
              @click="ratio = preset.value"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Water Temperature -->
        <div class="recipe-field">
          <h3 class="field-label">물 온도</h3>
          <div class="temp-input">
            <input
              v-model.number="waterTemp"
              type="number"
              min="80"
              max="100"
              class="temp-field"
            />
            <span class="temp-unit">°C</span>
          </div>
        </div>

        <!-- Brew Timer -->
        <div class="recipe-field">
          <h3 class="field-label">추출 타이머</h3>
          <div class="timer-container">
            <div class="timer-display">
              <span class="timer-time">{{ formatTime(elapsedTime) }}</span>
            </div>
            <div class="timer-controls">
              <button 
                v-if="!isTimerRunning" 
                class="timer-btn start"
                @click="startTimer"
              >
                시작
              </button>
              <button 
                v-else 
                class="timer-btn stop"
                @click="stopTimer"
              >
                정지
              </button>
              <button 
                v-if="elapsedTime > 0" 
                class="timer-btn reset"
                @click="resetTimer"
              >
                리셋
              </button>
            </div>
            <div v-if="lapTimes.length > 0" class="lap-times">
              <div 
                v-for="(lap, index) in lapTimes" 
                :key="index"
                class="lap-time"
              >
                <span class="lap-label">Lap {{ index + 1 }}:</span>
                <span class="lap-value">{{ formatTime(lap) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Note -->
        <div class="recipe-field">
          <h3 class="field-label">간단 메모</h3>
          <input
            v-model="quickNote"
            type="text"
            placeholder="예: 첫 번째 붓기 30초, 천천히 추출"
            class="note-field"
          />
        </div>
      </section>

      <!-- Personal Recipe -->
      <section class="personal-recipe">
        <div class="recipe-actions">
          <button 
            class="save-recipe-btn"
            @click="saveRecipe"
          >
            <span class="save-icon">💾</span>
            나의 커피로 저장
          </button>
          <button 
            v-if="savedRecipe"
            class="load-recipe-btn"
            @click="loadRecipe"
          >
            <span class="load-icon">📂</span>
            나의 커피 불러오기
          </button>
        </div>
      </section>
    </main>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.push('/coffee-info')">
        이전
      </button>
      <button type="button" class="btn-primary" @click="handleNext">
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// Dripper options
const drippers = [
  { value: 'v60', name: 'V60', icon: '⭕' },
  { value: 'kalita', name: 'Kalita Wave', icon: '〰️' },
  { value: 'origami', name: 'Origami', icon: '🌸' },
  { value: 'chemex', name: 'Chemex', icon: '⏳' },
  { value: 'fellow', name: 'Fellow Stagg', icon: '🔷' },
  { value: 'april', name: 'April', icon: '🌙' },
  { value: 'orea', name: 'Orea', icon: '🔵' },
  { value: 'flower', name: 'Flower', icon: '🌺' },
  { value: 'blue-bottle', name: 'Blue Bottle', icon: '💙' },
  { value: 'timemore', name: 'Timemore', icon: '💎' }
]

// Ratio presets
const ratioPresets = [
  { value: 15, label: '1:15' },
  { value: 15.5, label: '1:15.5' },
  { value: 16, label: '1:16' },
  { value: 16.5, label: '1:16.5' },
  { value: 17, label: '1:17' },
  { value: 17.5, label: '1:17.5' },
  { value: 18, label: '1:18' }
]

// State
const selectedDripper = ref('v60')
const coffeeAmount = ref(20)
const ratio = ref(16)
const waterTemp = ref(92)
const quickNote = ref('')
const savedRecipe = ref(null)

// Timer state
const isTimerRunning = ref(false)
const elapsedTime = ref(0)
const lapTimes = ref([])
let timerInterval = null

// Computed
const waterAmount = computed(() => Math.round(coffeeAmount.value * ratio.value))

const currentMode = computed(() => tastingSessionStore.currentSession.mode || 'homecafe')

// Methods
const adjustCoffeeAmount = (delta) => {
  const newAmount = coffeeAmount.value + delta
  if (newAmount >= 10 && newAmount <= 50) {
    coffeeAmount.value = newAmount
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  isTimerRunning.value = true
  const startTime = Date.now() - elapsedTime.value * 1000
  
  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime) / 1000)
  }, 100)
}

const stopTimer = () => {
  isTimerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  // Add lap time
  if (elapsedTime.value > 0) {
    lapTimes.value.push(elapsedTime.value)
  }
}

const resetTimer = () => {
  isTimerRunning.value = false
  elapsedTime.value = 0
  lapTimes.value = []
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const saveRecipe = () => {
  const recipe = {
    name: '나의 커피',
    coffee_amount: coffeeAmount.value,
    water_amount: waterAmount.value,
    ratio: ratio.value,
    saved_at: new Date().toISOString()
  }
  
  // Save to localStorage (in real app, use AsyncStorage)
  localStorage.setItem('homecafe_my_coffee_recipe', JSON.stringify(recipe))
  savedRecipe.value = recipe
  
  alert('레시피가 저장되었습니다!')
}

const loadRecipe = () => {
  if (savedRecipe.value) {
    coffeeAmount.value = savedRecipe.value.coffee_amount
    ratio.value = savedRecipe.value.ratio
    alert('레시피를 불러왔습니다!')
  }
}

const handleNext = () => {
  // Save HomeCafe data to store
  const homeCafeData = {
    dripper: selectedDripper.value,
    recipe: {
      coffee_amount: coffeeAmount.value,
      water_amount: waterAmount.value,
      ratio: ratio.value,
      water_temp: waterTemp.value,
      brew_time: elapsedTime.value,
      lap_times: lapTimes.value
    },
    quick_note: quickNote.value
  }
  
  // Update brewing method
  const dripperName = drippers.find(d => d.value === selectedDripper.value)?.name || selectedDripper.value
  const brewingMethod = `${dripperName} - ${coffeeAmount.value}g, 1:${ratio.value}, ${waterTemp.value}°C`
  
  // Update coffee info with brewing method
  tastingSessionStore.updateCoffeeSetup({
    brewing_method: brewingMethod
  })
  
  // Update HomeCafe specific data
  tastingSessionStore.updateHomeCafeData(homeCafeData)
  
  // Navigate based on mode
  if (currentMode.value === 'pro') {
    router.push('/pro-brewing')
  } else {
    router.push('/flavor-selection')
  }
}

// Load saved recipe on mount
onMounted(() => {
  const saved = localStorage.getItem('homecafe_my_coffee_recipe')
  if (saved) {
    savedRecipe.value = JSON.parse(saved)
  }
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.home-cafe-view {
  max-width: 600px;
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

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
  border-bottom: 2px solid #E8D5C4;
  padding-bottom: 0.5rem;
}

/* Dripper Grid */
.dripper-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

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
  align-items: center;
  gap: 0.25rem;
}

.dripper-btn:hover {
  border-color: #D4B896;
  transform: translateY(-1px);
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
  font-size: 0.8rem;
  font-weight: 500;
}

/* Recipe Section */
.recipe-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

.recipe-field {
  margin-bottom: 1.5rem;
}

.recipe-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
}

/* Dial Control */
.dial-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.dial-btn {
  background: #7C5842;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dial-btn:hover:not(:disabled) {
  background: #5D3F2E;
  transform: scale(1.1);
}

.dial-btn:disabled {
  background: #CCC;
  cursor: not-allowed;
}

.dial-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
}

.unit {
  font-size: 1.2rem;
  color: #A0796A;
}

.water-calculation {
  text-align: center;
  padding: 0.5rem;
  background: #F8F4F0;
  border-radius: 8px;
}

.water-label {
  color: #A0796A;
  margin-right: 0.5rem;
}

.water-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
}

/* Ratio Buttons */
.ratio-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 0.5rem;
}

.ratio-btn {
  background: white;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  padding: 0.5rem;
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

/* Temperature Input */
.temp-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.temp-field {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
}

.temp-field:focus {
  outline: none;
  border-color: #7C5842;
}

.temp-unit {
  font-size: 1rem;
  color: #A0796A;
}

/* Timer */
.timer-container {
  background: #F8F4F0;
  border-radius: 8px;
  padding: 1rem;
}

.timer-display {
  text-align: center;
  margin-bottom: 1rem;
}

.timer-time {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
  font-family: monospace;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.timer-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-btn.start {
  background: #4CAF50;
  color: white;
}

.timer-btn.stop {
  background: #F44336;
  color: white;
}

.timer-btn.reset {
  background: #757575;
  color: white;
}

.timer-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.lap-times {
  margin-top: 1rem;
  border-top: 1px solid #E8D5C4;
  padding-top: 1rem;
}

.lap-time {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.lap-label {
  color: #A0796A;
}

.lap-value {
  font-weight: 500;
  color: #7C5842;
  font-family: monospace;
}

/* Note Field */
.note-field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
}

.note-field:focus {
  outline: none;
  border-color: #7C5842;
}

/* Personal Recipe */
.personal-recipe {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

.recipe-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.save-recipe-btn,
.load-recipe-btn {
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1rem;
  border: 2px solid #7C5842;
  border-radius: 8px;
  background: white;
  color: #7C5842;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.save-recipe-btn:hover,
.load-recipe-btn:hover {
  background: #7C5842;
  color: white;
  transform: translateY(-1px);
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
  .dripper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .ratio-buttons {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .recipe-actions {
    flex-direction: column;
  }
  
  .save-recipe-btn,
  .load-recipe-btn {
    width: 100%;
  }
}
</style>