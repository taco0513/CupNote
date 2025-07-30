<template>
  <div class="result-view">
    <!-- Header -->
    <header class="result-header">
      <h1 class="result-title">🎉 테이스팅 완료!</h1>
      <p class="result-subtitle">당신의 커피 감각을 확인해보세요</p>
    </header>

    <!-- Coffee Info Card -->
    <section class="coffee-card">
      <div class="coffee-info">
        <h2 class="coffee-name">{{ mockCoffeeInfo.name }}</h2>
        <p class="cafe-name">{{ mockCoffeeInfo.cafe }}</p>
        <div class="brewing-method">
          <span class="method-icon">☕</span>
          <span class="method-text">{{ mockCoffeeInfo.method }}</span>
        </div>
      </div>
    </section>

    <!-- Match Score -->
    <section class="match-score-section">
      <div class="score-container">
        <div class="score-circle" :class="scoreClass">
          <div class="score-progress" :style="{ '--progress': progressPercent }">
            <div class="score-inner">
              <div class="score-number">{{ matchScore }}</div>
              <div class="score-label">MATCH</div>
            </div>
          </div>
        </div>
        <div class="score-message">
          <h3 class="message-text">{{ scoreMessage }}</h3>
          <p class="message-desc">{{ scoreDescription }}</p>
        </div>
      </div>
    </section>

    <!-- Your Selections Summary -->
    <section class="selections-summary">
      <h3 class="summary-title">선택하신 표현들</h3>
      
      <!-- Flavors -->
      <div v-if="selectedFlavors.length > 0" class="selection-group">
        <h4 class="group-title">🌸 향미</h4>
        <div class="selection-tags">
          <span
            v-for="flavor in selectedFlavors"
            :key="flavor.id"
            class="selection-tag flavor-tag"
          >
            {{ flavor.text }}
          </span>
        </div>
      </div>

      <!-- Sensory Expressions -->
      <div v-if="selectedSensory.length > 0" class="selection-group">
        <h4 class="group-title">👅 감각</h4>
        <div class="selection-tags">
          <span
            v-for="sensory in selectedSensory"
            :key="sensory.id"
            class="selection-tag sensory-tag"
          >
            <span class="sensory-category">[{{ sensory.category }}]</span>
            <span class="sensory-text">{{ sensory.text }}</span>
          </span>
        </div>
      </div>

      <!-- Personal Notes -->
      <div v-if="personalNotes" class="selection-group">
        <h4 class="group-title">📝 개인 메모</h4>
        <div class="personal-notes">
          <p class="notes-text">{{ personalNotes }}</p>
        </div>
      </div>
    </section>

    <!-- Score Breakdown -->
    <section class="score-breakdown">
      <h3 class="breakdown-title">상세 분석</h3>
      <div class="breakdown-items">
        <div class="breakdown-item">
          <div class="item-header">
            <span class="item-icon">🌸</span>
            <span class="item-name">향미 매칭</span>
            <span class="item-score">{{ flavorMatchScore }}%</span>
          </div>
          <div class="item-bar">
            <div 
              class="item-progress" 
              :style="{ width: flavorMatchScore + '%' }"
            ></div>
          </div>
        </div>

        <div class="breakdown-item">
          <div class="item-header">
            <span class="item-icon">👅</span>
            <span class="item-name">감각 표현</span>
            <span class="item-score">{{ sensoryMatchScore }}%</span>
          </div>
          <div class="item-bar">
            <div 
              class="item-progress" 
              :style="{ width: sensoryMatchScore + '%' }"
            ></div>
          </div>
        </div>

        <div class="breakdown-item">
          <div class="item-header">
            <span class="item-icon">📋</span>
            <span class="item-name">로스터 노트</span>
            <span class="item-score">{{ roasterNoteBonus > 0 ? '+' + roasterNoteBonus : roasterNoteBonus }}%</span>
          </div>
          <div class="item-description">
            {{ roasterNoteBonus > 0 ? 'Level 2 보너스 적용' : '기본 Level 1 점수' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Community Insights -->
    <section class="community-section">
      <h3 class="community-title">📊 다른 사람들의 선택</h3>
      <div class="community-card">
        <div class="community-stats">
          <div class="stat-item">
            <span class="stat-number">{{ communityData.totalUsers }}</span>
            <span class="stat-label">명이 기록함</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ communityData.averageScore }}</span>
            <span class="stat-label">평균 점수</span>
          </div>
        </div>
        <div class="community-comparison">
          <p class="comparison-text">
            {{ communityComparisonMessage }}
          </p>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="shareResult">
        📤 공유하기
      </button>
      <button type="button" class="btn-primary" @click="startNewTasting">
        ☕ 새로운 커피 기록하기
      </button>
    </div>

    <!-- Achievement Popup -->
    <div v-if="showAchievement" class="achievement-popup" @click="closeAchievement">
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <h4 class="achievement-title">새로운 성취!</h4>
        <p class="achievement-message">{{ achievementMessage }}</p>
        <div class="achievement-reward">+10 XP</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTastingSessionStore } from '../../stores/tastingSession'

const router = useRouter()
const tastingSessionStore = useTastingSessionStore()

// State
const showAchievement = ref(false)
const achievementMessage = ref('')

// Get data from store
const currentSession = computed(() => tastingSessionStore.currentSession)

const mockCoffeeInfo = computed(() => ({
  name: currentSession.value.coffeeInfo?.coffee_name || '커피 이름 없음',
  cafe: currentSession.value.coffeeInfo?.cafe_name || '카페 이름 없음',
  method: currentSession.value.coffeeInfo?.brewing_method || '브루잉 방법 없음'
}))

const selectedFlavors = computed(() => currentSession.value.selectedFlavors || [])
const selectedSensory = computed(() => currentSession.value.sensoryExpressions || [])
const personalNotes = computed(() => currentSession.value.personalComment || '')
const roasterNoteBonus = computed(() => currentSession.value.roasterNotesLevel === 2 ? 10 : 0)

// Score calculation (get from store)
const scores = computed(() => tastingSessionStore.calculateMatchScores())
const flavorMatchScore = computed(() => scores.value.flavorMatchScore)
const sensoryMatchScore = computed(() => scores.value.sensoryMatchScore)
const matchScore = computed(() => scores.value.totalMatchScore)

// Community data
const communityData = ref({
  totalUsers: 47,
  averageScore: 73
})

// Computed properties
const progressPercent = computed(() => `${matchScore.value}%`)

const scoreClass = computed(() => {
  const score = matchScore.value
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-great'
  if (score >= 70) return 'score-good'
  if (score >= 60) return 'score-okay'
  return 'score-needs-improvement'
})

const scoreMessage = computed(() => {
  const score = matchScore.value
  if (score >= 90) return '완벽한 감각! 프로 수준이에요 ☕✨'
  if (score >= 80) return '훌륭해요! 감각이 예리하시네요 👏'
  if (score >= 70) return '좋아요! 점점 실력이 늘고 있어요 📈'
  if (score >= 60) return '괜찮아요! 연습하면 더 좋아질 거예요 💪'
  return '아쉽지만 괜찮아요! 다음엔 더 잘할 수 있어요 🌱'
})

const scoreDescription = computed(() => {
  const level = roasterNoteBonus.value > 0 ? 'Level 2' : 'Level 1'
  return `로스터가 의도한 향미와 ${matchScore.value}% 일치 (${level})`
})

const communityComparisonMessage = computed(() => {
  const diff = matchScore.value - communityData.value.averageScore
  if (diff > 15) return `평균보다 ${diff}점 높아요! 훌륭한 감각이에요 🎉`
  if (diff > 5) return `평균보다 ${diff}점 높아요! 좋은 감각입니다 👍`
  if (diff > -5) return `평균과 비슷해요. 꾸준히 연습하면 더 좋아질 거예요 📚`
  return `다음번엔 더 잘할 수 있어요! 연습이 중요해요 💪`
})

// Methods
const shareResult = () => {
  // TODO: Implement share functionality
  if (navigator.share) {
    navigator.share({
      title: 'CupNote 테이스팅 결과',
      text: `${mockCoffeeInfo.value.name} 테이스팅 결과: ${matchScore.value}점! ${scoreMessage.value}`,
      url: window.location.href
    }).catch(err => console.log('Error sharing:', err))
  } else {
    // Fallback for browsers that don't support Web Share API
    const text = `${mockCoffeeInfo.value.name} 테이스팅 결과: ${matchScore.value}점! ${scoreMessage.value}`
    navigator.clipboard.writeText(text).then(() => {
      alert('결과가 클립보드에 복사되었습니다!')
    })
  }
}

const startNewTasting = () => {
  router.push('/mode-selection')
}

const closeAchievement = () => {
  showAchievement.value = false
}

const showAchievementPopup = (message) => {
  achievementMessage.value = message
  showAchievement.value = true
  setTimeout(() => {
    showAchievement.value = false
  }, 3000)
}

// Initialize
onMounted(async () => {
  // Check if we have complete session data
  if (!tastingSessionStore.currentSession.coffeeInfo || !tastingSessionStore.currentSession.selectedFlavors) {
    console.error('Incomplete session data, redirecting to home')
    router.push('/')
    return
  }
  
  // TODO: For now, we'll use mock user ID. In real app, get from auth
  const mockUserId = 'mock-user-id-123'
  
  try {
    // Save the coffee record
    const savedRecord = await tastingSessionStore.saveCurrentSession(mockUserId)
    console.log('Coffee record saved:', savedRecord)
    
    // Get coffee statistics
    const stats = await tastingSessionStore.getCoffeeStatistics(currentSession.value.coffeeInfo?.coffee_name)
    if (stats) {
      communityData.value.totalUsers = stats.total_records
      communityData.value.averageScore = Math.round(stats.average_score)
    }
  } catch (error) {
    console.error('Failed to save coffee record:', error)
    // Still show the result even if save fails
  }
  
  // Show achievement popup for first-time or high score
  setTimeout(() => {
    if (matchScore.value >= 85) {
      showAchievementPopup('첫 85점 이상 달성!')
    } else if (matchScore.value >= 70) {
      showAchievementPopup('첫 70점 이상 달성!')
    }
  }, 2000)
})
</script>

<style scoped>
.result-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.result-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
  animation: slideDown 0.6s ease-out;
}

.result-subtitle {
  color: #A0796A;
  font-size: 1.1rem;
  line-height: 1.4;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

/* Coffee Info Card */
.coffee-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(124, 88, 66, 0.15);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease-out 0.4s both;
}

.coffee-info {
  text-align: center;
}

.coffee-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.cafe-name {
  color: #A0796A;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.brewing-method {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #F8F4F0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #7C5842;
  border: 1px solid #E8D5C4;
}

.method-icon {
  font-size: 1.1rem;
}

/* Match Score */
.match-score-section {
  margin-bottom: 3rem;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.score-circle {
  position: relative;
  width: 200px;
  height: 200px;
  animation: zoomIn 0.8s ease-out 0.6s both;
}

.score-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--score-color) var(--progress),
    #E8D5C4 var(--progress)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: scoreRotate 1.5s ease-out 0.8s both;
}

.score-progress::before {
  content: '';
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: white;
}

.score-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.score-number {
  font-size: 3rem;
  font-weight: 900;
  color: #7C5842;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.score-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #A0796A;
  letter-spacing: 2px;
}

/* Score classes */
.score-excellent {
  --score-color: linear-gradient(45deg, #FFD700, #FFA500);
}

.score-great {
  --score-color: linear-gradient(45deg, #10B981, #059669);
}

.score-good {
  --score-color: linear-gradient(45deg, #3B82F6, #1D4ED8);
}

.score-okay {
  --score-color: linear-gradient(45deg, #F59E0B, #D97706);
}

.score-needs-improvement {
  --score-color: linear-gradient(45deg, #EF4444, #DC2626);
}

.score-message {
  text-align: center;
  animation: fadeIn 1s ease-out 1.2s both;
}

.message-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.message-desc {
  color: #A0796A;
  font-size: 1rem;
}

/* Selections Summary */
.selections-summary {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease-out 1.4s both;
}

.summary-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1.5rem;
  text-align: center;
}

.selection-group {
  margin-bottom: 1.5rem;
}

.selection-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
}

.selection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selection-tag {
  background: #F8F4F0;
  border: 1px solid #E8D5C4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #7C5842;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flavor-tag {
  background: linear-gradient(135deg, #FFF8F0, #F8F4F0);
}

.sensory-tag {
  background: linear-gradient(135deg, #F0F8FF, #E8F4FD);
}

.sensory-category {
  font-size: 0.8rem;
  color: #A0796A;
  font-weight: 500;
}

.personal-notes {
  background: #F8F4F0;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #F0E8DC;
}

.notes-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

/* Score Breakdown */
.score-breakdown {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease-out 1.6s both;
}

.breakdown-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1.5rem;
  text-align: center;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.item-name {
  flex: 1;
  font-weight: 500;
  color: #7C5842;
}

.item-score {
  font-weight: 600;
  color: #7C5842;
  font-size: 1.1rem;
}

.item-bar {
  height: 8px;
  background: #F0E8DC;
  border-radius: 4px;
  overflow: hidden;
  margin-left: 40px;
}

.item-progress {
  height: 100%;
  background: linear-gradient(90deg, #7C5842, #A0796A);
  border-radius: 4px;
  transition: width 0.8s ease-out;
}

.item-description {
  margin-left: 40px;
  font-size: 0.85rem;
  color: #A0796A;
  font-style: italic;
}

/* Community Section */
.community-section {
  background: linear-gradient(135deg, #FFF8F0, #F8F4F0);
  border: 1px solid #F0E8DC;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease-out 1.8s both;
}

.community-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
  text-align: center;
}

.community-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.community-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7C5842;
}

.stat-label {
  font-size: 0.9rem;
  color: #A0796A;
}

.community-comparison {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E8D5C4;
}

.comparison-text {
  margin: 0;
  color: #666;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  animation: slideUp 0.6s ease-out 2s both;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #7C5842, #A0796A);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.4);
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover {
  border-color: #D4B896;
  background: #F8F4F0;
  transform: translateY(-1px);
}

/* Achievement Popup */
.achievement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.achievement-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  animation: popIn 0.4s ease-out;
}

.achievement-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.achievement-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.achievement-message {
  color: #666;
  margin-bottom: 1rem;
}

.achievement-reward {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: inline-block;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scoreRotate {
  from {
    --progress: 0%;
  }
  to {
    --progress: var(--final-progress, 85%);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .result-view {
    padding: 0.5rem;
  }
  
  .result-title {
    font-size: 2rem;
  }
  
  .score-circle {
    width: 160px;
    height: 160px;
  }
  
  .score-number {
    font-size: 2.5rem;
  }
  
  .community-stats {
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .coffee-card,
  .selections-summary,
  .score-breakdown,
  .community-section {
    padding: 1rem;
  }
  
  .selection-tags {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selection-tag {
    text-align: center;
    justify-content: center;
  }
}
</style>