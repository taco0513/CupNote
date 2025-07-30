<template>
  <div class="achievements-view">
    <!-- Header -->
    <header class="achievements-header">
      <div class="header-content">
        <RouterLink to="/stats" class="back-link">
          <span class="back-icon">←</span>
          통계로 돌아가기
        </RouterLink>
        <h1 class="achievements-title">🏆 배지 시스템</h1>
        <div class="header-stats">
          <span class="header-stat">{{ earnedCount }}/{{ totalCount }} 획득</span>
        </div>
      </div>
    </header>

    <div class="achievements-container">
      <!-- Level Progress Card -->
      <section class="level-progress-section" v-if="userLevel && totalPoints > 0">
        <div class="level-progress-card">
          <div class="level-info">
            <div class="current-level">
              <div class="level-icon-large">{{ userLevel.icon }}</div>
              <div class="level-details">
                <h2 class="level-title-large">{{ userLevel.title }}</h2>
                <div class="level-points-large">{{ totalPoints }}포인트 • Lv.{{ userLevel.level }}</div>
              </div>
            </div>
            
            <div v-if="nextLevelProgress && userLevel.level < 10" class="next-level-preview">
              <div class="next-level-info">
                <span class="next-level-text">다음 레벨</span>
                <div class="next-level-details">
                  <span class="next-level-icon">{{ getNextLevelIcon(userLevel.level + 1) }}</span>
                  <span class="next-level-title">{{ getNextLevelTitle(userLevel.level + 1) }}</span>
                </div>
              </div>
              <div class="level-progress-bar">
                <div 
                  class="level-progress-fill"
                  :style="{ width: `${nextLevelProgress.progress}%` }"
                ></div>
                <div class="progress-text">
                  {{ nextLevelProgress.progress }}% ({{ nextLevelProgress.needed }}포인트 남음)
                </div>
              </div>
            </div>
            
            <div v-else-if="userLevel.level >= 10" class="max-level">
              <div class="max-level-icon">👑</div>
              <div class="max-level-text">최고 레벨 달성!</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Achievements Overview -->
      <AchievementsOverview />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">배지 정보를 불러오고 있습니다...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStatsStore } from '../stores/userStats'
import AchievementsOverview from '../components/achievements/AchievementsOverview.vue'

const authStore = useAuthStore()
const userStatsStore = useUserStatsStore()

// Computed
const isLoading = computed(() => userStatsStore.isLoading)
const userLevel = computed(() => userStatsStore.userLevel)
const totalPoints = computed(() => userStatsStore.totalPoints)
const nextLevelProgress = computed(() => userStatsStore.nextLevelProgress)
const earnedCount = computed(() => userStatsStore.earnedAchievements?.length || 0)
const totalCount = computed(() => userStatsStore.achievements?.filter(a => !a.is_hidden)?.length || 0)

// Level progression data
const levelProgression = [
  { level: 1, title: 'Coffee Newcomer', icon: '🆕' },
  { level: 2, title: 'Beginner Taster', icon: '🌱' },
  { level: 3, title: 'Coffee Explorer', icon: '🔍' },
  { level: 4, title: 'Casual Sipper', icon: '🌟' },
  { level: 5, title: 'Regular Taster', icon: '📈' },
  { level: 6, title: 'Coffee Enthusiast', icon: '☕' },
  { level: 7, title: 'Skilled Brewer', icon: '⭐' },
  { level: 8, title: 'Advanced Cupper', icon: '🎯' },
  { level: 9, title: 'Expert Taster', icon: '👑' },
  { level: 10, title: 'Coffee Master', icon: '🏆' }
]

// Methods
const getNextLevelIcon = (level) => {
  const levelData = levelProgression.find(l => l.level === level)
  return levelData?.icon || '🆕'
}

const getNextLevelTitle = (level) => {
  const levelData = levelProgression.find(l => l.level === level)
  return levelData?.title || 'Coffee Newcomer'
}

// Initialize
onMounted(async () => {
  if (authStore.userId) {
    try {
      await userStatsStore.initializeUserStats(authStore.userId)
    } catch (err) {
      console.error('Failed to initialize achievements view:', err)
    }
  }
})
</script>

<style scoped>
.achievements-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.achievements-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #F0E8DC;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7C5842;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #5D3F2E;
}

.back-icon {
  font-size: 1.2rem;
}

.achievements-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.header-stats {
  font-size: 0.9rem;
  color: #A0796A;
  font-weight: 500;
}

/* Container */
.achievements-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Level Progress Section */
.level-progress-section {
  margin-bottom: 1rem;
}

.level-progress-card {
  background: linear-gradient(135deg, #7C5842 0%, #A0796A 100%);
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  box-shadow: 0 8px 30px rgba(124, 88, 66, 0.3);
  position: relative;
  overflow: hidden;
}

.level-progress-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(45deg);
}

.level-info {
  position: relative;
  z-index: 1;
}

.current-level {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.level-icon-large {
  font-size: 4rem;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.level-details {
  flex: 1;
}

.level-title-large {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.level-points-large {
  font-size: 1.2rem;
  opacity: 0.9;
}

.next-level-preview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.next-level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.next-level-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

.next-level-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-level-icon {
  font-size: 1.5rem;
}

.next-level-title {
  font-size: 1rem;
  font-weight: 600;
}

.level-progress-bar {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
}

.level-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFF, #F0E8DC);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #7C5842;
  text-shadow: 0 0 4px rgba(255,255,255,0.8);
}

.max-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.max-level-icon {
  font-size: 3rem;
}

.max-level-text {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #E8D5C4;
  border-top-color: #7C5842;
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #7C5842;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .current-level {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .level-icon-large {
    width: 80px;
    height: 80px;
    font-size: 3rem;
  }
  
  .level-title-large {
    font-size: 1.5rem;
  }
  
  .next-level-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .progress-text {
    font-size: 0.7rem;
  }
}
</style>