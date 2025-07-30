<template>
  <div class="achievements-overview">
    <!-- Summary Stats -->
    <div class="achievements-summary">
      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-content">
          <div class="summary-number">{{ earnedCount }}</div>
          <div class="summary-label">획득한 배지</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">⭐</div>
        <div class="summary-content">
          <div class="summary-number">{{ totalPoints }}</div>
          <div class="summary-label">총 포인트</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">🔥</div>
        <div class="summary-content">
          <div class="summary-number">{{ inProgressCount }}</div>
          <div class="summary-label">진행 중</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon">{{ userLevel.icon }}</div>
        <div class="summary-content">
          <div class="summary-number">Lv.{{ userLevel.level }}</div>
          <div class="summary-label">{{ userLevel.title }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="activeFilter = filter.key"
        :class="{ active: activeFilter === filter.key }"
        class="filter-tab"
      >
        {{ filter.label }} ({{ getFilterCount(filter.key) }})
      </button>
    </div>

    <!-- Achievements Grid -->
    <div class="achievements-grid" v-if="filteredAchievements.length > 0">
      <AchievementCard
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        :achievement="achievement"
        :userProgress="getUserProgress(achievement.id)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3 class="empty-title">{{ getEmptyStateTitle() }}</h3>
      <p class="empty-description">{{ getEmptyStateDescription() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStatsStore } from '../../stores/userStats'
import AchievementCard from './AchievementCard.vue'

const userStatsStore = useUserStatsStore()

// State
const activeFilter = ref('all')

// Computed
const achievements = computed(() => userStatsStore.achievements || [])
const userAchievements = computed(() => userStatsStore.userAchievements || [])
const earnedAchievements = computed(() => userStatsStore.earnedAchievements || [])
const inProgressAchievements = computed(() => userStatsStore.inProgressAchievements || [])
const availableAchievements = computed(() => userStatsStore.availableAchievements || [])
const userLevel = computed(
  () => userStatsStore.userLevel || { level: 1, title: 'Coffee Newcomer', icon: '🆕' },
)
const totalPoints = computed(() => userStatsStore.totalPoints || 0)

const earnedCount = computed(() => earnedAchievements.value.length)
const inProgressCount = computed(() => inProgressAchievements.value.length)

const filters = [
  { key: 'all', label: '전체' },
  { key: 'earned', label: '획득 완료' },
  { key: 'in_progress', label: '진행 중' },
  { key: 'available', label: '도전 가능' },
]

const filteredAchievements = computed(() => {
  switch (activeFilter.value) {
    case 'earned':
      return achievements.value.filter((a) =>
        earnedAchievements.value.some((ea) => ea.achievement_id === a.id),
      )
    case 'in_progress':
      return achievements.value.filter((a) =>
        inProgressAchievements.value.some((ia) => ia.achievement_id === a.id),
      )
    case 'available':
      return availableAchievements.value
    default:
      return achievements.value.filter((a) => !a.is_hidden)
  }
})

// Methods
const getUserProgress = (achievementId) => {
  return userAchievements.value.find((ua) => ua.achievement_id === achievementId)
}

const getFilterCount = (filterKey) => {
  switch (filterKey) {
    case 'earned':
      return earnedCount.value
    case 'in_progress':
      return inProgressCount.value
    case 'available':
      return availableAchievements.value.length
    default:
      return achievements.value.filter((a) => !a.is_hidden).length
  }
}

const getEmptyStateTitle = () => {
  switch (activeFilter.value) {
    case 'earned':
      return '아직 획득한 배지가 없습니다'
    case 'in_progress':
      return '진행 중인 도전이 없습니다'
    case 'available':
      return '도전 가능한 배지가 없습니다'
    default:
      return '배지를 불러오는 중입니다'
  }
}

const getEmptyStateDescription = () => {
  switch (activeFilter.value) {
    case 'earned':
      return '커피를 테이스팅하고 배지를 획득해보세요!'
    case 'in_progress':
      return '새로운 도전을 시작하여 배지를 획득해보세요!'
    case 'available':
      return '모든 도전을 완료하셨습니다. 축하합니다!'
    default:
      return '잠시만 기다려주세요...'
  }
}
</script>

<style scoped>
.achievements-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Stats */
.achievements-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4f0, #f0e8dc);
  border-radius: 50%;
}

.summary-content {
  flex: 1;
}

.summary-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.9rem;
  color: #a0796a;
  font-weight: 500;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.filter-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #7c5842;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-tab:hover {
  background: #f8f4f0;
}

.filter-tab.active {
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.3);
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .achievements-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-card {
    padding: 1rem;
  }

  .summary-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }

  .summary-number {
    font-size: 1.5rem;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .filter-tab {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .achievements-summary {
    grid-template-columns: 1fr;
  }
}
</style>
