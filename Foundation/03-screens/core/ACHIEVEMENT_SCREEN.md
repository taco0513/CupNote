# AchievementScreen - 성취 및 배지 화면

> 사용자의 테이스팅 성취를 시각화하고 게이미피케이션을 통한 동기부여 시스템

## 📱 화면 개요

**구현 파일**: `[screens]/achievement/AchievementScreen`  
**역할**: 사용자 성취 추적, 배지 갤러리, 개인 통계 상세 분석  
**접근**: 하단 탭 네비게이션 세 번째 탭  
**특징**: 게이미피케이션 중심의 동기부여 시스템

## 🎯 기능 정의

### 기술적 목표
- 사용자의 테이스팅 활동을 성취로 변환하여 지속적 참여 유도
- 개인 성장 지표를 시각적으로 표현하는 대시보드 시스템
- 12개 기본 성취 배지와 확장 가능한 성취 프레임워크 제공

### 핵심 기능
- **배지 갤러리**: 획득한 성취 배지의 시각적 컬렉션
- **진행 추적**: 현재 진행 중인 성취의 실시간 프로그레스
- **개인 통계**: 테이스팅 활동의 종합적 데이터 분석
- **성취 알림**: 새로운 배지 획득시 축하 및 안내

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: "나의 성취" + 전체 진행률 (%)
├── 성취 요약 카드
│   ├── 🏆 총 획득 배지: 8/12
│   ├── 📊 전체 진행률: 67%
│   ├── 🔥 현재 연속: 5일
│   └── ⭐ 다음 목표: "Decuple Taster" (2개 남음)
├── 배지 갤러리 (스크롤 그리드)
│   ├── 📚 First Tasting (완료)
│   ├── ☕ Cafe Explorer (완료)  
│   ├── 🏠 Home Brewer (완료)
│   ├── 🔬 Lab Analyst (완료)
│   ├── 🎯 Accurate Palate (완료)
│   ├── 💯 Perfect Match (완료)
│   ├── 🌟 Flavor Hunter (완료)
│   ├── 📈 Progress Tracker (완료)
│   ├── 🎊 Decuple Taster (진행중: 8/10)
│   ├── 🏆 Achievement Hunter (진행중: 8/12)
│   ├── 🔥 Consistency King (잠금: 0/7)
│   └── 🌍 Global Palate (잠금: 0/10)
├── 개인 통계 섹션
│   ├── 📊 테이스팅 통계
│   │   ├── 총 테이스팅: 52회
│   │   ├── 이번 달: 18회
│   │   ├── 평균 점수: 7.8/10
│   │   └── 최고 점수: 9.2/10
│   ├── 📈 활동 패턴
│   │   ├── 가장 활발한 요일: 토요일
│   │   ├── 선호 시간대: 오후 2-4시
│   │   ├── 연속 기록: 5일 (현재)
│   │   └── 최장 연속: 12일 (2025.06)
│   ├── ☕ 커피 선호도
│   │   ├── 최다 카페: 블루보틀 (12회)
│   │   ├── 선호 향미: Chocolate (28회)
│   │   ├── 선호 원산지: 에티오피아 (15회)
│   │   └── 평균 Match Score: 78%
│   └── 🎯 모드별 사용
│       ├── Cafe Mode: 32회 (62%)
│       ├── HomeCafe Mode: 15회 (29%)
│       └── Lab Mode: 5회 (9%)
├── 최근 활동 히스토리
│   ├── 2025.07.28: 🎊 "Decuple Taster" 진행 (8/10)
│   ├── 2025.07.25: 🌟 "Flavor Hunter" 배지 획득!
│   ├── 2025.07.22: 💯 "Perfect Match" 배지 획득!
│   └── 더보기...
└── 공유 및 설정
    ├── 📱 성취 공유하기
    ├── 🔔 알림 설정
    └── 📊 상세 통계 보기
```

### 디자인 원칙
- **성취감 강조**: 골드 컬러와 반짝이는 효과로 특별함 연출
- **진행률 시각화**: 프로그레스 바와 차트로 직관적 표현
- **계층적 정보**: 요약 → 상세 → 히스토리 순서로 정보 제공
- **인터랙티브**: 배지 터치시 상세 정보 및 획득 조건 표시

## 💾 데이터 처리

### 입력 데이터 (성취 시스템 상태)
```typescript
interface AchievementScreenData {
  // 사용자 성취 현황
  user_achievements: UserAchievement[];
  
  // 개인 통계
  personal_stats: PersonalStats;
  
  // 최근 활동
  recent_activities: AchievementActivity[];
  
  // 시스템 설정
  notification_settings: NotificationSettings;
}

interface UserAchievement {
  achievement_id: string;              // "first_tasting"
  achievement_data: Achievement;       // 배지 정보
  status: AchievementStatus;          // earned, in_progress, locked
  progress: number;                   // 0-100%
  current_count: number;              // 현재 진행 수
  target_count: number;               // 목표 수
  earned_at?: Date;                   // 획득 날짜
  notification_sent: boolean;         // 알림 발송 여부
}

interface Achievement {
  id: string;
  name: string;                       // "First Tasting"
  description: string;                // "첫 번째 커피 테이스팅 완료"
  icon: string;                       // 📚
  category: AchievementCategory;      // MILESTONE, SKILL, STREAK, EXPLORATION
  rarity: AchievementRarity;          // COMMON, RARE, EPIC, LEGENDARY
  points: number;                     // 10-100 포인트
  unlock_condition: UnlockCondition;  // 잠금 해제 조건
}

enum AchievementStatus {
  LOCKED = 'locked',                  // 조건 미달성, 잠금 상태
  IN_PROGRESS = 'in_progress',        // 진행 중
  EARNED = 'earned'                   // 획득 완료
}

enum AchievementCategory {
  MILESTONE = 'milestone',            // 기념비적 성취
  SKILL = 'skill',                    // 실력 관련 성취
  STREAK = 'streak',                  // 연속성 관련 성취
  EXPLORATION = 'exploration'         // 탐험 관련 성취
}

enum AchievementRarity {
  COMMON = 'common',                  // 일반 (청동색)
  RARE = 'rare',                      // 희귀 (은색)
  EPIC = 'epic',                      // 에픽 (금색)
  LEGENDARY = 'legendary'             // 전설 (다이아몬드)
}
```

### 12개 기본 성취 배지 시스템
```typescript
const BASE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_tasting',
    name: 'First Tasting',
    description: '첫 번째 커피 테이스팅을 완료했습니다',
    icon: '📚',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.COMMON,
    points: 10,
    unlock_condition: { tasting_count: 1 }
  },
  {
    id: 'cafe_explorer',
    name: 'Cafe Explorer', 
    description: '3개의 서로 다른 카페를 방문했습니다',
    icon: '☕',
    category: AchievementCategory.EXPLORATION,
    rarity: AchievementRarity.COMMON,
    points: 20,
    unlock_condition: { unique_cafes: 3 }
  },
  {
    id: 'home_brewer',
    name: 'Home Brewer',
    description: 'HomeCafe Mode로 5회 테이스팅을 완료했습니다',
    icon: '🏠',
    category: AchievementCategory.SKILL,
    rarity: AchievementRarity.COMMON,
    points: 25,
    unlock_condition: { homecafe_count: 5 }
  },
  {
    id: 'lab_analyst',
    name: 'Lab Analyst',
    description: 'Lab Mode로 첫 번째 전문 분석을 완료했습니다',
    icon: '🔬',
    category: AchievementCategory.SKILL,
    rarity: AchievementRarity.RARE,
    points: 40,
    unlock_condition: { lab_count: 1 }
  },
  {
    id: 'accurate_palate',
    name: 'Accurate Palate',
    description: 'Match Score 80% 이상을 5회 달성했습니다',
    icon: '🎯',
    category: AchievementCategory.SKILL,
    rarity: AchievementRarity.RARE,
    points: 50,
    unlock_condition: { high_match_count: 5, min_match_score: 80 }
  },
  {
    id: 'perfect_match',
    name: 'Perfect Match',
    description: 'Match Score 95% 이상을 달성했습니다',
    icon: '💯',
    category: AchievementCategory.SKILL,
    rarity: AchievementRarity.EPIC,  
    points: 75,
    unlock_condition: { max_match_score: 95 }
  },
  {
    id: 'flavor_hunter',
    name: 'Flavor Hunter',
    description: '25가지 서로 다른 향미를 발견했습니다',
    icon: '🌟',
    category: AchievementCategory.EXPLORATION,
    rarity: AchievementRarity.RARE,
    points: 60,
    unlock_condition: { unique_flavors: 25 }
  },
  {
    id: 'progress_tracker',
    name: 'Progress Tracker',
    description: '연속 7일간 테이스팅을 기록했습니다',
    icon: '📈',
    category: AchievementCategory.STREAK,
    rarity: AchievementRarity.RARE,
    points: 55,
    unlock_condition: { daily_streak: 7 }
  },
  {
    id: 'decuple_taster',
    name: 'Decuple Taster',
    description: '10회 테이스팅을 완료했습니다',
    icon: '🎊',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.COMMON,
    points: 30,
    unlock_condition: { tasting_count: 10 }
  },
  {
    id: 'achievement_hunter',
    name: 'Achievement Hunter',
    description: '모든 기본 배지를 획득했습니다',
    icon: '🏆',
    category: AchievementCategory.MILESTONE,
    rarity: AchievementRarity.LEGENDARY,
    points: 100,
    unlock_condition: { achievement_count: 11 } // 자신 제외
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: '연속 30일간 테이스팅을 기록했습니다',
    icon: '🔥',
    category: AchievementCategory.STREAK,
    rarity: AchievementRarity.LEGENDARY,
    points: 150,
    unlock_condition: { daily_streak: 30 }
  },
  {
    id: 'global_palate',
    name: 'Global Palate',
    description: '10개국의 서로 다른 원산지 커피를 테이스팅했습니다',
    icon: '🌍',
    category: AchievementCategory.EXPLORATION,
    rarity: AchievementRarity.EPIC,
    points: 120,
    unlock_condition: { unique_origins: 10 }
  }
];
```

### 실시간 진행률 계산
```typescript
const calculateAchievementProgress = (
  achievement: Achievement,
  userStats: PersonalStats
): AchievementProgress => {
  const condition = achievement.unlock_condition;
  let current = 0;
  let target = 0;
  
  switch (achievement.id) {
    case 'first_tasting':
    case 'decuple_taster':
      current = userStats.total_tastings;
      target = condition.tasting_count;
      break;
      
    case 'cafe_explorer':
      current = userStats.unique_cafes;
      target = condition.unique_cafes;
      break;
      
    case 'accurate_palate':
      current = userStats.high_match_scores.length;
      target = condition.high_match_count;
      break;
      
    case 'progress_tracker':
    case 'consistency_king':
      current = userStats.current_streak;
      target = condition.daily_streak;
      break;
      
    // ... 기타 성취들
  }
  
  const progress = Math.min((current / target) * 100, 100);
  const status = progress >= 100 ? 
    AchievementStatus.EARNED : 
    (progress > 0 ? AchievementStatus.IN_PROGRESS : AchievementStatus.LOCKED);
    
  return {
    current,
    target,
    progress,
    status,
    is_new: false // 새로 획득했는지 여부
  };
};
```

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **AchievementSummary**: 상단 전체 진행률 요약 카드
- **BadgeGallery**: 배지 그리드 갤러리 컴포넌트
- **AchievementBadge**: 개별 배지 표시 컴포넌트
- **ProgressChart**: 개인 통계 차트 시각화
- **ActivityTimeline**: 최근 활동 타임라인
- **AchievementDetail**: 배지 상세 정보 모달
- **NotificationToast**: 새 배지 획득 알림

### Tamagui 스타일링
```typescript
const AchievementContainer = styled(ScrollView, {
  flex: 1,
  backgroundColor: '$background',
  padding: '$md',
});

const SummaryCard = styled(Card, {
  backgroundColor: '$gold1',
  padding: '$lg',
  borderRadius: '$4',
  marginBottom: '$lg',
  borderWidth: 2,
  borderColor: '$gold8',
});

const BadgeGrid = styled(YStack, {
  gap: '$md',
});

const BadgeRow = styled(XStack, {
  justifyContent: 'space-between',
  gap: '$sm',
});

const AchievementBadge = styled(Card, {
  flex: 1,
  aspectRatio: 1,
  backgroundColor: '$gray2',
  padding: '$md',
  borderRadius: '$3',
  alignItems: 'center',
  justifyContent: 'center',
  
  variants: {
    status: {
      earned: {
        backgroundColor: '$gold2',
        borderWidth: 2,
        borderColor: '$gold8',
        // 반짝이는 효과 추가
      },
      in_progress: {
        backgroundColor: '$blue2',
        borderWidth: 2,
        borderColor: '$blue8',
      },
      locked: {
        backgroundColor: '$gray2',
        borderWidth: 1,
        borderColor: '$gray6',
        opacity: 0.6,
      }
    },
    
    rarity: {
      common: {
        // 기본 스타일
      },
      rare: {
        borderColor: '$silver',
        shadowColor: '$silver',
        shadowRadius: 4,
      },
      epic: {
        borderColor: '$gold10',
        shadowColor: '$gold10', 
        shadowRadius: 6,
      },
      legendary: {
        borderColor: '$purple10',
        shadowColor: '$purple10',
        shadowRadius: 8,
        // 더 화려한 효과
      }
    }
  } as const,
});

const ProgressBar = styled(Progress, {
  backgroundColor: '$gray4',
  
  variants: {
    category: {
      milestone: {
        '$progress-indicator': {
          backgroundColor: '$gold8',
        }
      },
      skill: {
        '$progress-indicator': {
          backgroundColor: '$blue8',
        }
      },
      streak: {
        '$progress-indicator': {
          backgroundColor: '$red8',
        }
      },
      exploration: {
        '$progress-indicator': {
          backgroundColor: '$green8',
        }
      }
    }
  } as const,
});
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **배지 터치**: 상세 정보 모달 표시 (획득 조건, 진행률, 팁)
2. **공유하기**: 획득한 배지나 전체 성취를 SNS 공유
3. **통계 보기**: 개인 통계 상세 화면으로 이동
4. **알림 설정**: 배지 획득 알림 on/off 설정
5. **히스토리**: 과거 성취 획득 기록 상세 보기

### 인터랙션 플로우
```
배지 갤러리 탐색 → 배지 선택 → 상세 정보 확인 → [공유/설정] → 다른 배지 탐색
```

### 알림 시스템
```typescript
const showAchievementNotification = (achievement: Achievement) => {
  // 새 배지 획득시 축하 알림
  Toast.show({
    type: 'achievement',
    title: `🎉 새로운 배지 획득!`,
    message: `"${achievement.name}" 배지를 획득했습니다!`,
    duration: 5000,
    action: {
      text: '확인하기',
      onPress: () => navigateToAchievement(achievement.id)
    }
  });
  
  // 햅틱 피드백
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
```

## 📊 개인 통계 시스템

### 통계 카테고리
```typescript
interface PersonalStats {
  // 기본 통계
  total_tastings: number;
  this_month_tastings: number;
  average_score: number;
  highest_score: number;
  
  // 활동 패턴
  most_active_day: string;        // "saturday"
  preferred_time: string;         // "14:00-16:00"
  current_streak: number;         // 연속 일수
  longest_streak: number;         // 최장 연속 기록
  
  // 선호도 분석
  favorite_cafe: string;
  favorite_flavor: string;
  favorite_origin: string;
  average_match_score: number;
  
  // 모드별 사용
  mode_distribution: {
    cafe: number;
    homecafe: number;
    lab: number;
  };
  
  // 성취 관련
  total_achievements: number;
  achievement_points: number;
  completion_rate: number;        // 전체 성취 완료율
}
```

### 통계 시각화
```typescript
const StatisticChart = ({ data, type }: StatisticChartProps) => {
  switch (type) {
    case 'progress':
      return <ProgressRing percentage={data.completion_rate} />;
    case 'activity':
      return <WeeklyActivityChart data={data.weekly_activity} />;
    case 'distribution':
      return <PieChart data={data.mode_distribution} />;
    case 'trend':
      return <LineChart data={data.monthly_trend} />;
  }
};
```

## 🔗 네비게이션

### 이전 화면
- **MainTabs**: 하단 탭 네비게이션에서 접근

### 다음 화면 (사용자 선택)
- **AchievementDetail**: 개별 배지 상세 정보 모달
- **StatisticsScreen**: 개인 통계 상세 분석 화면
- **SettingsScreen**: 알림 설정 화면
- **ShareModal**: 성취 공유 모달

### 딥링크 지원
```typescript
// 특정 배지로 직접 이동
achievement://badge/perfect_match

// 통계 섹션으로 이동  
achievement://statistics/activity
```

## 📈 성능 최적화

### 데이터 로딩
```typescript
const useAchievementData = () => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  
  useEffect(() => {
    // 배지 데이터는 즉시 로딩
    loadAchievements().then(setAchievements);
    
    // 통계는 백그라운드에서 로딩
    loadPersonalStats().then(setStats);
  }, []);
  
  return { achievements, stats };
};
```

### 배지 이미지 최적화
- **지연 로딩**: 화면에 보이는 배지만 우선 로딩
- **캐싱**: 배지 아이콘은 앱 번들에 포함하여 즉시 표시
- **압축**: 고해상도 배지 이미지는 WebP 형식으로 최적화

## 🧪 테스트 시나리오

### 기능 테스트
1. **배지 진행률**: 테이스팅 완료시 해당 배지 진행률 정확히 업데이트
2. **새 배지 획득**: 조건 달성시 배지 상태가 earned로 변경
3. **알림 표시**: 새 배지 획득시 알림 토스트 정상 표시
4. **통계 계산**: 개인 통계가 실제 데이터와 일치

### 사용성 테스트
1. **직관적 이해**: 배지 시스템을 처음 보는 사용자도 쉽게 이해
2. **동기부여**: 진행 중인 배지가 계속 도전할 의욕을 주는지
3. **성취감**: 배지 획득시 충분한 만족감을 제공하는지

### 에러 케이스
1. **데이터 불일치**: 통계와 배지 진행률이 맞지 않는 경우
2. **중복 알림**: 같은 배지에 대해 여러 번 알림 발생 방지
3. **네트워크 오류**: 데이터 로딩 실패시 기본값 표시

## 🚀 확장 가능성

### Phase 2 개선사항
- **시즌별 배지**: 특정 기간에만 획득 가능한 한정 배지
- **소셜 성취**: 친구와 함께 달성하는 협력 배지
- **지역별 배지**: 특정 지역 카페 방문 배지
- **커뮤니티 순위**: 다른 사용자들과의 성취 비교

### Phase 3 고급 기능
- **커스텀 배지**: 사용자가 직접 만드는 개인 목표
- **AR 배지**: 증강현실로 배지 수집 경험
- **NFT 연동**: 특별한 배지를 NFT로 발행
- **실제 리워드**: 배지와 연동된 실제 혜택 제공

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: HOME_SCREEN.md, ../features/ACHIEVEMENT_SYSTEM.md  
**구현 상태**: ✅ 완료 (12개 기본 배지 시스템)