<template>
  <div class="goals-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h2 class="dashboard-title">나의 목표</h2>
        <p class="dashboard-subtitle">목표를 설정하고 달성률을 확인하세요</p>
      </div>
      <button @click="showGoalModal = true" class="btn-create-goal">➕ 새 목표 만들기</button>
    </div>

    <!-- Progress Overview -->
    <div class="progress-overview">
      <div class="overview-card">
        <div class="overview-icon">📊</div>
        <div class="overview-content">
          <h3 class="overview-value">{{ overallProgress }}%</h3>
          <p class="overview-label">전체 진행률</p>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-icon">🎯</div>
        <div class="overview-content">
          <h3 class="overview-value">{{ activeGoals.length }}</h3>
          <p class="overview-label">진행 중인 목표</p>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-icon">✅</div>
        <div class="overview-content">
          <h3 class="overview-value">{{ completedGoals.length }}</h3>
          <p class="overview-label">완료된 목표</p>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-icon">🏆</div>
        <div class="overview-content">
          <h3 class="overview-value">{{ achievementRate }}%</h3>
          <p class="overview-label">달성률</p>
        </div>
      </div>
    </div>

    <!-- Goals Tabs -->
    <div class="goals-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="tab-button"
        :class="{ active: activeTab === tab.key }"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Goals List -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>목표를 불러오는 중...</p>
    </div>

    <div v-else-if="displayedGoals.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3 class="empty-title">아직 목표가 없습니다</h3>
      <p class="empty-message">
        {{ emptyMessage }}
      </p>
      <button @click="showGoalModal = true" class="btn-primary">첫 목표 만들기</button>
    </div>

    <div v-else class="goals-grid">
      <GoalCard
        v-for="goal in displayedGoals"
        :key="goal.id"
        :goal="goal"
        @toggle-active="toggleGoalActive(goal.id)"
        @edit="editGoal(goal)"
        @delete="deleteGoal(goal.id)"
      />
    </div>

    <!-- Goal Modal -->
    <GoalModal v-model="showGoalModal" :edit-goal="editingGoal" @saved="onGoalSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoalsStore } from '../../stores/goals'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import GoalCard from './GoalCard.vue'
import GoalModal from './GoalModal.vue'

const goalsStore = useGoalsStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// State
const showGoalModal = ref(false)
const editingGoal = ref(null)
const activeTab = ref('all')
const loading = ref(true)

// Computed
const {
  activeGoals,
  completedGoals,
  inProgressGoals,
  todaysGoals,
  weeklyGoals,
  monthlyGoals,
  overallProgress,
  achievementRate,
} = goalsStore

const tabs = computed(() => [
  { key: 'all', label: '전체', count: goalsStore.userGoals.length },
  { key: 'active', label: '진행 중', count: activeGoals.value.length },
  { key: 'today', label: '오늘', count: todaysGoals.value.length },
  { key: 'weekly', label: '주간', count: weeklyGoals.value.length },
  { key: 'monthly', label: '월간', count: monthlyGoals.value.length },
  { key: 'completed', label: '완료', count: completedGoals.value.length },
])

const displayedGoals = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return activeGoals.value
    case 'today':
      return todaysGoals.value
    case 'weekly':
      return weeklyGoals.value
    case 'monthly':
      return monthlyGoals.value
    case 'completed':
      return completedGoals.value
    default:
      return goalsStore.userGoals
  }
})

const emptyMessage = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return '진행 중인 목표가 없습니다. 새로운 목표를 만들어보세요!'
    case 'today':
      return '오늘의 목표가 없습니다. 일일 목표를 설정해보세요!'
    case 'weekly':
      return '주간 목표가 없습니다. 이번 주 도전할 목표를 만들어보세요!'
    case 'monthly':
      return '월간 목표가 없습니다. 이번 달의 큰 목표를 설정해보세요!'
    case 'completed':
      return '아직 완료된 목표가 없습니다. 첫 목표를 달성해보세요!'
    default:
      return '첫 번째 목표를 만들고 커피 여정을 시작하세요!'
  }
})

// Methods
const toggleGoalActive = async (goalId) => {
  const result = await goalsStore.toggleGoalActive(goalId)
  if (result.success) {
    notificationStore.showSuccess('목표 상태가 변경되었습니다')
  }
}

const editGoal = (goal) => {
  editingGoal.value = goal
  showGoalModal.value = true
}

const deleteGoal = async (goalId) => {
  if (!confirm('이 목표를 삭제하시겠습니까?')) return

  const result = await goalsStore.deleteGoal(goalId)
  if (result.success) {
    notificationStore.showSuccess('목표가 삭제되었습니다')
  } else {
    notificationStore.showError('목표 삭제에 실패했습니다')
  }
}

const onGoalSaved = () => {
  editingGoal.value = null
  goalsStore.refreshGoalProgress()
}

// Lifecycle
onMounted(async () => {
  if (authStore.user) {
    await goalsStore.initializeGoals(authStore.user.id)
  }
  loading.value = false
})
</script>

<style scoped>
.goals-dashboard {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.dashboard-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #7c5842;
}

.dashboard-subtitle {
  margin: 0;
  color: #a0796a;
  font-size: 1.1rem;
}

.btn-create-goal {
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-create-goal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

/* Progress Overview */
.progress-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0e8dc;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.overview-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.overview-content {
  flex: 1;
}

.overview-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #7c5842;
}

.overview-label {
  margin: 0;
  font-size: 0.9rem;
  color: #a0796a;
}

/* Tabs */
.goals-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0e8dc;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #a0796a;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #7c5842;
}

.tab-button.active {
  color: #7c5842;
  font-weight: 600;
  border-bottom-color: #7c5842;
}

.tab-count {
  background: #f0e8dc;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: #7c5842;
  color: white;
}

/* Goals Grid */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #a0796a;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0e8dc;
  border-top-color: #7c5842;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #7c5842;
}

.empty-message {
  margin: 0 0 2rem 0;
  color: #a0796a;
  font-size: 1.1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .goals-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .btn-create-goal {
    width: 100%;
    justify-content: center;
  }

  .progress-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .goals-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .overview-card {
    padding: 1rem;
  }

  .overview-icon {
    font-size: 2rem;
  }

  .overview-value {
    font-size: 1.25rem;
  }

  .overview-label {
    font-size: 0.8rem;
  }
}
</style>
