import { Achievement, AchievementCondition, UserLevel, UserStats } from '../types/achievement'
import { CoffeeRecord } from '../types/coffee'
import type { MatchScoreResult } from './match-score'

// 기본 성취 목록 정의 - TastingFlow v2.0 호환
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // 테이스팅 마일스톤 (4개)
  {
    id: 'first-tasting',
    title: '첫 테이스팅',
    description: '첫 번째 커피 테이스팅을 완료했습니다',
    icon: '☕',
    category: 'milestone',
    condition: { type: 'count', target: 1, field: 'records' },
    reward: { points: 10 },
  },
  {
    id: 'tasting-explorer',
    title: '테이스팅 탐험가',
    description: '10번의 테이스팅을 완료했습니다',
    icon: '🗺️',
    category: 'milestone',
    condition: { type: 'count', target: 10, field: 'records' },
    reward: { points: 50 },
  },
  {
    id: 'tasting-master',
    title: '테이스팅 마스터',
    description: '50번의 테이스팅을 완료했습니다',
    icon: '👑',
    category: 'milestone',
    condition: { type: 'count', target: 50, field: 'records' },
    reward: { points: 200 },
  },
  {
    id: 'tasting-legend',
    title: '테이스팅 레전드',
    description: '100번의 테이스팅을 완료했습니다',
    icon: '🏆',
    category: 'milestone',
    condition: { type: 'count', target: 100, field: 'records' },
    reward: { points: 500 },
  },

  // 전문성 성취 (4개)
  {
    id: 'match-specialist',
    title: 'Match Score 전문가',
    description: '90점 이상의 Match Score를 5번 달성했습니다',
    icon: '🎯',
    category: 'quality',
    condition: { type: 'rating', target: 90, field: 'match_scores' },
    reward: { points: 100 },
  },
  {
    id: 'flavor-hunter',
    title: '향미 사냥꾼',
    description: '30가지 다른 향미를 발견했습니다',
    icon: '🌸',
    category: 'quality',
    condition: { type: 'variety', target: 30, field: 'flavors' },
    reward: { points: 150 },
  },
  {
    id: 'perfectionist',
    title: '완벽주의자',
    description: '100점 Match Score를 달성했습니다',
    icon: '💎',
    category: 'quality',
    condition: { type: 'special', target: 100 },
    reward: { points: 200 },
  },
  {
    id: 'brewing-expert',
    title: '브루잉 전문가',
    description: 'HomeCafe 모드로 20번의 테이스팅을 완료했습니다',
    icon: '🏠',
    category: 'quality',
    condition: { type: 'count', target: 20, field: 'modes', value: 'homecafe' },
    reward: { points: 120 },
  },

  // 탐험 성취 (4개)
  {
    id: 'origin-explorer',
    title: '원산지 탐험가',
    description: '10개 다른 원산지의 커피를 테이스팅했습니다',
    icon: '🌍',
    category: 'exploration',
    condition: { type: 'variety', target: 10, field: 'origins' },
    reward: { points: 100 },
  },
  {
    id: 'roastery-collector',
    title: '로스터리 컬렉터',
    description: '15개 다른 로스터리의 커피를 테이스팅했습니다',
    icon: '🏪',
    category: 'exploration',
    condition: { type: 'variety', target: 15, field: 'roasteries' },
    reward: { points: 120 },
  },
  {
    id: 'cafe-hopper',
    title: '카페 호핑족',
    description: 'Cafe 모드로 25번의 테이스팅을 완료했습니다',
    icon: '🏃‍♂️',
    category: 'exploration',
    condition: { type: 'count', target: 25, field: 'modes', value: 'cafe' },
    reward: { points: 130 },
  },
  {
    id: 'world-traveler',
    title: '세계 여행자',
    description: '5개 대륙의 커피를 모두 테이스팅했습니다',
    icon: '✈️',
    category: 'exploration',
    condition: { type: 'variety', target: 5, field: 'continents' },
    reward: { points: 300 },
  },

  // 꾸준함 성취 (2개)
  {
    id: 'daily-taster',
    title: '데일리 테이스터',
    description: '7일 연속 테이스팅을 완료했습니다',
    icon: '📅',
    category: 'consistency',
    condition: { type: 'streak', target: 7 },
    reward: { points: 80 },
  },
  {
    id: 'monthly-master',
    title: '월간 마스터',
    description: '30일 연속 테이스팅을 완료했습니다',
    icon: '🗓️',
    category: 'consistency',
    condition: { type: 'streak', target: 30 },
    reward: { points: 300 },
  },

  // 특별 성취 (2개)
  {
    id: 'early-adopter',
    title: '얼리 어답터',
    description: 'CupNote의 초기 사용자입니다',
    icon: '🌟',
    category: 'special',
    condition: { type: 'special', target: 1, field: 'early_adoption' },
    reward: { points: 150 },
  },
  {
    id: 'beta-tester',
    title: '베타 테스터',
    description: 'TastingFlow v2.0 베타 테스트에 참여했습니다',
    icon: '🧪',
    category: 'special',
    condition: { type: 'special', target: 1, field: 'beta_testing' },
    reward: { points: 200 },
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
