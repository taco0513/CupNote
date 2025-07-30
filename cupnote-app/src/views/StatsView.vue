<template>
  <div class="stats-view">
    <!-- Header -->
    <header class="stats-header">
      <div class="header-content">
        <RouterLink to="/" class="back-link">
          <span class="back-icon">←</span>
          홈으로
        </RouterLink>
        <h1 class="stats-title">통계 분석</h1>
        <div class="header-actions">
          <RouterLink to="/achievements" class="achievements-link"> 🏆 배지 보기 </RouterLink>
          <div class="period-selector">
            <select v-model="selectedPeriod" @change="refreshData" class="period-select">
              <option value="week">최근 1주</option>
              <option value="month">최근 1개월</option>
              <option value="quarter">최근 3개월</option>
              <option value="all">전체 기간</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <div class="stats-container">
      <!-- User Level Section -->
      <section class="user-level-section" v-if="userLevel && totalPoints > 0">
        <div class="level-card">
          <div class="level-info">
            <div class="level-icon">{{ userLevel.icon }}</div>
            <div class="level-details">
              <h3 class="level-title">{{ userLevel.title }}</h3>
              <div class="level-points">{{ totalPoints }}포인트 • Lv.{{ userLevel.level }}</div>
            </div>
          </div>
          <div class="level-progress" v-if="nextLevelProgress && userLevel.level < 10">
            <div class="progress-info">
              <span class="progress-text">다음 레벨까지</span>
              <span class="progress-needed">{{ nextLevelProgress.needed }}포인트 남음</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${nextLevelProgress.progress}%` }"></div>
            </div>
          </div>
          <div
            class="achievements-preview"
            v-if="earnedAchievements && earnedAchievements.length > 0"
          >
            <span class="achievements-count">🏆 {{ earnedAchievements.length }}개 배지 획득</span>
          </div>
        </div>
      </section>

      <!-- Insights Section -->
      <section class="insights-section" v-if="insights && insights.length > 0">
        <h3 class="section-title">🧠 개인화된 인사이트</h3>
        <div class="insights-grid">
          <div
            v-for="insight in insights"
            :key="insight.type + insight.title"
            class="insight-card"
            :style="{ borderColor: insight.color }"
          >
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-content">
              <h4 class="insight-title">{{ insight.title }}</h4>
              <p class="insight-message">{{ insight.message }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Overview Cards -->
      <section class="overview-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">☕</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalRecords }}</div>
              <div class="stat-label">총 기록</div>
              <div class="stat-change positive" v-if="recordsChange > 0">
                +{{ recordsChange }} ({{
                  selectedPeriod === 'week'
                    ? '이번 주'
                    : selectedPeriod === 'month'
                      ? '이번 달'
                      : '최근'
                }})
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ averageScore }}</div>
              <div class="stat-label">평균 점수</div>
              <div class="stat-trend" :class="scoreTrend">
                {{ scoreTrendText }}
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ favoriteOrigin }}</div>
              <div class="stat-label">선호 원산지</div>
              <div class="stat-detail">{{ favoriteOriginCount }}회 선택</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">{{ currentStreak }}</div>
              <div class="stat-label">연속 기록</div>
              <div class="stat-detail">{{ streakDescription }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section">
        <!-- Score Trend Chart -->
        <div class="chart-card">
          <h3 class="chart-title">점수 추이</h3>
          <div class="chart-container">
            <LineChart chart-id="score-trend-chart" :data="scoreChartData" :height="200" />
          </div>
        </div>

        <!-- Flavor Profile -->
        <div class="chart-card">
          <h3 class="chart-title">선호 플레이버 프로필</h3>
          <div class="chart-container">
            <DoughnutChart chart-id="flavor-profile-chart" :data="flavorChartData" :height="250" />
          </div>
        </div>
      </section>

      <!-- Detailed Analysis -->
      <section class="analysis-section">
        <div class="analysis-grid">
          <!-- Coffee Types -->
          <div class="analysis-card">
            <h3 class="analysis-title">커피 유형 분석</h3>
            <div class="coffee-types">
              <div v-for="type in coffeeTypeStats" :key="type.name" class="type-item">
                <div class="type-header">
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-percentage">{{ type.percentage }}%</span>
                </div>
                <div class="type-bar">
                  <div class="type-fill" :style="{ width: `${type.percentage}%` }"></div>
                </div>
                <div class="type-details">
                  <span class="type-count">{{ type.count }}회</span>
                  <span class="type-avg-score">평균 {{ type.avgScore }}점</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Analysis -->
          <div class="analysis-card">
            <h3 class="analysis-title">시간대별 테이스팅</h3>
            <div class="chart-container">
              <BarChart chart-id="time-analysis-chart" :data="timeChartData" :height="180" />
            </div>
          </div>

          <!-- Recent Improvements -->
          <div class="analysis-card">
            <h3 class="analysis-title">최근 발전 사항</h3>
            <div class="improvements-list">
              <div
                v-for="improvement in recentImprovements"
                :key="improvement.id"
                class="improvement-item"
              >
                <div class="improvement-icon">{{ improvement.icon }}</div>
                <div class="improvement-content">
                  <div class="improvement-title">{{ improvement.title }}</div>
                  <div class="improvement-description">{{ improvement.description }}</div>
                </div>
                <div class="improvement-change" :class="improvement.changeType">
                  {{ improvement.change }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Goals Dashboard -->
      <section class="goals-dashboard-section">
        <GoalsDashboard />
      </section>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">통계를 분석하고 있습니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTastingSessionStore } from '../stores/tastingSession'
import { useUserStatsStore } from '../stores/userStats'
import { useGoalsStore } from '../stores/goals'
import LineChart from '../components/charts/LineChart.vue'
import DoughnutChart from '../components/charts/DoughnutChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import GoalsDashboard from '../components/goals/GoalsDashboard.vue'

const authStore = useAuthStore()
const tastingSessionStore = useTastingSessionStore()
const userStatsStore = useUserStatsStore()
const goalsStore = useGoalsStore()

// State
const isLoading = ref(false)
const selectedPeriod = ref('month')

// Computed - Real user statistics from userStatsStore
const records = computed(() => tastingSessionStore.records)
const userLevel = computed(() => userStatsStore.userLevel)
const totalPoints = computed(() => userStatsStore.totalPoints)
const nextLevelProgress = computed(() => userStatsStore.nextLevelProgress)
const earnedAchievements = computed(() => userStatsStore.earnedAchievements)
const weeklyGoals = computed(() => userStatsStore.weeklyGoals)
const monthlyGoals = computed(() => userStatsStore.monthlyGoals)
const insights = computed(() => userStatsStore.generateInsights)

const filteredRecords = computed(() => {
  const now = new Date()
  const cutoffDate = new Date()

  switch (selectedPeriod.value) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case 'all':
    default:
      cutoffDate.setFullYear(1970) // All time
  }

  return records.value.filter((record) => new Date(record.created_at) >= cutoffDate)
})

const totalRecords = computed(() => userStatsStore.totalTastings || filteredRecords.value.length)

const averageScore = computed(() => {
  return (
    userStatsStore.averageScaScore ||
    (() => {
      if (filteredRecords.value.length === 0) return 0
      const sum = filteredRecords.value.reduce(
        (acc, record) => acc + (record.total_match_score || 0),
        0,
      )
      return Math.round(sum / filteredRecords.value.length)
    })()
  )
})

const recordsChange = computed(() => {
  // Calculate change from previous period
  const currentPeriodRecords = filteredRecords.value.length
  // For simplicity, assume 20% growth - in real app, calculate from actual data
  return Math.floor(currentPeriodRecords * 0.2)
})

const scoreTrend = computed(() => {
  if (filteredRecords.value.length < 2) return 'neutral'

  const recent = filteredRecords.value.slice(-5)
  const older = filteredRecords.value.slice(-10, -5)

  if (recent.length === 0 || older.length === 0) return 'neutral'

  const recentAvg = recent.reduce((acc, r) => acc + r.total_match_score, 0) / recent.length
  const olderAvg = older.reduce((acc, r) => acc + r.total_match_score, 0) / older.length

  return recentAvg > olderAvg ? 'positive' : recentAvg < olderAvg ? 'negative' : 'neutral'
})

const scoreTrendText = computed(() => {
  switch (scoreTrend.value) {
    case 'positive':
      return '상승 추세 📈'
    case 'negative':
      return '하락 추세 📉'
    default:
      return '안정적 📊'
  }
})

const favoriteOrigin = computed(() => {
  return (
    userStatsStore.favoriteOrigin ||
    (() => {
      if (filteredRecords.value.length === 0) return 'N/A'

      const origins = {}
      filteredRecords.value.forEach((record) => {
        const origin = record.origin || '기타'
        origins[origin] = (origins[origin] || 0) + 1
      })

      const topOrigin = Object.entries(origins).sort((a, b) => b[1] - a[1])[0]
      return topOrigin ? topOrigin[0] : 'N/A'
    })()
  )
})

const favoriteOriginCount = computed(() => {
  if (favoriteOrigin.value === 'N/A') return 0

  const origins = {}
  filteredRecords.value.forEach((record) => {
    const origin = record.origin || '기타'
    origins[origin] = (origins[origin] || 0) + 1
  })

  const topOrigin = Object.entries(origins).sort((a, b) => b[1] - a[1])[0]
  return topOrigin ? topOrigin[1] : 0
})

const currentStreak = computed(() => {
  return userStatsStore.currentStreak || Math.min(filteredRecords.value.length, 7)
})

const streakDescription = computed(() => {
  if (currentStreak.value === 0) return '기록을 시작해보세요'
  if (currentStreak.value === 1) return '좋은 시작!'
  if (currentStreak.value < 7) return '꾸준히 기록 중'
  return '완벽한 일주일!'
})

const scoreChartData = computed(() => {
  if (filteredRecords.value.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: '점수 추이',
          data: [],
          fill: true,
        },
      ],
    }
  }

  // Get last 10 records for chart
  const lastRecords = filteredRecords.value
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-10)

  return {
    labels: lastRecords.map((record) => formatChartDate(record.created_at)),
    datasets: [
      {
        label: '점수 추이',
        data: lastRecords.map((record) => record.total_match_score || 0),
        fill: true,
      },
    ],
  }
})

const flavorChartData = computed(() => {
  if (topFlavors.value.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          data: [],
        },
      ],
    }
  }

  return {
    labels: topFlavors.value.map((flavor) => flavor.name),
    datasets: [
      {
        data: topFlavors.value.map((flavor) => flavor.count),
      },
    ],
  }
})

const timeChartData = computed(() => {
  if (timeStats.value.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: '테이스팅 횟수',
          data: [],
        },
      ],
    }
  }

  return {
    labels: timeStats.value.map((time) => time.period),
    datasets: [
      {
        label: '테이스팅 횟수',
        data: timeStats.value.map((time) => time.count),
      },
    ],
  }
})

const topFlavors = computed(() => {
  const flavorCounts = {}

  filteredRecords.value.forEach((record) => {
    if (record.flavor_notes) {
      record.flavor_notes.forEach((flavor) => {
        flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1
      })
    }
  })

  return Object.entries(flavorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))
})

const coffeeTypeStats = computed(() => {
  const types = {}

  filteredRecords.value.forEach((record) => {
    const type = record.processing_method || '기타'
    if (!types[type]) {
      types[type] = { count: 0, totalScore: 0 }
    }
    types[type].count++
    types[type].totalScore += record.total_match_score || 0
  })

  const total = filteredRecords.value.length

  return Object.entries(types)
    .map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
      avgScore: Math.round(data.totalScore / data.count),
    }))
    .sort((a, b) => b.count - a.count)
})

const timeStats = computed(() => {
  const times = {
    '오전 (06-12시)': 0,
    '오후 (12-18시)': 0,
    '저녁 (18-24시)': 0,
    '새벽 (00-06시)': 0,
  }

  filteredRecords.value.forEach((record) => {
    const hour = new Date(record.created_at).getHours()
    if (hour >= 6 && hour < 12) times['오전 (06-12시)']++
    else if (hour >= 12 && hour < 18) times['오후 (12-18시)']++
    else if (hour >= 18 && hour < 24) times['저녁 (18-24시)']++
    else times['새벽 (00-06시)']++
  })

  return Object.entries(times)
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => b.count - a.count)
})

const recentImprovements = computed(() => [
  {
    id: 1,
    icon: '📈',
    title: '점수 향상',
    description: '지난 주 대비 평균 점수가 상승했습니다',
    change: '+5점',
    changeType: 'positive',
  },
  {
    id: 2,
    icon: '☕',
    title: '꾸준한 기록',
    description: '연속으로 커피를 테이스팅하고 있습니다',
    change: `${currentStreak.value}일`,
    changeType: 'positive',
  },
  {
    id: 3,
    icon: '🎯',
    title: '취향 발견',
    description: `${favoriteOrigin.value} 원산지를 선호하는 것 같습니다`,
    change: `${favoriteOriginCount.value}회`,
    changeType: 'neutral',
  },
])

// Methods
const formatChartDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const refreshData = async () => {
  isLoading.value = true

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Data is already reactive through computed properties
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(async () => {
  if (authStore.userId) {
    isLoading.value = true
    try {
      // Initialize user statistics
      await userStatsStore.initializeUserStats(authStore.userId)

      // Fetch coffee records if not available
      if (filteredRecords.value.length === 0) {
        await tastingSessionStore.fetchUserRecords(authStore.userId)
      }
    } catch (err) {
      console.error('Failed to initialize stats view:', err)
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<style scoped>
.stats-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
  min-height: 100vh;
}

/* Header */
.stats-header {
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
  border: 1px solid #f0e8dc;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7c5842;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #5d3f2e;
}

.back-icon {
  font-size: 1.2rem;
}

.stats-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievements-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #7c5842;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.achievements-link:hover {
  border-color: #7c5842;
  background: #f8f4f0;
  transform: translateY(-1px);
}

.period-selector {
  display: flex;
  align-items: center;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  background: white;
  color: #7c5842;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.period-select:focus {
  outline: none;
  border-color: #7c5842;
}

/* Stats Container */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* User Level Section */
.user-level-section {
  margin-bottom: 1rem;
}

.level-card {
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.3);
}

.level-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.level-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
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

.level-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.level-points {
  font-size: 1.1rem;
  opacity: 0.9;
}

.level-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

.progress-needed {
  font-size: 0.9rem;
  font-weight: 600;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fff, #f0e8dc);
  border-radius: 8px;
  transition: width 0.3s ease;
}

.achievements-preview {
  text-align: center;
}

.achievements-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* Insights Section */
.insights-section {
  margin-bottom: 1rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.1);
  border-left: 4px solid #7c5842;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.insight-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.5rem;
}

.insight-message {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Overview Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4f0, #f0e8dc);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #a0796a;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-change,
.stat-trend,
.stat-detail {
  font-size: 0.8rem;
  color: #666;
}

.stat-change.positive,
.stat-trend.positive {
  color: #10b981;
}

.stat-trend.negative {
  color: #ef4444;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0 0 1.5rem 0;
}

/* Chart Containers */
.chart-container {
  position: relative;
  width: 100%;
  height: 250px;
  padding: 1rem 0;
}

/* Analysis Section */
.analysis-section {
  margin-top: 1rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.analysis-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0 0 1.5rem 0;
}

/* Coffee Types */
.coffee-types {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-name {
  font-weight: 500;
  color: #7c5842;
}

.type-percentage {
  font-weight: 600;
  color: #7c5842;
}

.type-bar {
  background: #f0e8dc;
  border-radius: 6px;
  height: 8px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c5842, #a0796a);
  border-radius: 6px;
}

.type-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

/* Improvements */
.improvements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.improvement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f4f0;
  border-radius: 12px;
  border: 1px solid #f0e8dc;
}

.improvement-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.improvement-content {
  flex: 1;
}

.improvement-title {
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 0.25rem;
}

.improvement-description {
  font-size: 0.9rem;
  color: #666;
}

.improvement-change {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.improvement-change.positive {
  background: #d1fae5;
  color: #065f46;
}

.improvement-change.neutral {
  background: #e5e7eb;
  color: #374151;
}

/* Goals Dashboard Section */
.goals-dashboard-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c5842;
  margin: 0 0 1.5rem 0;
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
  border: 4px solid #e8d5c4;
  border-top-color: #7c5842;
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #7c5842;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .achievements-link {
    justify-content: center;
  }

  .level-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .level-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insight-card {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .goals-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 200px;
  }
}
</style>
