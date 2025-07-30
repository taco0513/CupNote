import { CoffeeRecord } from '@/types/coffee'
import { Achievement, AchievementCondition, UserLevel, UserStats } from '@/types/achievement'

// 기본 성취 목록 정의
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // 마일스톤 성취
  {
    id: 'first-record',
    title: '첫 기록',
    description: '첫 번째 커피를 기록했어요!',
    icon: '🎉',
    category: 'milestone',
    condition: { type: 'count', target: 1, field: 'records' },
    reward: { points: 10 },
  },
  {
    id: 'coffee-lover',
    title: '커피 애호가',
    description: '10개의 커피를 기록했어요',
    icon: '☕',
    category: 'milestone',
    condition: { type: 'count', target: 10, field: 'records' },
    reward: { points: 50 },
  },
  {
    id: 'coffee-expert',
    title: '커피 전문가',
    description: '50개의 커피를 기록했어요',
    icon: '🏆',
    category: 'milestone',
    condition: { type: 'count', target: 50, field: 'records' },
    reward: { points: 200 },
  },
  {
    id: 'coffee-master',
    title: '커피 마스터',
    description: '100개의 커피를 기록했어요',
    icon: '👑',
    category: 'milestone',
    condition: { type: 'count', target: 100, field: 'records' },
    reward: { points: 500 },
  },

  // 탐험 성취
  {
    id: 'world-explorer',
    title: '세계 탐험가',
    description: '10개 이상의 다른 원산지 커피를 마셨어요',
    icon: '🌍',
    category: 'exploration',
    condition: { type: 'variety', target: 10, field: 'origins' },
    reward: { points: 100 },
  },
  {
    id: 'roastery-hopper',
    title: '로스터리 탐방가',
    description: '5개 이상의 다른 로스터리를 방문했어요',
    icon: '🏪',
    category: 'exploration',
    condition: { type: 'variety', target: 5, field: 'roasteries' },
    reward: { points: 75 },
  },

  // 품질 성취
  {
    id: 'perfectionist',
    title: '완벽주의자',
    description: '5점 만점을 10번 받았어요',
    icon: '⭐',
    category: 'quality',
    condition: { type: 'count', target: 10, field: 'ratings', value: 5 },
    reward: { points: 150 },
  },
  {
    id: 'quality-seeker',
    title: '품질 추구자',
    description: '평균 평점이 4점 이상이에요',
    icon: '💎',
    category: 'quality',
    condition: { type: 'rating', target: 4, field: 'average' },
    reward: { points: 100 },
  },

  // 일관성 성취
  {
    id: 'daily-ritual',
    title: '데일리 의식',
    description: '7일 연속 커피를 기록했어요',
    icon: '📅',
    category: 'consistency',
    condition: { type: 'streak', target: 7 },
    reward: { points: 80 },
  },
  {
    id: 'dedication',
    title: '헌신',
    description: '30일 연속 커피를 기록했어요',
    icon: '🔥',
    category: 'consistency',
    condition: { type: 'streak', target: 30 },
    reward: { points: 300 },
  },

  // 특별 성취
  {
    id: 'lab-scientist',
    title: '랩 과학자',
    description: '랩 모드로 10번 기록했어요',
    icon: '🔬',
    category: 'special',
    condition: { type: 'count', target: 10, field: 'modes', value: 'lab' },
    reward: { points: 120 },
  },
  {
    id: 'home-barista',
    title: '홈 바리스타',
    description: '홈카페 모드로 20번 기록했어요',
    icon: '🏠',
    category: 'special',
    condition: { type: 'count', target: 20, field: 'modes', value: 'homecafe' },
    reward: { points: 100 },
  },
]

// 레벨 시스템 정의
export const LEVEL_SYSTEM = [
  { level: 1, title: '커피 입문자', description: '커피 여행을 시작했어요', requiredPoints: 0 },
  { level: 2, title: '커피 팬', description: '커피에 관심이 생겼어요', requiredPoints: 50 },
  { level: 3, title: '커피 애호가', description: '커피를 좋아해요', requiredPoints: 150 },
  { level: 4, title: '커피 마니아', description: '커피에 푹 빠졌어요', requiredPoints: 300 },
  { level: 5, title: '커피 전문가', description: '커피를 잘 알아요', requiredPoints: 500 },
  {
    level: 6,
    title: '커피 큐레이터',
    description: '좋은 커피를 찾는 눈이 있어요',
    requiredPoints: 800,
  },
  { level: 7, title: '커피 마스터', description: '커피의 달인이에요', requiredPoints: 1200 },
  { level: 8, title: '커피 구루', description: '커피 지식이 풍부해요', requiredPoints: 1800 },
  { level: 9, title: '커피 전설', description: '커피계의 전설이에요', requiredPoints: 2500 },
  { level: 10, title: '커피 신', description: '커피의 신이에요', requiredPoints: 3500 },
]

export class AchievementSystem {
  // 사용자 통계 계산
  static calculateUserStats(records: CoffeeRecord[]): UserStats {
    const totalRecords = records.length
    const totalRatings = records.reduce((sum, record) => sum + (record.rating || 0), 0)
    const averageRating = totalRecords > 0 ? totalRatings / totalRecords : 0

    // 탐험 통계
    const exploredOrigins = [...new Set(records.filter(r => r.origin).map(r => r.origin!))]
    const exploredRoasteries = [...new Set(records.filter(r => r.roastery).map(r => r.roastery!))]

    // 연속 기록 계산
    const streaks = this.calculateStreaks(records)

    // 즐겨찾기 계산 (가장 많이 기록한 것)
    const originCounts = this.countBy(records, 'origin')
    const roasteryCounts = this.countBy(records, 'roastery')
    const brewMethodCounts = this.countBy(records, 'brewMethod')

    const favorites = {
      origin: this.getMostFrequent(originCounts),
      roastery: this.getMostFrequent(roasteryCounts),
      brewMethod: this.getMostFrequent(brewMethodCounts),
    }

    // 성취 시스템 초기화
    const achievements = this.initializeAchievements(records)
    const totalPoints = this.calculateTotalPoints(achievements)
    const level = this.calculateLevel(totalPoints)

    return {
      totalRecords,
      totalPoints,
      level,
      achievements,
      streaks,
      favorites,
      averageRating,
      exploredOrigins,
      exploredRoasteries,
    }
  }

  // 성취 초기화 및 체크
  private static initializeAchievements(records: CoffeeRecord[]): Achievement[] {
    return DEFAULT_ACHIEVEMENTS.map(achievement => {
      const progress = this.checkAchievementProgress(achievement, records)
      const unlocked = progress.current >= progress.target

      return {
        ...achievement,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined,
        progress,
      }
    })
  }

  // 성취 진행도 체크
  private static checkAchievementProgress(
    achievement: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>,
    records: CoffeeRecord[]
  ): { current: number; target: number } {
    const { condition } = achievement
    let current = 0

    switch (condition.type) {
      case 'count':
        if (condition.field === 'records') {
          current = records.length
        } else if (condition.field === 'ratings' && condition.value) {
          current = records.filter(r => r.rating === condition.value).length
        } else if (condition.field === 'modes' && condition.value) {
          current = records.filter(r => r.mode === condition.value).length
        }
        break

      case 'variety':
        if (condition.field === 'origins') {
          current = new Set(records.filter(r => r.origin).map(r => r.origin)).size
        } else if (condition.field === 'roasteries') {
          current = new Set(records.filter(r => r.roastery).map(r => r.roastery)).size
        }
        break

      case 'rating':
        if (condition.field === 'average') {
          const totalRatings = records.reduce((sum, r) => sum + (r.rating || 0), 0)
          current = records.length > 0 ? totalRatings / records.length : 0
        }
        break

      case 'streak':
        const streaks = this.calculateStreaks(records)
        current = streaks.longest
        break
    }

    return { current, target: condition.target }
  }

  // 연속 기록 계산
  private static calculateStreaks(records: CoffeeRecord[]): {
    current: number
    longest: number
    lastRecordDate?: string
  } {
    if (records.length === 0) {
      return { current: 0, longest: 0 }
    }

    // 날짜별로 정렬
    const sortedRecords = records
      .filter(r => r.date)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())

    const dates = [...new Set(sortedRecords.map(r => r.date!))]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    const today = new Date()
    const lastRecordDate = dates[0]
    const lastRecord = new Date(lastRecordDate)

    // 현재 연속 기록 계산
    const daysDiff = Math.floor((today.getTime() - lastRecord.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff <= 1) {
      currentStreak = 1

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diff === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // 최장 연속 기록 계산
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { current: currentStreak, longest: longestStreak, lastRecordDate }
  }

  // 총 포인트 계산
  private static calculateTotalPoints(achievements: Achievement[]): number {
    return achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.reward?.points || 0), 0)
  }

  // 레벨 계산
  private static calculateLevel(points: number): UserLevel {
    let level = LEVEL_SYSTEM[0]

    for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
      if (points >= LEVEL_SYSTEM[i].requiredPoints) {
        level = LEVEL_SYSTEM[i]
        break
      }
    }

    const nextLevel = LEVEL_SYSTEM[level.level] || LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1]
    const progress =
      nextLevel.requiredPoints > level.requiredPoints
        ? ((points - level.requiredPoints) / (nextLevel.requiredPoints - level.requiredPoints)) *
          100
        : 100

    return {
      level: level.level,
      title: level.title,
      description: level.description,
      requiredPoints: level.requiredPoints,
      currentPoints: points,
      nextLevelPoints: nextLevel.requiredPoints,
      progress: Math.min(Math.round(progress), 100),
    }
  }

  // 유틸리티 메서드들
  private static countBy(
    records: CoffeeRecord[],
    field: keyof CoffeeRecord
  ): Record<string, number> {
    const counts: Record<string, number> = {}

    records.forEach(record => {
      const value = record[field] as string
      if (value) {
        counts[value] = (counts[value] || 0) + 1
      }
    })

    return counts
  }

  private static getMostFrequent(counts: Record<string, number>): string | undefined {
    const entries = Object.entries(counts)
    if (entries.length === 0) return undefined

    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
  }
}
