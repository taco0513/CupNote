<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">
            <span class="title-icon">📊</span>
            CupNote 관리자 대시보드
          </h1>
          <p class="dashboard-subtitle">커피 테이스팅 서비스 운영 현황</p>
        </div>
        <div class="header-right">
          <div class="current-time">{{ currentTime }}</div>
          <div class="admin-badge">Admin</div>
        </div>
      </div>
    </header>

    <!-- Stats Cards -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers.toLocaleString() }}</div>
            <div class="stat-label">총 사용자</div>
            <div class="stat-change positive">+{{ stats.userGrowth }}%</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">☕</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalTastings.toLocaleString() }}</div>
            <div class="stat-label">테이스팅 기록</div>
            <div class="stat-change positive">+{{ stats.tastingGrowth }}%</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgMatchScore }}%</div>
            <div class="stat-label">평균 매치 점수</div>
            <div class="stat-change positive">+{{ stats.scoreImprovement }}%</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeUsers.toLocaleString() }}</div>
            <div class="stat-label">활성 사용자 (7일)</div>
            <div class="stat-change positive">+{{ stats.engagement }}%</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <section class="charts-section">
      <div class="charts-grid">
        <!-- Usage Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">📈 일일 사용량 추이</h3>
            <div class="chart-period">최근 7일</div>
          </div>
          <div class="chart-container">
            <canvas ref="usageChart" class="chart-canvas"></canvas>
          </div>
        </div>

        <!-- Match Score Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">🎯 매치 점수 분포</h3>
            <div class="chart-period">이번 주</div>
          </div>
          <div class="chart-container">
            <div class="score-distribution">
              <div class="score-bar">
                <div class="score-label">90-100점</div>
                <div class="score-progress">
                  <div
                    class="score-fill excellent"
                    :style="`width: ${scoreDistribution.excellent}%`"
                  ></div>
                </div>
                <div class="score-value">{{ scoreDistribution.excellent }}%</div>
              </div>
              <div class="score-bar">
                <div class="score-label">70-89점</div>
                <div class="score-progress">
                  <div class="score-fill good" :style="`width: ${scoreDistribution.good}%`"></div>
                </div>
                <div class="score-value">{{ scoreDistribution.good }}%</div>
              </div>
              <div class="score-bar">
                <div class="score-label">50-69점</div>
                <div class="score-progress">
                  <div class="score-fill fair" :style="`width: ${scoreDistribution.fair}%`"></div>
                </div>
                <div class="score-value">{{ scoreDistribution.fair }}%</div>
              </div>
              <div class="score-bar">
                <div class="score-label">0-49점</div>
                <div class="score-progress">
                  <div class="score-fill poor" :style="`width: ${scoreDistribution.poor}%`"></div>
                </div>
                <div class="score-value">{{ scoreDistribution.poor }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="activity-section">
      <div class="activity-grid">
        <!-- Recent Tastings -->
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">🆕 최근 테이스팅</h3>
            <RouterLink to="/admin/tastings" class="view-all-link">전체 보기</RouterLink>
          </div>
          <div class="activity-list">
            <div v-for="tasting in recentTastings" :key="tasting.id" class="activity-item">
              <div class="activity-avatar">{{ tasting.userInitial }}</div>
              <div class="activity-content">
                <div class="activity-main">
                  {{ tasting.coffee_info?.coffee_name || 'Unknown Coffee' }}
                </div>
                <div class="activity-sub">
                  {{ tasting.coffee_info?.cafe_name || 'Unknown Cafe' }} · {{ tasting.timeAgo }}
                </div>
              </div>
              <div class="activity-score" :class="getScoreClass(tasting.matchScore)">
                {{ tasting.matchScore }}점
              </div>
            </div>
          </div>
        </div>

        <!-- Popular Coffees -->
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">🔥 인기 커피</h3>
            <RouterLink to="/admin/coffees" class="view-all-link">전체 보기</RouterLink>
          </div>
          <div class="activity-list">
            <div v-for="coffee in popularCoffees" :key="coffee.id" class="activity-item">
              <div class="activity-rank">#{{ coffee.rank }}</div>
              <div class="activity-content">
                <div class="activity-main">{{ coffee.name }}</div>
                <div class="activity-sub">{{ coffee.cafe }} · {{ coffee.tastings }}회 테스팅</div>
              </div>
              <div class="activity-rating">⭐ {{ coffee.avgScore }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <div class="actions-header">
        <h3 class="actions-title">⚡ 빠른 작업</h3>
      </div>
      <div class="actions-grid">
        <button class="action-btn primary" @click="exportData">
          <span class="action-icon">📊</span>
          <span class="action-text">데이터 내보내기</span>
        </button>
        <button class="action-btn success" @click="sendNotification">
          <span class="action-icon">📢</span>
          <span class="action-text">공지사항 발송</span>
        </button>
        <button class="action-btn warning" @click="viewReports">
          <span class="action-icon">📋</span>
          <span class="action-text">분석 리포트</span>
        </button>
        <button class="action-btn info" @click="manageUsers">
          <span class="action-icon">👥</span>
          <span class="action-text">사용자 관리</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// 반응형 데이터
const currentTime = ref('')
const stats = ref({
  totalUsers: 1234,
  userGrowth: 12.5,
  totalTastings: 5678,
  tastingGrowth: 8.3,
  avgMatchScore: 78,
  scoreImprovement: 5.2,
  activeUsers: 234,
  engagement: 15.7,
})

const scoreDistribution = ref({
  excellent: 25,
  good: 45,
  fair: 22,
  poor: 8,
})

const recentTastings = ref([
  {
    id: 1,
    userInitial: 'K',
    coffeeName: '에스프레소 블렌드',
    cafeName: '카페 베네',
    timeAgo: '5분 전',
    matchScore: 85,
  },
  {
    id: 2,
    userInitial: 'L',
    coffeeName: '케냐 AA',
    cafeName: '로스터리 카페',
    timeAgo: '12분 전',
    matchScore: 92,
  },
  {
    id: 3,
    userInitial: 'P',
    coffeeName: '콜롬비아 수프리모',
    cafeName: '원두가게',
    timeAgo: '18분 전',
    matchScore: 76,
  },
  {
    id: 4,
    userInitial: 'J',
    coffeeName: '브라질 산토스',
    cafeName: '모닝 카페',
    timeAgo: '25분 전',
    matchScore: 68,
  },
])

const popularCoffees = ref([
  {
    id: 1,
    rank: 1,
    name: '에티오피아 예가체프',
    cafe: '스페셜티 로스터',
    tastings: 156,
    avgScore: 4.8,
  },
  {
    id: 2,
    rank: 2,
    name: '콜롬비아 수프리모',
    cafe: '프리미엄 빈',
    tastings: 134,
    avgScore: 4.6,
  },
  {
    id: 3,
    rank: 3,
    name: '케냐 AA',
    cafe: '로스터리 카페',
    tastings: 128,
    avgScore: 4.7,
  },
  {
    id: 4,
    rank: 4,
    name: '과테말라 안티구아',
    cafe: '원두공장',
    tastings: 95,
    avgScore: 4.5,
  },
])

// 시간 업데이트
let timeInterval: NodeJS.Timeout

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 점수 클래스 계산
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

// 빠른 작업 함수들
const exportData = () => {
  alert('데이터 내보내기 기능이 곧 추가됩니다!')
}

const sendNotification = () => {
  alert('공지사항 발송 기능이 곧 추가됩니다!')
}

const viewReports = () => {
  alert('분석 리포트 기능이 곧 추가됩니다!')
}

const manageUsers = () => {
  alert('사용자 관리 기능이 곧 추가됩니다!')
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

/* Header */
.dashboard-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.dashboard-subtitle {
  color: #718096;
  font-size: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-time {
  font-family: 'Courier New', monospace;
  color: #4a5568;
  font-size: 0.9rem;
}

.admin-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #48bb78;
}

/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.chart-period {
  color: #718096;
  font-size: 0.9rem;
}

.chart-container {
  height: 250px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* Score Distribution */
.score-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  justify-content: center;
}

.score-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-label {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
}

.score-progress {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s ease;
}

.score-fill.excellent {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.score-fill.good {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.score-fill.fair {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.score-fill.poor {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.score-value {
  width: 40px;
  text-align: right;
  font-weight: 600;
  color: #4a5568;
}

/* Activity Section */
.activity-section {
  margin-bottom: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.activity-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: background 0.3s ease;
}

.activity-item:hover {
  background: #e2e8f0;
}

.activity-avatar,
.activity-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-main {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.activity-sub {
  color: #718096;
  font-size: 0.9rem;
}

.activity-score,
.activity-rating {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.activity-score.excellent {
  background: #c6f6d5;
  color: #22543d;
}

.activity-score.good {
  background: #bee3f8;
  color: #2a4365;
}

.activity-score.fair {
  background: #fbd38d;
  color: #744210;
}

.activity-score.poor {
  background: #fed7d7;
  color: #742a2a;
}

.activity-rating {
  background: #fffaf0;
  color: #744210;
}

/* Actions Section */
.actions-section {
  margin-bottom: 2rem;
}

.actions-header {
  margin-bottom: 1.5rem;
}

.actions-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.action-btn.warning {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.action-btn.info {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.action-icon {
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid,
  .charts-grid,
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .chart-card,
  .activity-card {
    padding: 1.5rem;
  }
}
</style>
