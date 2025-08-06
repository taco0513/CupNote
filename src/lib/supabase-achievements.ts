import { supabase } from './supabase'
import { DEFAULT_ACHIEVEMENTS } from './achievements'
import { log } from './logger'
import { Achievement, UserStats, UserLevel, LEVEL_SYSTEM } from '../types/achievement'
import { CoffeeRecord } from '../types/coffee'

// Supabase 기반 성취 시스템
export class SupabaseAchievements {
  // 사용자 성취 초기화 (첫 로그인 시)
  static async initializeUserAchievements(userId: string): Promise<void> {
    try {
      // 사용자 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        log.info('성취 초기화 건너뜀: 사용자가 로그인하지 않음')
        return
      }

      const { data: existingAchievements, error: selectError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      if (selectError) {
        console.error('기존 성취 조회 오류:', selectError)
        return
      }

      const existingIds = new Set(existingAchievements?.map(a => a.achievement_id) || [])

      // 새로운 성취들만 추가
      const newAchievements = DEFAULT_ACHIEVEMENTS.filter(
        achievement => !existingIds.has(achievement.id)
      ).map(achievement => ({
        user_id: userId,
        achievement_id: achievement.id,
        progress_current: 0,
        progress_target: achievement.condition.target,
        unlocked_at: null,
      }))

      if (newAchievements.length > 0) {
        const { error } = await supabase.from('user_achievements').insert(newAchievements)

        if (error) {
          console.error('성취 초기화 오류:', error)
          // 오류가 발생해도 앱 동작을 막지 않음
        } else {
        }
      }
    } catch (error) {
      console.error('성취 초기화 전체 오류:', error)
      // 성취 시스템 오류가 발생해도 앱 동작을 막지 않음
    }
  }

  // 사용자의 모든 성취 리셋 (기록이 없을 때 사용)
  static async resetUserAchievements(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    try {
      // 모든 성취를 unlocked = false로 업데이트
      const { error } = await supabase
        .from('user_achievements')
        .update({ 
          unlocked: false, 
          unlocked_at: null,
          progress: 0 
        })
        .eq('user_id', user.id)

      if (error) throw error
      
      return true
    } catch (error) {
      console.error('성취 리셋 오류:', error)
      return false
    }
  }

  // 사용자 통계 및 성취 정보 조회
  static async getUserStats(): Promise<UserStats | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    try {
      // 병렬로 데이터 조회
      const [recordsResult, achievementsResult] = await Promise.all([
        supabase
          .from('coffee_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
      ])

      if (recordsResult.error) throw recordsResult.error
      if (achievementsResult.error) throw achievementsResult.error

      const records = recordsResult.data || []
      const userAchievements = achievementsResult.data || []

      // CoffeeRecord 형식으로 변환
      const coffeeRecords: CoffeeRecord[] = records.map(record => ({
        id: record.id,
        userId: record.user_id,
        coffeeName: record.coffee_name,
        roastery: record.roastery,
        origin: record.origin,
        roastLevel: record.roasting_level,
        brewMethod: record.brewing_method,
        rating: record.rating,
        taste: record.taste_notes,
        roasterNote: record.roaster_notes,
        memo: record.personal_notes,
        mode: record.mode as 'cafe' | 'homecafe',
        tasteMode: 'simple', // 기본값 설정
        date: record.created_at.split('T')[0],
        createdAt: record.created_at,
      }))

      // 통계 계산
      const stats = await this.calculateUserStats(coffeeRecords, userAchievements)
      return stats
    } catch (error) {
      console.error('사용자 통계 조회 오류:', error)
      return null
    }
  }

  // 새 기록 추가 시 성취 업데이트
  static async updateAchievements(userId: string): Promise<string[]> {
    try {
      // 모든 기록 조회
      const { data: records, error: recordsError } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError

      const coffeeRecords: CoffeeRecord[] = (records || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        coffeeName: record.coffee_name,
        roastery: record.roastery,
        origin: record.origin,
        roastLevel: record.roasting_level,
        brewMethod: record.brewing_method,
        rating: record.rating,
        taste: record.taste_notes,
        roasterNote: record.roaster_notes,
        memo: record.personal_notes,
        mode: record.mode as 'cafe' | 'homecafe',
        tasteMode: 'simple', // 기본값 설정
        date: record.created_at.split('T')[0],
        createdAt: record.created_at,
      }))

      // 현재 성취 상태 조회
      const { data: currentAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)

      if (achievementsError) throw achievementsError

      const newlyUnlocked: string[] = []
      interface AchievementUpdate {
        user_id: string
        achievement_id: string
        progress: number
        unlocked_at?: string
        metadata?: Record<string, any>
      }
      const achievementUpdates: AchievementUpdate[] = []

      // 각 성취에 대해 진행도 계산 및 업데이트
      for (const achievementDef of DEFAULT_ACHIEVEMENTS) {
        const userAchievement = currentAchievements?.find(
          ua => ua.achievement_id === achievementDef.id
        )

        if (!userAchievement) continue

        const progress = this.calculateAchievementProgress(achievementDef, coffeeRecords)
        const wasUnlocked = userAchievement.unlocked_at !== null
        const isNowUnlocked = progress.current >= progress.target

        // 진행도가 변경되었거나 새로 달성한 경우 업데이트
        if (
          userAchievement.progress_current !== progress.current ||
          (!wasUnlocked && isNowUnlocked)
        ) {
          achievementUpdates.push({
            id: userAchievement.id,
            progress_current: progress.current,
            unlocked_at:
              isNowUnlocked && !wasUnlocked
                ? new Date().toISOString()
                : userAchievement.unlocked_at,
          })

          // 새로 달성한 성취 기록
          if (!wasUnlocked && isNowUnlocked) {
            newlyUnlocked.push(achievementDef.id)
          }
        }
      }

      // 배치 업데이트
      if (achievementUpdates.length > 0) {
        for (const update of achievementUpdates) {
          const { error } = await supabase
            .from('user_achievements')
            .update({
              progress_current: update.progress_current,
              unlocked_at: update.unlocked_at,
            })
            .eq('id', update.id)

          if (error) {
            console.error('성취 업데이트 오류:', error)
          }
        }
      }

      return newlyUnlocked
    } catch (error) {
      console.error('성취 시스템 업데이트 오류:', error)
      return []
    }
  }

  // 통계 계산 (기존 AchievementSystem.calculateUserStats와 유사)
  private static async calculateUserStats(
    records: CoffeeRecord[],
    userAchievements: Array<{
      achievement_id: string
      progress: number
      unlocked_at?: string
      metadata?: Record<string, any>
    }>
  ): Promise<UserStats> {
    const totalRecords = records.length
    const totalRatings = records.reduce((sum, record) => sum + (record.rating || 0), 0)
    const averageRating = totalRecords > 0 ? totalRatings / totalRecords : 0

    // 탐험 통계
    const exploredOrigins = [...new Set(records.filter(r => r.origin).map(r => r.origin!))]
    const exploredRoasteries = [...new Set(records.filter(r => r.roastery).map(r => r.roastery!))]

    // 연속 기록 계산
    const streaks = this.calculateStreaks(records)

    // 즐겨찾기 계산
    const originCounts = this.countBy(records, 'origin')
    const roasteryCounts = this.countBy(records, 'roastery')
    const brewMethodCounts = this.countBy(records, 'brewMethod')

    const favorites = {
      origin: this.getMostFrequent(originCounts),
      roastery: this.getMostFrequent(roasteryCounts),
      brewMethod: this.getMostFrequent(brewMethodCounts),
    }

    // 성취 데이터 변환
    const achievements: Achievement[] = DEFAULT_ACHIEVEMENTS.map(achievementDef => {
      const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementDef.id)

      const progress = this.calculateAchievementProgress(achievementDef, records)
      const unlocked = userAchievement?.unlocked_at !== null

      return {
        ...achievementDef,
        unlocked,
        unlockedAt: userAchievement?.unlocked_at,
        progress,
      }
    })

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

  // 성취 진행도 계산 (기존 로직과 동일)
  private static calculateAchievementProgress(
    achievement: Achievement,
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

  // 유틸리티 메서드들 (기존 AchievementSystem과 동일)
  private static calculateStreaks(records: CoffeeRecord[]): {
    current: number
    longest: number
    lastRecordDate?: string
  } {
    if (records.length === 0) {
      return { current: 0, longest: 0 }
    }

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

  private static calculateTotalPoints(achievements: Achievement[]): number {
    return achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.reward?.points || 0), 0)
  }

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
