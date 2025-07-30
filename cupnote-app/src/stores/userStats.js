/**
 * User Statistics Store
 * 
 * Manages user statistics, achievements, and progress tracking
 * with real-time updates and intelligent insights.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useUserStatsStore = defineStore('userStats', () => {
  // State
  const stats = ref(null)
  const achievements = ref([])
  const userAchievements = ref([])
  const preferences = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isLoading = computed(() => loading.value)
  
  const totalTastings = computed(() => stats.value?.total_tastings || 0)
  const totalProSessions = computed(() => stats.value?.total_pro_sessions || 0)
  const averageScaScore = computed(() => stats.value?.average_sca_score || 0)
  const currentStreak = computed(() => stats.value?.streak_days || 0)
  const longestStreak = computed(() => stats.value?.longest_streak || 0)
  
  const favoriteOrigin = computed(() => stats.value?.favorite_origin || 'N/A')
  const favoriteRoaster = computed(() => stats.value?.favorite_roaster || 'N/A')
  const favoriteProcess = computed(() => stats.value?.favorite_process || 'N/A')
  
  const preferredRatio = computed(() => stats.value?.preferred_ratio || 16.0)
  const preferredTemperature = computed(() => stats.value?.preferred_temperature || 93)
  
  const totalBrewingTime = computed(() => {
    const seconds = stats.value?.total_brewing_time || 0
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return { hours, minutes, total: seconds }
  })

  // Achievement Progress
  const earnedAchievements = computed(() => {
    return userAchievements.value.filter(ua => ua.progress >= 100)
  })

  const inProgressAchievements = computed(() => {
    return userAchievements.value.filter(ua => ua.progress > 0 && ua.progress < 100)
  })

  const availableAchievements = computed(() => {
    const earnedIds = new Set(userAchievements.value.map(ua => ua.achievement_id))
    return achievements.value.filter(a => !earnedIds.has(a.id) && !a.is_hidden)
  })

  const totalPoints = computed(() => {
    return earnedAchievements.value.reduce((sum, ua) => {
      const achievement = achievements.value.find(a => a.id === ua.achievement_id)
      return sum + (achievement?.points || 0)
    }, 0)
  })

  const userLevel = computed(() => {
    const points = totalPoints.value
    if (points >= 1000) return { level: 10, title: 'Coffee Master', icon: '🏆' }
    if (points >= 800) return { level: 9, title: 'Expert Taster', icon: '👑' }
    if (points >= 600) return { level: 8, title: 'Advanced Cupper', icon: '🎯' }
    if (points >= 400) return { level: 7, title: 'Skilled Brewer', icon: '⭐' }
    if (points >= 250) return { level: 6, title: 'Coffee Enthusiast', icon: '☕' }
    if (points >= 150) return { level: 5, title: 'Regular Taster', icon: '📈' }
    if (points >= 100) return { level: 4, title: 'Casual Sipper', icon: '🌟' }
    if (points >= 50) return { level: 3, title: 'Coffee Explorer', icon: '🔍' }
    if (points >= 25) return { level: 2, title: 'Beginner Taster', icon: '🌱' }
    return { level: 1, title: 'Coffee Newcomer', icon: '🆕' }
  })

  const nextLevelProgress = computed(() => {
    const currentPoints = totalPoints.value
    const thresholds = [0, 25, 50, 100, 150, 250, 400, 600, 800, 1000]
    const currentLevel = userLevel.value.level
    
    if (currentLevel >= 10) {
      return { current: currentPoints, next: 1000, progress: 100 }
    }
    
    const nextThreshold = thresholds[currentLevel]
    const prevThreshold = thresholds[currentLevel - 1]
    const progress = Math.round(((currentPoints - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    
    return {
      current: currentPoints,
      next: nextThreshold,
      needed: nextThreshold - currentPoints,
      progress: progress
    }
  })

  // Weekly/Monthly Goals
  const weeklyGoals = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    
    return [
      {
        id: 'weekly_tastings',
        title: '주간 테이스팅',
        icon: '☕',
        current: 3, // This would be calculated from recent records
        target: 7,
        unit: '회',
        period: 'week'
      },
      {
        id: 'weekly_streak',
        title: '연속 기록',
        icon: '🔥',
        current: currentStreak.value,
        target: 7,
        unit: '일',
        period: 'week'
      }
    ]
  })

  const monthlyGoals = computed(() => {
    return [
      {
        id: 'monthly_tastings',
        title: '월간 테이스팅',
        icon: '📅',
        current: Math.min(totalTastings.value, 20), // This would be calculated from current month
        target: 20,
        unit: '회',
        period: 'month'
      },
      {
        id: 'monthly_score',
        title: '평균 점수',
        icon: '🎯',
        current: Math.round(averageScaScore.value),
        target: 85,
        unit: '점',
        period: 'month'
      },
      {
        id: 'monthly_origins',
        title: '원산지 탐험',
        icon: '🌍',
        current: 3, // This would be calculated from unique origins this month
        target: 5,
        unit: '개',
        period: 'month'
      }
    ]
  })

  // Actions
  const fetchUserStats = async (userId) => {
    if (!userId) return

    try {
      loading.value = true
      error.value = null

      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError
      }

      stats.value = statsData || {
        user_id: userId,
        total_tastings: 0,
        total_pro_sessions: 0,
        average_sca_score: 0,
        streak_days: 0,
        longest_streak: 0,
        total_brewing_time: 0
      }

    } catch (err) {
      console.error('Error fetching user stats:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchAchievements = async () => {
    try {
      const { data, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('tier', { ascending: true })

      if (achievementsError) throw achievementsError
      achievements.value = data || []

    } catch (err) {
      console.error('Error fetching achievements:', err)
      error.value = err.message
    }
  }

  const fetchUserAchievements = async (userId) => {
    if (!userId) return

    try {
      const { data, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)

      if (userAchievementsError) throw userAchievementsError
      userAchievements.value = data || []

    } catch (err) {
      console.error('Error fetching user achievements:', err)
      error.value = err.message
    }
  }

  const fetchUserPreferences = async (userId) => {
    if (!userId) return

    try {
      const { data, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError
      }

      preferences.value = preferencesError ? await createDefaultPreferences(userId) : data

    } catch (err) {
      console.error('Error fetching user preferences:', err)
      error.value = err.message
    }
  }

  const createDefaultPreferences = async (userId) => {
    const defaultPrefs = {
      user_id: userId,
      theme: 'light',
      language: 'ko',
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      auto_save: true,
      default_coffee_amount: 20,
      default_ratio: 16.0,
      default_temperature: 93,
      measurement_units: 'metric',
      privacy_level: 'private',
      show_tips: true
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(defaultPrefs)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating default preferences:', err)
      return defaultPrefs
    }
  }

  const updatePreferences = async (updates) => {
    if (!preferences.value) return

    try {
      loading.value = true

      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', preferences.value.user_id)
        .select()
        .single()

      if (error) throw error

      preferences.value = data
      return { success: true }

    } catch (err) {
      console.error('Error updating preferences:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const checkAndUpdateAchievements = async (userId, triggerData) => {
    try {
      // This would contain logic to check if user has earned new achievements
      // based on their latest activity (triggerData)
      
      const newAchievements = []
      
      // Example: Check for first brew achievement
      if (triggerData.type === 'new_tasting' && totalTastings.value === 1) {
        const firstBrewAchievement = achievements.value.find(a => a.code === 'first_brew')
        if (firstBrewAchievement) {
          newAchievements.push({
            user_id: userId,
            achievement_id: firstBrewAchievement.id,
            progress: 100,
            earned_at: new Date().toISOString()
          })
        }
      }

      // Example: Check for Pro Mode achievements
      if (triggerData.type === 'pro_session' && totalProSessions.value === 1) {
        const proBeginnerAchievement = achievements.value.find(a => a.code === 'pro_beginner')
        if (proBeginnerAchievement) {
          newAchievements.push({
            user_id: userId,
            achievement_id: proBeginnerAchievement.id,
            progress: 100,
            earned_at: new Date().toISOString()
          })
        }
      }

      // Insert new achievements
      if (newAchievements.length > 0) {
        const { error } = await supabase
          .from('user_achievements')
          .insert(newAchievements)

        if (!error) {
          // Refresh user achievements
          await fetchUserAchievements(userId)
          return newAchievements
        }
      }

      return []
    } catch (err) {
      console.error('Error checking achievements:', err)
      return []
    }
  }

  const generateInsights = computed(() => {
    if (!stats.value) return []

    const insights = []

    // Streak insights
    if (currentStreak.value > 0) {
      if (currentStreak.value >= 7) {
        insights.push({
          type: 'achievement',
          icon: '🔥',
          title: '일주일 연속 기록!',
          message: '꾸준한 커피 여정을 이어가고 있습니다.',
          color: '#F59E0B'
        })
      } else if (currentStreak.value >= 3) {
        insights.push({
          type: 'progress',
          icon: '📈',
          title: '좋은 페이스!',
          message: `${7 - currentStreak.value}일만 더 기록하면 일주일 달성!`,
          color: '#10B981'
        })
      }
    }

    // Pro Mode insights
    if (totalProSessions.value > 0) {
      const proRatio = (totalProSessions.value / totalTastings.value) * 100
      if (proRatio >= 50) {
        insights.push({
          type: 'skill',
          icon: '🎯',
          title: 'Pro Mode 애호가',
          message: `전체 테이스팅의 ${Math.round(proRatio)}%가 Pro Mode입니다.`,
          color: '#8B5CF6'
        })
      }
    }

    // SCA Score insights
    if (averageScaScore.value > 0) {
      if (averageScaScore.value >= 90) {
        insights.push({
          type: 'mastery',
          icon: '⭐',
          title: 'SCA 마스터 수준',
          message: `평균 SCA 점수 ${averageScaScore.value}점으로 전문가 수준입니다.`,
          color: '#DC2626'
        })
      } else if (averageScaScore.value >= 80) {
        insights.push({
          type: 'progress',
          icon: '📊',
          title: '높은 품질 유지',
          message: `평균 SCA 점수가 ${averageScaScore.value}점으로 일관되게 좋습니다.`,
          color: '#059669'
        })
      }
    }

    // Brewing time insights
    if (totalBrewingTime.value.hours > 0) {
      insights.push({
        type: 'dedication',
        icon: '⏰',
        title: '커피에 투자한 시간',
        message: `총 ${totalBrewingTime.value.hours}시간 ${totalBrewingTime.value.minutes}분을 커피 추출에 사용했습니다.`,
        color: '#6366F1'
      })
    }

    return insights
  })

  const initializeUserStats = async (userId) => {
    try {
      loading.value = true
      
      await Promise.all([
        fetchUserStats(userId),
        fetchAchievements(),
        fetchUserAchievements(userId),
        fetchUserPreferences(userId)
      ])

    } catch (err) {
      console.error('Error initializing user stats:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    stats,
    achievements,
    userAchievements,
    preferences,
    loading,
    error,

    // Computed
    isLoading,
    totalTastings,
    totalProSessions,
    averageScaScore,
    currentStreak,
    longestStreak,
    favoriteOrigin,
    favoriteRoaster,
    favoriteProcess,
    preferredRatio,
    preferredTemperature,
    totalBrewingTime,
    earnedAchievements,
    inProgressAchievements,
    availableAchievements,
    totalPoints,
    userLevel,
    nextLevelProgress,
    weeklyGoals,
    monthlyGoals,
    generateInsights,

    // Actions
    fetchUserStats,
    fetchAchievements,
    fetchUserAchievements,
    fetchUserPreferences,
    updatePreferences,
    checkAndUpdateAchievements,
    initializeUserStats
  }
})