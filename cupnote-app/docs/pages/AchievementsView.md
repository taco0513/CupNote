# AchievementsView.vue

## 📋 개요

**목적**: 사용자 성취 시스템 및 레벨 진행 상황을 표시하는 게이미피케이션 허브  
**위치**: `/src/views/AchievementsView.vue`  
**라우터**: `/achievements`  
**작성일**: 2025-07-30

CupNote의 게이미피케이션 시스템 중심부로, 사용자의 테이스팅 성취를 배지와 레벨 시스템으로 시각화하여 지속적인 참여 동기를 부여하는 핵심 기능 페이지입니다.

---

## 🎯 주요 기능

### 1. **레벨 진행 시스템** ⭐ 핵심 기능

- **10단계 레벨**: Coffee Newcomer부터 Coffee Master까지
- **포인트 기반**: 테이스팅 활동으로 포인트 획득
- **진행률 표시**: 다음 레벨까지의 진행률 시각화
- **최고 레벨 표시**: 레벨 10 달성 시 특별 UI

### 2. **배지 컬렉션 시스템**

- **다양한 배지**: 테이스팅 횟수, 매치 스코어, 특별 활동별 배지
- **획득/미획득 표시**: 시각적으로 구분되는 배지 상태
- **진행률 추적**: 각 배지별 달성 진행률 표시
- **숨겨진 배지**: 특별한 조건으로만 획득 가능한 히든 배지

### 3. **통계 연동**

- **실시간 업데이트**: 테이스팅 활동과 실시간 연동
- **StatsView 연결**: 통계 페이지와 원활한 네비게이션
- **사용자 데이터**: 개인화된 성취 현황 표시

### 4. **시각적 피드백**

- **그라데이션 디자인**: 프리미엄 커피 테마
- **애니메이션**: 부드러운 진행률 애니메이션
- **반응형 레이아웃**: 모바일/데스크탑 최적화

---

## 🔧 기술 명세

### Props

```typescript
// Props 없음 - 전역 상태 관리 의존
```

### Events

```typescript
// 내부 이벤트만 사용, 부모 컴포넌트로 emit 없음
```

### Composables & Stores

```typescript
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStatsStore } from '../stores/userStats'
import AchievementsOverview from '../components/achievements/AchievementsOverview.vue'

// 상태 관리
const authStore = useAuthStore()
const userStatsStore = useUserStatsStore()

// 계산된 속성들
const isLoading = computed(() => userStatsStore.isLoading)
const userLevel = computed(() => userStatsStore.userLevel)
const totalPoints = computed(() => userStatsStore.totalPoints)
const nextLevelProgress = computed(() => userStatsStore.nextLevelProgress)
const earnedCount = computed(() => userStatsStore.earnedAchievements?.length || 0)
const totalCount = computed(
  () => userStatsStore.achievements?.filter((a) => !a.is_hidden)?.length || 0,
)
```

### 주요 메서드

```typescript
const getNextLevelIcon = (level) => {
  const levelData = levelProgression.find((l) => l.level === level)
  return levelData?.icon || '🆕'
}

const getNextLevelTitle = (level) => {
  const levelData = levelProgression.find((l) => l.level === level)
  return levelData?.title || 'Coffee Newcomer'
}

// 초기화
onMounted(async () => {
  if (authStore.userId) {
    try {
      await userStatsStore.initializeUserStats(authStore.userId)
    } catch (err) {
      console.error('Failed to initialize achievements view:', err)
    }
  }
})
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
{
  path: '/achievements',
  name: 'achievements',
  component: AchievementsView,
  meta: {
    requiresAuth: true,
    title: '성취'
  }
}
```

### 네비게이션 플로우

```
성취 페이지 접근 경로
├── 통계 페이지 → /achievements
├── 결과 페이지 → /achievements (새 배지 획득 시)
├── 네비게이션 메뉴 → /achievements
└── 직접 URL 접근 → /achievements

성취 페이지에서 이동
├── 통계로 돌아가기 → /stats
├── 새 테이스팅 → /mode-selection
└── 홈으로 → /
```

---

## 📱 UI/UX 구조

### 레이아웃 구조

```vue
<template>
  <div class="achievements-view">
    <!-- 헤더 -->
    <header class="achievements-header">
      <div class="header-content">
        <RouterLink to="/stats" class="back-link"> ← 통계로 돌아가기 </RouterLink>
        <h1 class="achievements-title">🏆 배지 시스템</h1>
        <div class="header-stats">{{ earnedCount }}/{{ totalCount }} 획득</div>
      </div>
    </header>

    <!-- 레벨 진행 카드 -->
    <section class="level-progress-section">
      <div class="level-progress-card">
        <div class="level-info">
          <!-- 현재 레벨 -->
          <div class="current-level">
            <div class="level-icon-large">{{ userLevel.icon }}</div>
            <div class="level-details">
              <h2 class="level-title-large">{{ userLevel.title }}</h2>
              <div class="level-points-large">
                {{ totalPoints }}포인트 • Lv.{{ userLevel.level }}
              </div>
            </div>
          </div>

          <!-- 다음 레벨 미리보기 -->
          <div v-if="nextLevelProgress && userLevel.level < 10" class="next-level-preview">
            <div class="next-level-info">
              <span class="next-level-text">다음 레벨</span>
              <div class="next-level-details">
                <span class="next-level-icon">{{ getNextLevelIcon(userLevel.level + 1) }}</span>
                <span class="next-level-title">{{ getNextLevelTitle(userLevel.level + 1) }}</span>
              </div>
            </div>

            <!-- 진행률 바 -->
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

          <!-- 최고 레벨 달성 -->
          <div v-else-if="userLevel.level >= 10" class="max-level">
            <div class="max-level-icon">👑</div>
            <div class="max-level-text">최고 레벨 달성!</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 배지 오버뷰 컴포넌트 -->
    <AchievementsOverview />

    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">배지 정보를 불러오고 있습니다...</p>
    </div>
  </div>
</template>
```

### 스타일링 특징

- **그라데이션 카드**: 레벨 카드에 프리미엄 그라데이션 적용
- **글래스모피즘**: 반투명 효과와 백드롭 필터 사용
- **진행률 애니메이션**: 부드러운 진행률 바 애니메이션
- **반응형 디자인**: 모바일에서 수직 레이아웃으로 변경

---

## 🔄 최근 변경사항

### 2025-07-30: 게이미피케이션 시스템 완성

```typescript
// Before: 기본 배지 리스트
const achievements = ['First Cup', 'Coffee Explorer']

// After: 완전한 레벨 및 배지 시스템
const levelProgression = [
  { level: 1, title: 'Coffee Newcomer', icon: '🆕' },
  { level: 2, title: 'Beginner Taster', icon: '🌱' },
  // ... 10단계까지
  { level: 10, title: 'Coffee Master', icon: '🏆' },
]
```

**변경 이유**: 사용자 참여도 향상을 위한 완전한 게이미피케이션 시스템 구축

### 주요 개선사항

- ✅ 10단계 레벨 시스템 완성
- ✅ 다음 레벨 진행률 표시
- ✅ 최고 레벨 특별 UI 구현
- ✅ 배지 컬렉션 시스템 통합
- ✅ 실시간 통계 연동

---

## 📊 데이터 구조

### 레벨 진행 시스템

```typescript
interface LevelProgression {
  level: number
  title: string
  icon: string
  pointsRequired: number
}

const levelProgression: LevelProgression[] = [
  { level: 1, title: 'Coffee Newcomer', icon: '🆕', pointsRequired: 0 },
  { level: 2, title: 'Beginner Taster', icon: '🌱', pointsRequired: 100 },
  { level: 3, title: 'Coffee Explorer', icon: '🔍', pointsRequired: 250 },
  { level: 4, title: 'Casual Sipper', icon: '🌟', pointsRequired: 500 },
  { level: 5, title: 'Regular Taster', icon: '📈', pointsRequired: 1000 },
  { level: 6, title: 'Coffee Enthusiast', icon: '☕', pointsRequired: 2000 },
  { level: 7, title: 'Skilled Brewer', icon: '⭐', pointsRequired: 3500 },
  { level: 8, title: 'Advanced Cupper', icon: '🎯', pointsRequired: 5500 },
  { level: 9, title: 'Expert Taster', icon: '👑', pointsRequired: 8000 },
  { level: 10, title: 'Coffee Master', icon: '🏆', pointsRequired: 12000 },
]
```

### 배지 데이터 구조

```typescript
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  points: number
  is_hidden: boolean
  condition: {
    type: string
    target: number
    value?: any
  }
}
```

### 사용자 스탯 구조

```typescript
interface UserStats {
  userId: string
  totalPoints: number
  currentLevel: number
  totalTastings: number
  averageScore: number
  bestScore: number
  earnedAchievements: string[]
  createdAt: string
  updatedAt: string
}
```

### 다음 레벨 진행률

```typescript
interface NextLevelProgress {
  currentPoints: number
  nextLevelPoints: number
  needed: number
  progress: number // 0-100 퍼센트
}
```

---

## 🎨 디자인 토큰

### 색상 팔레트

```css
/* 레벨 카드 그라데이션 */
--gradient-level-card: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
--color-level-text: white;
--color-level-secondary: rgba(255, 255, 255, 0.9);

/* 진행률 바 */
--color-progress-bg: rgba(255, 255, 255, 0.2);
--color-progress-fill: linear-gradient(90deg, #fff, #f0e8dc);
--color-progress-text: #7c5842;

/* 배지 색상 */
--color-badge-earned: #ffd700; /* 획득한 배지 */
--color-badge-locked: #ccc; /* 미획득 배지 */
--color-badge-hidden: #999; /* 숨겨진 배지 */
```

### 타이포그래피

```css
/* 레벨 제목 */
.level-title-large {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

/* 포인트 표시 */
.level-points-large {
  font-size: 1.2rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

/* 진행률 텍스트 */
.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #7c5842;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}
```

### 레벨 카드 스타일

```css
.level-progress-card {
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(45deg);
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
```

### 진행률 바 애니메이션

```css
.level-progress-bar {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
}

.level-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fff, #f0e8dc);
  border-radius: 10px;
  transition: width 0.5s ease;
}
```

---

## 🧪 테스트 시나리오

### 기본 기능 테스트

1. **레벨 표시**: 현재 사용자 레벨 정확히 표시
2. **진행률 계산**: 다음 레벨까지 진행률 정확한 계산
3. **배지 개수**: 획득/전체 배지 개수 정확한 표시
4. **최고 레벨**: 레벨 10 달성 시 특별 UI 표시

### 상태별 테스트

1. **신규 사용자**: 레벨 1, 진행률 0% 표시
2. **중간 레벨**: 진행률 바 정상 작동
3. **최고 레벨**: 👑 아이콘과 "최고 레벨 달성!" 표시
4. **로딩 상태**: 데이터 로딩 중 스피너 표시

### 네비게이션 테스트

1. **통계 연결**: "통계로 돌아가기" 버튼 정상 작동
2. **배지 상세**: AchievementsOverview 컴포넌트 연동
3. **반응형**: 모바일에서 레이아웃 변경 확인

---

## 📋 TODO

### 🔥 High Priority

- [ ] **배지 알림**: 새 배지 획득 시 축하 애니메이션
- [ ] **레벨업 효과**: 레벨업 시 특별한 시각 효과
- [ ] **공유 기능**: 레벨/배지를 SNS에 공유

### 🟡 Medium Priority

- [ ] **배지 카테고리**: 배지를 카테고리별로 필터링
- [ ] **진행률 히스토리**: 레벨업 히스토리 차트
- [ ] **친구 비교**: 다른 사용자와 레벨 비교

### 🟢 Low Priority

- [ ] **시즌 배지**: 특별 이벤트 시즌 배지
- [ ] **커스텀 배지**: 사용자 정의 목표 배지
- [ ] **리더보드**: 전체 사용자 랭킹 시스템

---

## 🔗 관련 파일

### 의존성

- `stores/auth.ts` - 사용자 인증 정보
- `stores/userStats.ts` - 사용자 통계 및 성취 관리
- `components/achievements/AchievementsOverview.vue` - 배지 오버뷰

### 연관 페이지

- `StatsView.vue` - 통계 페이지 (이전 페이지)
- `ResultView.vue` - 결과 페이지 (새 배지 획득 알림)
- `HomeView.vue` - 홈 페이지

### 컴포넌트

- `AchievementCard.vue` - 개별 배지 카드
- `LevelProgressBar.vue` - 진행률 표시 컴포넌트
- `LoadingSpinner.vue` - 로딩 표시

---

## 📈 비즈니스 메트릭

### 게이미피케이션 효과

- **참여도 증가**: 배지 시스템 도입 후 테이스팅 빈도 증가율
- **리텐션 향상**: 레벨 시스템으로 인한 재방문율 개선
- **목표 달성률**: 사용자가 설정한 레벨 목표 달성 비율

### 사용자 행동 분석

- **페이지 체류 시간**: 성취 페이지 평균 체류 시간
- **배지 획득률**: 각 배지별 획득 비율
- **레벨 분포**: 사용자들의 레벨 분포 현황

### 동기 부여 지표

- **레벨업 후 활동**: 레벨업 직후 테이스팅 활동 증가율
- **배지 공유율**: 획득한 배지를 공유하는 비율
- **목표 설정률**: 다음 레벨 목표를 인식하고 활동하는 비율

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 1.0_
