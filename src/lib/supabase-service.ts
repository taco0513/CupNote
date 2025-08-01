import { createError, mapSupabaseError, logError } from './error-handler'
import { supabase } from './supabase'

import type { Achievement } from '../types/achievement'
import type { CoffeeRecord } from '../types/coffee'

// Coffee Records Service
export class CoffeeRecordService {
  // 커피 기록 생성
  static async createRecord(record: Omit<CoffeeRecord, 'id' | 'createdAt' | 'matchScore'>) {
    try {
      // Match Score 계산
      const { data: matchScoreData, error: scoreError } = await supabase.rpc(
        'calculate_match_score',
        {
          p_rating: record.rating || 3,
          p_mode: record.mode || 'cafe',
          p_taste_notes: record.taste || '',
          p_roaster_notes: record.roasterNote || null,
        }
      )

      if (scoreError) {
        console.error('Match score calculation error:', scoreError)
      }

      const matchScore = matchScoreData || 75 // 기본값

      // 데이터베이스에 저장
      const { data, error } = await supabase
        .from('coffee_records')
        .insert({
          coffee_name: record.coffeeName,
          roastery: record.roastery,
          origin: record.origin,
          roasting_level: record.roastLevel,
          brewing_method: record.brewMethod,
          rating: record.rating || 3,
          taste_notes: record.taste || '',
          roaster_notes: record.roasterNote,
          personal_notes: record.memo,
          mode: record.mode || 'cafe',
          match_score: matchScore,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error

      // 성취 시스템 업데이트
      await this.updateAchievements()

      return { data, matchScore }
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.createRecord')
      throw mappedError
    }
  }

  // 커피 기록 목록 조회
  static async getRecords(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.getRecords')
      throw mappedError
    }
  }

  // 특정 커피 기록 조회
  static async getRecord(id: string) {
    try {
      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.getRecord')
      throw mappedError
    }
  }

  // 커피 기록 수정
  static async updateRecord(id: string, updates: Partial<CoffeeRecord>) {
    try {
      const { data, error } = await supabase
        .from('coffee_records')
        .update({
          coffee_name: updates.coffeeName,
          roastery: updates.roastery,
          origin: updates.origin,
          roasting_level: updates.roastLevel,
          brewing_method: updates.brewMethod,
          rating: updates.rating,
          taste_notes: updates.taste,
          roaster_notes: updates.roasterNote,
          personal_notes: updates.memo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.updateRecord')
      throw mappedError
    }
  }

  // 커피 기록 삭제
  static async deleteRecord(id: string) {
    try {
      const { error } = await supabase.from('coffee_records').delete().eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.deleteRecord')
      throw mappedError
    }
  }

  // 통계 데이터 조회
  static async getStats() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // 총 기록 수
      const { count: totalRecords } = await supabase
        .from('coffee_records')
        .select('*', { count: 'exact', head: true })

      // 평균 평점
      const { data: avgRating } = await supabase.from('coffee_records').select('rating')

      const averageRating = avgRating
        ? avgRating.reduce((sum, record) => sum + record.rating, 0) / avgRating.length
        : 0

      // 최고 Match Score
      const { data: highestScore } = await supabase
        .from('coffee_records')
        .select('match_score')
        .order('match_score', { ascending: false })
        .limit(1)
        .single()

      // 선호 원산지
      const { data: origins } = await supabase
        .from('coffee_records')
        .select('origin')
        .not('origin', 'is', null)

      const originCounts =
        origins?.reduce(
          (acc, record) => {
            if (record.origin) {
              acc[record.origin] = (acc[record.origin] || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>
        ) || {}

      const favoriteOrigin =
        Object.entries(originCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '없음'

      return {
        totalRecords: totalRecords || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        highestMatchScore: highestScore?.match_score || 0,
        favoriteOrigin,
        streaks: {
          current: 0, // TODO: 연속 기록 계산 로직 구현
          longest: 0,
        },
      }
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.getStats')
      throw mappedError
    }
  }

  // 성취 시스템 업데이트
  private static async updateAchievements() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      // 현재 사용자의 커피 기록 통계 조회
      const { data: records } = await supabase.from('coffee_records').select('*')

      if (!records) return

      // 성취 조건 체크 및 업데이트 로직
      const totalRecords = records.length
      const uniqueOrigins = new Set(records.filter(r => r.origin).map(r => r.origin)).size
      const perfectRatings = records.filter(r => r.rating === 5).length
      const highRatings = records.filter(r => r.rating >= 4).length

      // 각 성취 조건별 진행도 업데이트
      const achievements = [
        { id: 'first_record', current: Math.min(totalRecords, 1), target: 1 },
        { id: 'coffee_lover', current: Math.min(totalRecords, 10), target: 10 },
        { id: 'world_explorer', current: Math.min(uniqueOrigins, 10), target: 10 },
        { id: 'perfect_cup', current: Math.min(perfectRatings, 1), target: 1 },
        { id: 'consistent_quality', current: Math.min(highRatings, 10), target: 10 },
        { id: 'coffee_master', current: Math.min(totalRecords, 100), target: 100 },
      ]

      for (const achievement of achievements) {
        const unlocked = achievement.current >= achievement.target

        await supabase.from('user_achievements').upsert({
          user_id: user.user.id,
          achievement_id: achievement.id,
          progress_current: achievement.current,
          progress_target: achievement.target,
          unlocked_at: unlocked ? new Date().toISOString() : null,
        })
      }
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'CoffeeRecordService.updateAchievements')
      // Achievement 업데이트 실패는 주요 기능이 아니므로 에러를 throw하지 않음
    }
  }
}

// Achievement Service
export class AchievementService {
  // 사용자 성취 목록 조회
  static async getUserAchievements() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement_definitions (
            id,
            title,
            description,
            icon,
            category,
            points
          )
        `
        )
        .eq('user_id', user.user.id)

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AchievementService.getUserAchievements')
      throw mappedError
    }
  }

  // 전체 성취 정의 조회
  static async getAllAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: true })

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AchievementService.getAllAchievements')
      throw mappedError
    }
  }
}

// User Profile Service
export class UserProfileService {
  // 사용자 프로필 조회
  static async getProfile() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'UserProfileService.getProfile')
      throw mappedError
    }
  }

  // 사용자 프로필 생성
  static async createProfile(profile: { username: string; email: string; avatar_url?: string }) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.user.id,
          username: profile.username,
          email: profile.email,
          avatar_url: profile.avatar_url,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'UserProfileService.createProfile')
      throw mappedError
    }
  }

  // 사용자 프로필 업데이트
  static async updateProfile(updates: { username?: string; avatar_url?: string }) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'UserProfileService.updateProfile')
      throw mappedError
    }
  }
}

// Auth Service
export class AuthService {
  // 이메일로 회원가입
  static async signUp(email: string, password: string, username: string) {
    try {
      // 이메일 확인 비활성화하여 즉시 가입 처리
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: undefined, // 이메일 확인 링크 비활성화
        },
      })

      if (error) {
        console.error('Supabase signup error:', error)
        throw error
      }

      // 가입 성공 로그
      console.log('Signup successful:', data)
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AuthService.signUp')
      throw mappedError
    }
  }

  // 이메일로 로그인
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AuthService.signIn')
      throw mappedError
    }
  }

  // 로그아웃
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AuthService.signOut')
      throw mappedError
    }
  }

  // 현재 사용자 조회
  static async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    } catch (error: unknown) {
      const mappedError = mapSupabaseError(error)
      logError(mappedError, 'AuthService.getCurrentUser')
      return null
    }
  }

  // 인증 상태 변화 구독
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
