# StatsView.vue

## 📋 개요

**목적**: 사용자의 테이스팅 통계와 성과를 시각화하는 데이터 대시보드 페이지  
**위치**: `/src/views/StatsView.vue`  
**라우터**: `/stats`  
**작성일**: 2025-07-30

사용자의 테이스팅 히스토리를 분석하여 성장 트렌드, 선호도 패턴, 매치 스코어 변화 등을 종합적으로 시각화하는 개인 맞춤형 통계 대시보드입니다.

---

## 🎯 주요 기능

### 1. **종합 통계 대시보드** ⭐ 핵심 기능

- **총 테이스팅 횟수**: 누적 테이스팅 세션 수
- **평균 매치 스코어**: 전체 평균 및 최근 트렌드
- **성장 지표**: 시간에 따른 실력 향상 그래프
- **CSS 애니메이션 기반**: 고급스러운 시각화 및 그래프

### 2. **매치 스코어 분석**

- **스코어 트렌드**: 시간별 매치 스코어 변화 라인 차트
- **카테고리별 점수**: 향미/감각/전체 점수 비교
- **목표 달성도**: 개인 목표 대비 성취율
- **최고/최저 기록**: 베스트/워스트 테이스팅 결과

### 3. **선호도 분석**

- **자주 선택한 향미**: 향미 선택 빈도 워드클라우드
- **감각 표현 패턴**: 자주 사용하는 감각 표현
- **카페 방문 통계**: 가장 많이 방문한 카페
- **커피 스타일 선호**: 원산지/로스팅별 선호도

### 4. **성취 시스템**

- **뱃지 컬렉션**: 달성한 성취 뱃지들
- **레벨 시스템**: 경험치 기반 레벨업
- **도전 과제**: 진행 중인 챌린지
- **랭킹 시스템**: 전체 사용자 대비 순위

---

## 🔧 기술 명세

### Props

```typescript
// Props 없음 - Supabase에서 직접 데이터 조회
```

### Events

```typescript
// 내부 이벤트만 사용, 부모 컴포넌트로 emit 없음
```

### Composables & Stores

```typescript
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { supabase } from '../lib/supabase'
import Chart from 'chart.js/auto'

// 상태 관리
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// 통계 데이터
const stats = ref({
  totalTastings: 0,
  averageScore: 0,
  bestScore: 0,
  recentTrend: [],
  favoriteFllavors: [],
  visitedCafes: [],
})

// 차트 인스턴스들
const trendChart = ref(null)
const flavorChart = ref(null)
const categoryChart = ref(null)
```

### 주요 메서드

```typescript
const fetchTastingStats = async () => {
  try {
    const userId = authStore.user.id

    // 모든 테이스팅 기록 조회
    const { data: tastings, error } = await supabase
      .from('tasting_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // 통계 계산
    stats.value = {
      totalTastings: tastings.length,
      averageScore: calculateAverageScore(tastings),
      bestScore: Math.max(...tastings.map((t) => t.match_scores.total)),
      recentTrend: calculateTrend(tastings),
      favoriteFlavors: calculateFlavorFrequency(tastings),
      visitedCafes: calculateCafeFrequency(tastings),
    }

    // 차트 업데이트
    updateCharts()
  } catch (error) {
    console.error('통계 로딩 실패:', error)
    notificationStore.showError('통계 데이터를 불러오는데 실패했습니다.', '📊 로딩 실패')
  }
}

const createTrendChart = () => {
  const ctx = document.getElementById('trendChart').getContext('2d')

  trendChart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: stats.value.recentTrend.map((t) => new Date(t.date).toLocaleDateString()),
      datasets: [
        {
          label: '매치 스코어',
          data: stats.value.recentTrend.map((t) => t.score),
          borderColor: '#7C5842',
          backgroundColor: 'rgba(124, 88, 66, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `매치 스코어: ${context.parsed.y}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
      },
    },
  })
}

const createFlavorChart = () => {
  const ctx = document.getElementById('flavorChart').getContext('2d')

  flavorChart.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: stats.value.favoriteFlavors.map((f) => f.name),
      datasets: [
        {
          data: stats.value.favoriteFlavors.map((f) => f.count),
          backgroundColor: ['#7C5842', '#A0796A', '#D4B896', '#E8D5C4', '#F5F0E8'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((context.parsed / total) * 100)
              return `${context.label}: ${percentage}%`
            },
          },
        },
      },
    },
  })
}

const calculateAverageScore = (tastings) => {
  if (tastings.length === 0) return 0

  const totalScore = tastings.reduce((sum, tasting) => {
    return sum + (tasting.match_scores?.total || 0)
  }, 0)

  return Math.round(totalScore / tastings.length)
}

const calculateTrend = (tastings) => {
  return tastings.slice(-10).map((tasting) => ({
    date: tasting.created_at,
    score: tasting.match_scores?.total || 0,
  }))
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
{
  path: '/stats',
  name: 'stats',
  component: StatsView,
  meta: {
    requiresAuth: true,
    title: '통계'
  }
}
```

### 네비게이션 플로우

```
통계 페이지 접근 경로
├── 네비게이션 메뉴 → /stats
├── 결과 페이지 → /stats
├── 홈 대시보드 → /stats
└── 직접 URL 접근 → /stats

통계 페이지에서 이동
├── 새 테이스팅 → /mode-selection
├── 기록 목록 → /records
├── 성취 보기 → /achievements
└── 프로필 → /profile
```

---

## 📱 UI/UX 구조

### 레이아웃 구조

```vue
<template>
  <div class="stats-view">
    <!-- 헤더 -->
    <header class="stats-header">
      <h1>📊 나의 테이스팅 통계</h1>
      <div class="stats-summary">
        <div class="summary-item">
          <span class="number">{{ stats.totalTastings }}</span>
          <span class="label">총 테이스팅</span>
        </div>
        <div class="summary-item">
          <span class="number">{{ stats.averageScore }}%</span>
          <span class="label">평균 스코어</span>
        </div>
        <div class="summary-item">
          <span class="number">{{ stats.bestScore }}%</span>
          <span class="label">최고 기록</span>
        </div>
      </div>
    </header>

    <!-- 메인 차트 영역 -->
    <main class="stats-main">
      <!-- 트렌드 차트 -->
      <section class="chart-section">
        <h2>📈 매치 스코어 트렌드</h2>
        <div class="chart-container">
          <canvas id="trendChart"></canvas>
        </div>
      </section>

      <!-- 카테고리별 분석 -->
      <section class="chart-section">
        <h2>🎯 카테고리별 분석</h2>
        <div class="category-stats">
          <div class="category-item">
            <span class="category-name">향미 매치</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${stats.flavorAverage}%` }"></div>
            </div>
            <span class="category-score">{{ stats.flavorAverage }}%</span>
          </div>
          <div class="category-item">
            <span class="category-name">감각 매치</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${stats.sensoryAverage}%` }"></div>
            </div>
            <span class="category-score">{{ stats.sensoryAverage }}%</span>
          </div>
        </div>
      </section>

      <!-- 선호도 분석 -->
      <section class="chart-section">
        <h2>💖 나의 선호도</h2>
        <div class="preference-grid">
          <div class="preference-card">
            <h3>자주 선택한 향미</h3>
            <div class="chart-container">
              <canvas id="flavorChart"></canvas>
            </div>
          </div>

          <div class="preference-card">
            <h3>자주 가는 카페</h3>
            <div class="cafe-list">
              <div
                v-for="cafe in stats.visitedCafes.slice(0, 5)"
                :key="cafe.name"
                class="cafe-item"
              >
                <span class="cafe-name">{{ cafe.name }}</span>
                <span class="visit-count">{{ cafe.count }}회</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 성취 현황 -->
      <section class="achievement-section">
        <h2>🏆 성취 현황</h2>
        <div class="achievement-grid">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="achievement-card"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <h3>{{ achievement.title }}</h3>
            <p>{{ achievement.description }}</p>
            <div class="achievement-progress">
              <div class="progress-fill" :style="{ width: `${achievement.progress}%` }"></div>
            </div>
            <span class="progress-text">
              {{ achievement.current }} / {{ achievement.target }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 액션 버튼 -->
    <footer class="stats-actions">
      <button @click="router.push('/mode-selection')" class="btn-primary">
        ☕ 새로운 테이스팅
      </button>
      <button @click="router.push('/records')" class="btn-secondary">📝 기록 보기</button>
      <button @click="router.push('/achievements')" class="btn-outline">🏆 성취 보기</button>
    </footer>
  </div>
</template>
```

### 스타일링 특징

- **대시보드 레이아웃**: 카드 기반 모듈형 구성
- **차트 중심**: Chart.js 기반 인터랙티브 시각화
- **프로그레스 바**: 진행률을 시각적으로 표현
- **반응형 그리드**: 다양한 화면 크기에 대응

---

## 🔄 최근 변경사항

### 2025-07-30: Chart.js 통합 완료

```typescript
// Before: 정적 통계 표시
<div class="stats-number">{{ averageScore }}</div>

// After: 인터랙티브 차트
const trendChart = new Chart(ctx, {
  type: 'line',
  data: trendData,
  options: {
    responsive: true,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  }
})
```

**변경 이유**: 데이터 시각화 개선으로 사용자 이해도 향상

### 주요 개선사항

- ✅ Chart.js 라이브러리 통합
- ✅ 트렌드 라인 차트 구현
- ✅ 선호도 도넛 차트 추가
- ✅ 프로그레스 바 애니메이션
- ✅ 실시간 데이터 업데이트

---

## 📊 데이터 구조

### 통계 데이터 스키마

```typescript
interface UserStats {
  totalTastings: number
  averageScore: number
  bestScore: number
  worstScore: number
  flavorAverage: number
  sensoryAverage: number
  recentTrend: TrendPoint[]
  favoriteFlavors: FlavorFrequency[]
  visitedCafes: CafeFrequency[]
  monthlyActivity: MonthlyData[]
  achievements: Achievement[]
}

interface TrendPoint {
  date: string
  score: number
  tastingId: string
}

interface FlavorFrequency {
  name: string
  count: number
  percentage: number
}

interface CafeFrequency {
  name: string
  count: number
  lastVisit: string
}
```

### Supabase 쿼리

```sql
-- 사용자 통계 조회
SELECT
  COUNT(*) as total_tastings,
  AVG(match_scores->>'total') as average_score,
  MAX(match_scores->>'total') as best_score,
  MIN(match_scores->>'total') as worst_score
FROM tasting_records
WHERE user_id = $1;

-- 향미 선택 빈도
SELECT
  flavor,
  COUNT(*) as frequency
FROM (
  SELECT unnest(unified_flavor) as flavor
  FROM tasting_records
  WHERE user_id = $1
) flavors
GROUP BY flavor
ORDER BY frequency DESC
LIMIT 10;

-- 카페 방문 통계
SELECT
  coffee_info->>'cafe_name' as cafe_name,
  COUNT(*) as visit_count,
  MAX(created_at) as last_visit
FROM tasting_records
WHERE user_id = $1
GROUP BY cafe_name
ORDER BY visit_count DESC
LIMIT 5;
```

### Chart.js 설정들

```typescript
// 트렌드 라인 차트
const trendConfig = {
  type: 'line',
  data: {
    labels: dates,
    datasets: [
      {
        label: '매치 스코어',
        data: scores,
        borderColor: '#7C5842',
        backgroundColor: 'rgba(124, 88, 66, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  },
}

// 선호도 도넛 차트
const flavorConfig = {
  type: 'doughnut',
  data: {
    labels: flavorNames,
    datasets: [
      {
        data: flavorCounts,
        backgroundColor: coffeeColorPalette,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  },
}
```

---

## 🎨 디자인 토큰

### 색상 팔레트

```css
/* 차트 색상 */
--color-chart-primary: #7c5842;
--color-chart-secondary: #a0796a;
--color-chart-tertiary: #d4b896;
--color-chart-background: #fff8f0;

/* 프로그레스 바 */
--color-progress-excellent: #28a745; /* 90%+ */
--color-progress-good: #7c5842; /* 70-89% */
--color-progress-fair: #ffc107; /* 50-69% */
--color-progress-poor: #dc3545; /* <50% */

/* 성취 배지 */
--color-achievement-gold: #ffd700;
--color-achievement-silver: #c0c0c0;
--color-achievement-bronze: #cd7f32;
```

### 차트 스타일

```css
.chart-container {
  position: relative;
  height: 300px;
  margin: 1rem 0;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.1);
}

.chart-section {
  margin-bottom: 2rem;
}

.chart-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #7c5842;
  margin-bottom: 1rem;
}
```

### 통계 카드

```css
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.summary-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.1);
}

.summary-item .number {
  display: block;
  font-size: 2rem;
  font-weight: 900;
  color: #7c5842;
}

.summary-item .label {
  font-size: 0.9rem;
  color: #666;
}
```

### 프로그레스 바

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e8d5c4;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c5842, #a0796a);
  border-radius: 4px;
  transition: width 1s ease-in-out;
}
```

---

## 🧪 테스트 시나리오

### 기본 동작 테스트

1. **데이터 로딩**: Supabase에서 통계 데이터 정상 조회
2. **차트 렌더링**: 모든 Chart.js 차트 정상 표시
3. **통계 계산**: 평균, 최고점 등 올바른 계산
4. **반응형**: 다양한 화면 크기에서 레이아웃 확인

### 데이터 시나리오

1. **신규 사용자**: 테이스팅 기록이 없는 경우
2. **데이터 부족**: 차트 표시에 필요한 최소 데이터 미달
3. **대량 데이터**: 많은 테이스팅 기록이 있는 경우

### 에러 케이스

1. **네트워크 오류**: Supabase 연결 실패 시 처리
2. **차트 오류**: Chart.js 렌더링 실패 시 대체 UI
3. **권한 오류**: 로그인하지 않은 사용자 접근

---

## 📋 TODO

### 🔥 High Priority

- [ ] **실시간 업데이트**: 새 테이스팅 완료 시 통계 자동 갱신
- [ ] **목표 설정**: 개인 목표 설정 및 진행률 추적
- [ ] **비교 기능**: 다른 사용자와 익명 비교

### 🟡 Medium Priority

- [ ] **월별 분석**: 월/분기별 상세 분석 페이지
- [ ] **필터링**: 기간/카테고리별 필터 기능
- [ ] **내보내기**: 통계를 이미지/PDF로 저장

### 🟢 Low Priority

- [ ] **AI 인사이트**: 패턴 분석 기반 개인화 추천
- [ ] **소셜 기능**: 친구와 통계 공유
- [ ] **예측 분석**: 미래 성과 예측 모델

---

## 🔗 관련 파일

### 의존성

- `lib/supabase.ts` - 데이터베이스 연결
- `stores/auth.ts` - 사용자 인증 정보
- `stores/notification.ts` - 알림 시스템
- `utils/statsCalculator.ts` - 통계 계산 로직
- `chart.js` - 차트 라이브러리

### 연관 페이지

- `ResultView.vue` - 통계 보기 버튼에서 접근
- `RecordsListView.vue` - 기록 상세 보기
- `AchievementsView.vue` - 성취 시스템
- `ProfileView.vue` - 개인 설정

### 컴포넌트

- `StatCard.vue` - 통계 카드 컴포넌트
- `TrendChart.vue` - 트렌드 차트 컴포넌트
- `ProgressBar.vue` - 프로그레스 바 컴포넌트

---

## 📈 비즈니스 메트릭

### 사용자 참여도

- **통계 페이지 방문율**: 전체 사용자 중 통계 확인 비율
- **체류 시간**: 통계 페이지 평균 체류 시간
- **재방문율**: 통계 페이지 재방문 빈도

### 동기부여 효과

- **테이스팅 증가율**: 통계 확인 후 테이스팅 빈도 증가
- **목표 달성률**: 설정한 목표 달성 비율
- **성취 완료율**: 성취 과제 완료 비율

### 데이터 인사이트

- **평균 매치 스코어**: 전체 사용자 평균 매치 스코어
- **성장률**: 신규 사용자의 실력 향상 속도
- **이탈 패턴**: 통계 확인 후 이탈하는 사용자 패턴

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 1.0_
