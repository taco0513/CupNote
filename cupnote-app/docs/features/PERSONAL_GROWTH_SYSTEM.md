# 🌱 CupNote Personal Growth System

## 📋 개요

개인 성장 시스템은 사용자의 **커피 여정을 추적하고 동기부여**를 제공하는 핵심 기능입니다. 단순한 기록을 넘어 사용자가 성장하고 있다는 실감을 주는 것이 목표입니다.

**설계 철학**: "과정을 즐기다 보면 어느새 늘어있다"

---

## 🎯 시스템 구성

### 3가지 핵심 요소

1. **Statistics (통계)** - 나의 커피 여정 데이터
2. **Achievements (성취)** - 배지 시스템으로 이정표 제공
3. **Progression (진행도)** - 레벨업과 XP로 성장 시각화

---

## 📊 Statistics System (통계 시스템)

### 기본 통계 (Core Stats)

```typescript
interface UserStats {
  // 기본 카운터
  totalCups: number // 총 N잔 기록
  totalCafes: number // N개 카페 방문
  totalRoasters: number // N개 로스터리 발견
  totalFlavors: number // 경험한 향미 개수

  // 시간별 통계
  thisMonth: MonthlyStats
  thisWeek: WeeklyStats

  // 감각 발달
  avgMatchScore: number // 평균 매치 스코어
  bestScore: number // 최고 점수
  scoreImprovement: number // 전월 대비 향상도

  // 연속성
  currentStreak: number // 현재 연속 기록 일수
  bestStreak: number // 최대 연속 기록

  // 취향 프로필
  favoriteFlavorCategory: string // 가장 자주 선택한 향미 카테고리
  preferredCafes: CafeStats[] // 자주 방문하는 카페 TOP 3
  preferredRoasters: RoasterStats[] // 선호 로스터리 TOP 3
}

interface MonthlyStats {
  cups: number
  newCafes: number
  newRoasters: number
  avgScore: number
  highestScore: number
}

interface WeeklyStats {
  cups: number
  activeDays: number // 이번 주 기록한 날짜 수
  newExperiences: number // 새로운 경험 수 (카페+로스터리)
}
```

### 취향 분석 (Taste Profile)

```typescript
interface TasteProfile {
  // 향미 선호도
  flavorPreferences: {
    [category: string]: {
      frequency: number // 선택 빈도
      satisfaction: number // 해당 향미 선택 시 평균 점수
    }
  }

  // 감각 패턴
  sensoryPatterns: {
    acidity: 'bright' | 'mild' | 'low'
    sweetness: 'high' | 'medium' | 'subtle'
    body: 'light' | 'medium' | 'full'
    finish: 'short' | 'medium' | 'long'
  }

  // 커피 스타일
  preferredStyle: {
    origin: string[] // 선호 원산지
    process: string[] // 선호 가공방식
    roastLevel: string[] // 선호 로스팅 레벨
  }

  // 개인적 특징
  personalTraits: string[] // ["산미 민감", "초콜릿 애호가", "균형추구형"]
}
```

### 통계 UI 구성

```
┌─────────────────────────────┐
│ 📊 나의 커피 여정            │
├─────────────────────────────┤
│ 이번 달 성과                │
│ ☕ 15잔  🏪 3개 카페        │
│ 🌱 2개 로스터리             │
│ 📈 평균 76점 (+8점 향상)     │
├─────────────────────────────┤
│ 전체 기록                   │
│ 총 127잔 | 23개 카페 방문    │
│ 12개 로스터리 | 최고 94점    │
├─────────────────────────────┤
│ 나의 취향                   │
│ 💕 과일향 애호가             │
│ 🎯 산미에 민감한 타입        │
│ ⚖️ 균형잡힌 커피 선호       │
└─────────────────────────────┘
```

---

## 🏆 Achievement System (성취 배지)

### 배지 카테고리

#### 1. 기록 관련 (Recording)

```typescript
const RECORDING_BADGES = {
  FIRST_CUP: {
    name: '첫 잔의 기억',
    description: '첫 커피 기록 완료',
    icon: '☕',
    tier: 'bronze',
    requirement: 1,
  },
  CUP_COLLECTOR_BRONZE: {
    name: '컵 컬렉터',
    description: '10잔 기록 달성',
    icon: '🏆',
    tier: 'bronze',
    requirement: 10,
  },
  CUP_COLLECTOR_SILVER: {
    name: '컵 컬렉터',
    description: '50잔 기록 달성',
    icon: '🏆',
    tier: 'silver',
    requirement: 50,
  },
  CUP_COLLECTOR_GOLD: {
    name: '컵 컬렉터',
    description: '100잔 기록 달성',
    icon: '🏆',
    tier: 'gold',
    requirement: 100,
  },
  MONTHLY_ACHIEVER: {
    name: '이달의 커피러',
    description: '한 달에 20잔 이상 기록',
    icon: '📅',
    tier: 'silver',
    requirement: 20,
  },
}
```

#### 2. 탐험 관련 (Exploration)

```typescript
const EXPLORATION_BADGES = {
  CAFE_EXPLORER_BRONZE: {
    name: '카페 탐험가',
    description: '5개 카페 방문',
    icon: '🗺️',
    tier: 'bronze',
    requirement: 5,
  },
  ROASTER_HUNTER_BRONZE: {
    name: '로스터리 헌터',
    description: '3개 로스터리 발견',
    icon: '🎯',
    tier: 'bronze',
    requirement: 3,
  },
  FLAVOR_ADVENTURER: {
    name: '향미 모험가',
    description: '모든 향미 카테고리 경험',
    icon: '🌈',
    tier: 'gold',
    requirement: 'all_categories',
  },
  ORIGIN_EXPLORER: {
    name: '원산지 탐험가',
    description: '10개 이상 원산지 경험',
    icon: '🌍',
    tier: 'silver',
    requirement: 10,
  },
}
```

#### 3. 감각 관련 (Sensory)

```typescript
const SENSORY_BADGES = {
  TASTE_ACCURACY: {
    name: '정확한 감각',
    description: '매치 스코어 90점 이상 달성',
    icon: '🎯',
    tier: 'gold',
    requirement: 90,
  },
  CONSISTENT_TESTER: {
    name: '꾸준한 테이스터',
    description: '7일 연속 기록',
    icon: '🔥',
    tier: 'silver',
    requirement: 7,
  },
  FLAVOR_EXPERT: {
    name: '향미 전문가',
    description: '50개 이상 향미 경험',
    icon: '👨‍🎓',
    tier: 'gold',
    requirement: 50,
  },
  SENSORY_MASTER: {
    name: '감각 마스터',
    description: '모든 감각 표현 사용',
    icon: '🧠',
    tier: 'platinum',
    requirement: 'all_sensory',
  },
}
```

#### 4. 성장 관련 (Growth)

```typescript
const GROWTH_BADGES = {
  IMPROVEMENT_STAR: {
    name: '성장하는 별',
    description: '월평균 10점 이상 향상',
    icon: '⭐',
    tier: 'silver',
    requirement: 10,
  },
  PERFECT_SCORE: {
    name: '완벽한 점수',
    description: '매치 스코어 100점 달성',
    icon: '💯',
    tier: 'platinum',
    requirement: 100,
  },
  LEARNING_CURVE: {
    name: '학습 곡선',
    description: '3개월 연속 점수 향상',
    icon: '📈',
    tier: 'gold',
    requirement: '3_months_improvement',
  },
}
```

#### 5. 커뮤니티 관련 (Community)

```typescript
const COMMUNITY_BADGES = {
  FIRST_SHARE: {
    name: '첫 공유',
    description: '결과를 처음 공유',
    icon: '📤',
    tier: 'bronze',
    requirement: 1,
  },
  HELPFUL_REVIEWER: {
    name: '도움이 되는 리뷰어',
    description: '공개 노트 10개 작성',
    icon: '✍️',
    tier: 'silver',
    requirement: 10,
  },
  COMMUNITY_CONTRIBUTOR: {
    name: '커뮤니티 기여자',
    description: '좋아요 100개 이상 받기',
    icon: '👍',
    tier: 'gold',
    requirement: 100,
  },
}
```

### 배지 획득 알림

```
🎉 새 배지 획득!

🏆 컵 컬렉터 (실버)
50잔 기록을 달성했어요!

+50 XP 보너스
다음 목표: 컵 컬렉터 (골드) - 100잔
```

---

## ⬆️ Level & XP System (레벨 시스템)

### 레벨 구조

```typescript
interface UserLevel {
  currentLevel: number // 현재 레벨 (1-50)
  currentXP: number // 현재 경험치
  nextLevelXP: number // 다음 레벨까지 필요 XP
  totalXP: number // 총 누적 XP
  title: string // 레벨별 타이틀
  titleColor: string // 타이틀 색상
}

// XP 계산 공식: 다음 레벨 = 현재 레벨 * 100 + 50
const calculateRequiredXP = (level: number) => level * 100 + 50
```

### XP 획득 규칙

```typescript
const XP_REWARDS = {
  // 기본 액션
  COMPLETE_TASTING: 10, // 테이스팅 4단계 완료
  PARTIAL_TASTING: 5, // 부분 완료 (2-3단계)

  // 점수별 보너스
  HIGH_MATCH_SCORE_80: 5, // 80점 이상
  HIGH_MATCH_SCORE_90: 10, // 90점 이상
  PERFECT_SCORE: 25, // 100점

  // 탐험 보너스
  NEW_CAFE: 15, // 새 카페 방문
  NEW_ROASTER: 20, // 새 로스터리 발견
  NEW_FLAVOR: 3, // 새 향미 경험

  // 연속성 보너스
  DAILY_STREAK_3: 5, // 3일 연속
  DAILY_STREAK_7: 15, // 7일 연속
  DAILY_STREAK_30: 50, // 30일 연속

  // 커뮤니티 참여
  FIRST_SHARE: 10, // 첫 공유
  SHARE_RESULT: 3, // 결과 공유
  WRITE_PUBLIC_NOTE: 5, // 공개 노트 작성
  RECEIVE_LIKE: 1, // 좋아요 받기

  // 배지 획득 보너스
  BADGE_BRONZE: 25, // 브론즈 배지
  BADGE_SILVER: 50, // 실버 배지
  BADGE_GOLD: 100, // 골드 배지
  BADGE_PLATINUM: 200, // 플래티넘 배지
}
```

### 레벨별 타이틀

```typescript
const LEVEL_TITLES = {
  1-5: {
    title: "커피 입문자",
    emoji: "☕",
    color: "#8B4513"
  },
  6-15: {
    title: "향미 탐험가",
    emoji: "🧭",
    color: "#D2691E"
  },
  16-25: {
    title: "감각 개발자",
    emoji: "👁️",
    color: "#CD853F"
  },
  26-35: {
    title: "테이스팅 전문가",
    emoji: "🎯",
    color: "#B8860B"
  },
  36-45: {
    title: "커피 마스터",
    emoji: "👑",
    color: "#DAA520"
  },
  46-50: {
    title: "커피 그랜드마스터",
    emoji: "💎",
    color: "#FFD700"
  }
}
```

### 레벨업 알림

```
🎉 레벨업!

Lv.12 향미 탐험가 🧭

새로운 기능 해제:
• 고급 향미 필터
• 취향 분석 리포트
• 월간 성장 그래프

다음 레벨까지: 340/1250 XP
```

---

## 📱 UI/UX 구현

### 1. 개인 프로필 메인

```
┌─────────────────────────────┐
│ 👤 김커피 (Lv.12) 🧭        │
│ 향미 탐험가                 │
│ ████████░░ 340/1250 XP      │
├─────────────────────────────┤
│ 📊 이번 달 성과              │
│ ☕ 15잔  🏪 3개 카페        │
│ 🌱 2개 로스터리             │
│ 📈 평균 76점 (+8점 ↗)       │
├─────────────────────────────┤
│ 🏆 최근 획득 배지            │
│ [카페탐험가] [연속기록자]    │
│ [더 보기]                   │
├─────────────────────────────┤
│ 🎯 진행 중인 목표            │
│ • 컵 컬렉터 (골드): 73/100  │
│ • 연속 기록: 5일째 🔥       │
└─────────────────────────────┘
```

### 2. 통계 상세 페이지

```
┌─────────────────────────────┐
│ 📊 상세 통계                │
├─────────────────────────────┤
│ 전체 기록                   │
│ 🏆 총 127잔 기록            │
│ 🗺️ 23개 카페 방문           │
│ 🎯 12개 로스터리 발견        │
│ ⭐ 최고 점수: 94점          │
├─────────────────────────────┤
│ 월별 추이 📈                │
│ [그래프 영역]               │
├─────────────────────────────┤
│ 나의 취향 프로필 💕          │
│ • 과일향 선호 (34%)         │
│ • 산미에 민감               │
│ • 균형잡힌 커피 선호         │
└─────────────────────────────┘
```

### 3. 배지 컬렉션

```
┌─────────────────────────────┐
│ 🏆 나의 배지 컬렉션          │
├─────────────────────────────┤
│ 획득한 배지 (8/25)          │
│                             │
│ [🏆][☕][🗺️][🎯]            │
│ [⭐][🔥][📈][📤]            │
│ [  ][  ][  ][  ]           │
│                             │
│ 진행률: ████░░░░ 32%        │
├─────────────────────────────┤
│ 다음 획득 예정              │
│ 🌈 향미 모험가              │
│ "3개 카테고리 더 필요"       │
│                             │
│ 👨‍🎓 향미 전문가             │
│ "12개 향미 더 필요"         │
└─────────────────────────────┘
```

---

## 📊 데이터베이스 설계

```sql
-- 사용자 통계
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY,
  total_cups INTEGER DEFAULT 0,
  total_cafes INTEGER DEFAULT 0,
  total_roasters INTEGER DEFAULT 0,
  total_flavors INTEGER DEFAULT 0,
  avg_match_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  monthly_stats JSONB DEFAULT '{}',
  taste_profile JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 레벨 및 XP
CREATE TABLE user_levels (
  user_id UUID PRIMARY KEY,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  title VARCHAR(50) DEFAULT '커피 입문자',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 배지 획득 기록
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- XP 획득 로그
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 목표 (개인 설정)
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 업데이트 로직

### 통계 업데이트 트리거

```typescript
// 테이스팅 완료 시
async function onTastingComplete(userId: string, tastingData: TastingRecord) {
  // 1. 기본 통계 업데이트
  await updateBasicStats(userId, {
    totalCups: +1,
    totalCafes: tastingData.isNewCafe ? +1 : 0,
    totalRoasters: tastingData.isNewRoaster ? +1 : 0,
    newFlavors: tastingData.newFlavors.length,
  })

  // 2. XP 계산 및 부여
  const xpGain = calculateXPGain(tastingData)
  await addXP(userId, xpGain)

  // 3. 배지 확인 및 부여
  await checkAndAwardBadges(userId)

  // 4. 레벨업 확인
  await checkLevelUp(userId)

  // 5. 취향 프로필 업데이트
  await updateTasteProfile(userId, tastingData)
}
```

### 실시간 성과 표시

```typescript
// ResultView에서 즉시 표시
const achievements = {
  xpGained: 15,
  newBadges: ['CAFE_EXPLORER_BRONZE'],
  levelUp: false,
  streakBonus: true,
  streakDays: 5,
}
```

---

## 📈 성공 지표

### 정량적 지표

- 배지 획득률: >80% (첫 달)
- 레벨 10 달성률: >50% (3개월)
- 연속 기록 평균: >3일
- 통계 페이지 방문율: >60%

### 정성적 지표

- 성장 실감도 설문
- 동기부여 효과 측정
- 장기 사용자 유지율
- 앱 만족도 점수

---

## 🎬 구현 우선순위

### MVP (Phase 1)

- [x] 기본 통계 시스템 설계
- [x] 핵심 배지 10개 정의
- [x] 레벨 시스템 (1-20레벨)
- [ ] XP 시스템 구현
- [ ] 기본 UI 구현

### Phase 2

- [ ] 고급 통계 및 그래프
- [ ] 배지 확장 (25개)
- [ ] 개인 목표 설정
- [ ] 취향 프로필 고도화

### Phase 3

- [ ] 소셜 비교 기능
- [ ] 시즌별 이벤트
- [ ] AI 추천 시스템
- [ ] 커스터마이징

---

**핵심 메시지**: "작은 기록이 모여 큰 성장이 됩니다" 🌱✨
