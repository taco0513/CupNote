// 성취 시스템 타입 정의

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'milestone' | 'exploration' | 'quality' | 'consistency' | 'special'
  condition: AchievementCondition
  reward?: {
    points: number
    badge?: string
  }
  unlocked: boolean
  unlockedAt?: string
  progress?: {
    current: number
    target: number
  }
}

export interface AchievementCondition {
  type: 'count' | 'rating' | 'streak' | 'variety' | 'special'
  target: number
  field?: string // 예: 'records', 'ratings', 'origins'
  value?: any // 특정 값 조건
}

export interface UserLevel {
  level: number
  title: string
  description: string
  requiredPoints: number
  currentPoints: number
  nextLevelPoints: number
  progress: number // 0-100
}

export interface UserStats {
  totalRecords: number
  totalPoints: number
  level: UserLevel
  achievements: Achievement[]
  streaks: {
    current: number
    longest: number
    lastRecordDate?: string
  }
  favorites: {
    origin?: string
    roastery?: string
    brewMethod?: string
  }
  averageRating: number
  exploredOrigins: string[]
  exploredRoasteries: string[]
}
