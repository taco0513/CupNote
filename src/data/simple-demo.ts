// 간단한 데모 데이터
export const simpleDemoStats = {
  level: {
    level: 3,
    title: '커피 애호가',
    description: '커피에 대한 열정이 넘치는 단계입니다',
    requiredPoints: 1000,
    currentPoints: 1340,
    nextLevelPoints: 2000,
    progress: 65
  },
  totalPoints: 1340,
  totalRecords: 23,
  streaks: {
    current: 5,
    longest: 12,
    lastRecordDate: '2025-08-02'
  },
  averageRating: 4.2,
  exploredOrigins: ['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐'],
  exploredRoasteries: ['블루보틀', '스타벅스 리저브', '커피빈', '한스커피', '안트러사이트'],
  favorites: {
    origin: '에티오피아',
    roastery: '안트러사이트',
    brewMethod: '핸드드립'
  },
  achievements: [
    // 달성된 성취
    {
      id: '1',
      title: '첫 걸음마',
      description: '첫 번째 커피 기록을 작성하세요',
      category: 'milestone',
      icon: '🎯',
      condition: { type: 'count', target: 1, field: 'records' },
      unlocked: true,
      unlockedAt: '2025-01-15T10:30:00Z',
      reward: { points: 50, badge: 'first-record' },
      progress: { current: 1, target: 1 }
    },
    {
      id: '2',
      title: '열정적인 시작',
      description: '10개의 커피 기록을 작성하세요',
      category: 'milestone',
      icon: '🔥',
      condition: { type: 'count', target: 10, field: 'records' },
      unlocked: true,
      unlockedAt: '2025-01-20T14:15:00Z',
      reward: { points: 100, badge: 'ten-records' },
      progress: { current: 10, target: 10 }
    },
    {
      id: '3',
      title: '카페 탐험가',
      description: '10개 다른 카페를 방문하세요',
      category: 'exploration',
      icon: '🗺️',
      condition: { type: 'variety', target: 10, field: 'cafes' },
      unlocked: true,
      unlockedAt: '2025-01-25T16:45:00Z',
      reward: { points: 150, badge: 'cafe-explorer' },
      progress: { current: 12, target: 10 }
    },
    {
      id: '4',
      title: '완벽주의자',
      description: '5점 만점 커피를 5번 기록하세요',
      category: 'quality',
      icon: '⭐',
      condition: { type: 'rating', target: 5, value: 5 },
      unlocked: true,
      unlockedAt: '2025-01-28T11:20:00Z',
      reward: { points: 120, badge: 'perfectionist' },
      progress: { current: 5, target: 5 }
    },
    {
      id: '5',
      title: '성실한 기록자',
      description: '7일 연속으로 커피를 기록하세요',
      category: 'consistency',
      icon: '🔗',
      condition: { type: 'streak', target: 7, field: 'daily' },
      unlocked: true,
      unlockedAt: '2025-01-22T19:30:00Z',
      reward: { points: 100, badge: 'consistent' },
      progress: { current: 7, target: 7 }
    },
    {
      id: '6',
      title: '새해 첫 커피',
      description: '새해 첫날에 커피를 기록하세요',
      category: 'special',
      icon: '🎊',
      condition: { type: 'special', target: 1, value: 'new-year' },
      unlocked: true,
      unlockedAt: '2025-01-01T08:00:00Z',
      reward: { points: 200, badge: 'new-year' },
      progress: { current: 1, target: 1 }
    },

    // 미달성 성취
    {
      id: '7',
      title: '커피 애호가',
      description: '50개의 커피 기록을 작성하세요',
      category: 'milestone',
      icon: '☕',
      condition: { type: 'count', target: 50, field: 'records' },
      unlocked: false,
      reward: { points: 250, badge: 'coffee-lover' },
      progress: { current: 23, target: 50 }
    },
    {
      id: '8',
      title: '원두 컬렉터',
      description: '20가지 다른 원두를 기록하세요',
      category: 'exploration',
      icon: '🌱',
      condition: { type: 'variety', target: 20, field: 'beans' },
      unlocked: false,
      reward: { points: 200, badge: 'bean-collector' },
      progress: { current: 7, target: 20 }
    },
    {
      id: '9',
      title: '감각의 달인',
      description: '모든 맛 프로필을 한 번씩 선택하세요',
      category: 'quality',
      icon: '👅',
      condition: { type: 'variety', target: 12, field: 'flavors' },
      unlocked: false,
      reward: { points: 150, badge: 'taste-master' },
      progress: { current: 8, target: 12 }
    },
    {
      id: '10',
      title: '주간 챔피언',
      description: '한 주에 매일 커피를 기록하세요',
      category: 'consistency',
      icon: '📅',
      condition: { type: 'streak', target: 7, field: 'weekly' },
      unlocked: false,
      reward: { points: 200, badge: 'weekly-champion' },
      progress: { current: 5, target: 7 }
    },
    {
      id: '11',
      title: '홈카페 마스터',
      description: '홈카페 모드로 10개의 기록을 작성하세요',
      category: 'special',
      icon: '🏠',
      condition: { type: 'count', target: 10, field: 'homecafe' },
      unlocked: false,
      reward: { points: 150, badge: 'home-cafe-master' },
      progress: { current: 3, target: 10 }
    },
    {
      id: '12',
      title: '커피 마스터',
      description: '100개의 커피 기록을 작성하세요',
      category: 'milestone',
      icon: '👑',
      condition: { type: 'count', target: 100, field: 'records' },
      unlocked: false,
      reward: { points: 500, badge: 'coffee-master' },
      progress: { current: 23, target: 100 }
    }
  ]
}