/**
 * Goals Store
 *
 * Manages user goals, progress tracking, and achievement rate calculations
 * with real-time updates and personalized goal recommendations.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'
import { useUserStatsStore } from './userStats'

export const useGoalsStore = defineStore('goals', () => {
  // State
  const userGoals = ref([])
  const goalTemplates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Goal Types
  const GOAL_TYPES = {
    TASTINGS: 'tastings',
    STREAK: 'streak',
    SCORE: 'score',
    EXPLORATION: 'exploration',
    SKILL: 'skill',
    TIME: 'time',
  }

  const GOAL_PERIODS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    CUSTOM: 'custom',
  }

  // Computed
  const activeGoals = computed(() => {
    const now = new Date()
    return userGoals.value.filter((goal) => {
      const endDate = new Date(goal.end_date)
      return goal.is_active && endDate >= now
    })
  })

  const completedGoals = computed(() => {
    return userGoals.value.filter((goal) => goal.progress >= 100)
  })

  const inProgressGoals = computed(() => {
    return activeGoals.value.filter((goal) => goal.progress < 100)
  })

  const todaysGoals = computed(() => {
    return activeGoals.value.filter((goal) => goal.period === GOAL_PERIODS.DAILY)
  })

  const weeklyGoals = computed(() => {
    return activeGoals.value.filter((goal) => goal.period === GOAL_PERIODS.WEEKLY)
  })

  const monthlyGoals = computed(() => {
    return activeGoals.value.filter((goal) => goal.period === GOAL_PERIODS.MONTHLY)
  })

  const overallProgress = computed(() => {
    const active = activeGoals.value
    if (active.length === 0) return 0

    const totalProgress = active.reduce((sum, goal) => sum + goal.progress, 0)
    return Math.round(totalProgress / active.length)
  })

  const achievementRate = computed(() => {
    const total = userGoals.value.length
    if (total === 0) return 0

    const completed = completedGoals.value.length
    return Math.round((completed / total) * 100)
  })

  // Goal Templates
  const defaultGoalTemplates = [
    // Daily Goals
    {
      id: 'daily_tasting',
      type: GOAL_TYPES.TASTINGS,
      period: GOAL_PERIODS.DAILY,
      title: '일일 테이스팅',
      description: '매일 한 잔의 커피를 기록하세요',
      icon: '☕',
      target_value: 1,
      unit: '회',
      recommended: true,
    },
    {
      id: 'daily_streak',
      type: GOAL_TYPES.STREAK,
      period: GOAL_PERIODS.DAILY,
      title: '연속 기록 유지',
      description: '매일 꾸준히 기록을 이어가세요',
      icon: '🔥',
      target_value: 1,
      unit: '일',
      recommended: true,
    },

    // Weekly Goals
    {
      id: 'weekly_tastings',
      type: GOAL_TYPES.TASTINGS,
      period: GOAL_PERIODS.WEEKLY,
      title: '주간 테이스팅',
      description: '일주일에 7회 테이스팅',
      icon: '📅',
      target_value: 7,
      unit: '회',
      recommended: true,
    },
    {
      id: 'weekly_score',
      type: GOAL_TYPES.SCORE,
      period: GOAL_PERIODS.WEEKLY,
      title: 'SCA 고득점',
      description: '주간 평균 SCA 85점 이상',
      icon: '🎯',
      target_value: 85,
      unit: '점',
      recommended: false,
    },
    {
      id: 'weekly_origins',
      type: GOAL_TYPES.EXPLORATION,
      period: GOAL_PERIODS.WEEKLY,
      title: '원산지 탐험',
      description: '다양한 원산지 커피 시도',
      icon: '🌍',
      target_value: 3,
      unit: '개',
      recommended: true,
    },

    // Monthly Goals
    {
      id: 'monthly_tastings',
      type: GOAL_TYPES.TASTINGS,
      period: GOAL_PERIODS.MONTHLY,
      title: '월간 테이스팅',
      description: '한 달에 20회 테이스팅',
      icon: '📊',
      target_value: 20,
      unit: '회',
      recommended: true,
    },
    {
      id: 'monthly_pro',
      type: GOAL_TYPES.SKILL,
      period: GOAL_PERIODS.MONTHLY,
      title: 'Pro Mode 마스터',
      description: 'Pro Mode로 10회 이상 기록',
      icon: '🏆',
      target_value: 10,
      unit: '회',
      recommended: false,
    },
    {
      id: 'monthly_time',
      type: GOAL_TYPES.TIME,
      period: GOAL_PERIODS.MONTHLY,
      title: '추출 시간',
      description: '월간 총 5시간 이상 추출',
      icon: '⏰',
      target_value: 300,
      unit: '분',
      recommended: false,
    },
  ]

  // Actions
  const fetchUserGoals = async (userId) => {
    if (!userId) return

    try {
      loading.value = true
      error.value = null

      const { data, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (goalsError) throw goalsError

      // Calculate progress for each goal
      const userStats = useUserStatsStore()
      const goalsWithProgress = await Promise.all(
        (data || []).map(async (goal) => {
          const progress = await calculateGoalProgress(goal, userStats)
          return { ...goal, progress }
        }),
      )

      userGoals.value = goalsWithProgress
    } catch (err) {
      console.error('Error fetching user goals:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const calculateGoalProgress = async (goal, userStats) => {
    // Get current value based on goal type
    let currentValue = 0

    switch (goal.type) {
      case GOAL_TYPES.TASTINGS:
        // Calculate tastings within goal period
        currentValue = await getTastingsInPeriod(goal)
        break

      case GOAL_TYPES.STREAK:
        currentValue = userStats.currentStreak || 0
        break

      case GOAL_TYPES.SCORE:
        // Calculate average score in period
        currentValue = await getAverageScoreInPeriod(goal)
        break

      case GOAL_TYPES.EXPLORATION:
        // Count unique origins in period
        currentValue = await getUniqueOriginsInPeriod(goal)
        break

      case GOAL_TYPES.SKILL:
        // Count Pro Mode sessions in period
        currentValue = await getProSessionsInPeriod(goal)
        break

      case GOAL_TYPES.TIME:
        // Calculate total brewing time in period
        currentValue = await getBrewingTimeInPeriod(goal)
        break
    }

    // Calculate percentage progress
    const progress = Math.min(Math.round((currentValue / goal.target_value) * 100), 100)

    // Update goal progress in database
    if (goal.progress !== progress) {
      await updateGoalProgress(goal.id, progress, currentValue)
    }

    return progress
  }

  const getTastingsInPeriod = async (goal) => {
    const { start, end } = getGoalPeriodDates(goal)

    const { count, error } = await supabase
      .from('coffee_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', goal.user_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    return count || 0
  }

  const getAverageScoreInPeriod = async (goal) => {
    const { start, end } = getGoalPeriodDates(goal)

    const { data, error } = await supabase
      .from('coffee_records')
      .select('sca_score')
      .eq('user_id', goal.user_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .not('sca_score', 'is', null)

    if (!data || data.length === 0) return 0

    const sum = data.reduce((acc, record) => acc + record.sca_score, 0)
    return Math.round(sum / data.length)
  }

  const getUniqueOriginsInPeriod = async (goal) => {
    const { start, end } = getGoalPeriodDates(goal)

    const { data, error } = await supabase
      .from('coffee_records')
      .select('origin')
      .eq('user_id', goal.user_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .not('origin', 'is', null)

    if (!data) return 0

    const uniqueOrigins = new Set(data.map((record) => record.origin))
    return uniqueOrigins.size
  }

  const getProSessionsInPeriod = async (goal) => {
    const { start, end } = getGoalPeriodDates(goal)

    const { count, error } = await supabase
      .from('coffee_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', goal.user_id)
      .eq('mode', 'pro')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    return count || 0
  }

  const getBrewingTimeInPeriod = async (goal) => {
    const { start, end } = getGoalPeriodDates(goal)

    const { data, error } = await supabase
      .from('coffee_records')
      .select('brew_time')
      .eq('user_id', goal.user_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .not('brew_time', 'is', null)

    if (!data) return 0

    const totalSeconds = data.reduce((acc, record) => acc + (record.brew_time || 0), 0)
    return Math.round(totalSeconds / 60) // Convert to minutes
  }

  const getGoalPeriodDates = (goal) => {
    const now = new Date()
    let start, end

    switch (goal.period) {
      case GOAL_PERIODS.DAILY:
        start = new Date(now.setHours(0, 0, 0, 0))
        end = new Date(now.setHours(23, 59, 59, 999))
        break

      case GOAL_PERIODS.WEEKLY:
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        start = weekStart

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        end = weekEnd
        break

      case GOAL_PERIODS.MONTHLY:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break

      case GOAL_PERIODS.CUSTOM:
        start = new Date(goal.start_date)
        end = new Date(goal.end_date)
        break
    }

    return { start, end }
  }

  const updateGoalProgress = async (goalId, progress, currentValue) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({
          progress,
          current_value: currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)

      if (error) throw error
    } catch (err) {
      console.error('Error updating goal progress:', err)
    }
  }

  const createGoal = async (goalData) => {
    const authStore = useAuthStore()
    if (!authStore.user) return { success: false, error: 'User not authenticated' }

    try {
      loading.value = true
      error.value = null

      const { start, end } = getGoalPeriodDates({ period: goalData.period })

      const newGoal = {
        user_id: authStore.user.id,
        type: goalData.type,
        period: goalData.period,
        title: goalData.title,
        description: goalData.description,
        icon: goalData.icon,
        target_value: goalData.target_value,
        current_value: 0,
        unit: goalData.unit,
        progress: 0,
        is_active: true,
        start_date: goalData.start_date || start.toISOString(),
        end_date: goalData.end_date || end.toISOString(),
      }

      const { data, error: createError } = await supabase
        .from('user_goals')
        .insert(newGoal)
        .select()
        .single()

      if (createError) throw createError

      // Add to local state
      userGoals.value.unshift(data)

      return { success: true, data }
    } catch (err) {
      console.error('Error creating goal:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateGoal = async (goalId, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('user_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = userGoals.value.findIndex((g) => g.id === goalId)
      if (index !== -1) {
        userGoals.value[index] = data
      }

      return { success: true, data }
    } catch (err) {
      console.error('Error updating goal:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteGoal = async (goalId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('user_goals').delete().eq('id', goalId)

      if (deleteError) throw deleteError

      // Remove from local state
      userGoals.value = userGoals.value.filter((g) => g.id !== goalId)

      return { success: true }
    } catch (err) {
      console.error('Error deleting goal:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const toggleGoalActive = async (goalId) => {
    const goal = userGoals.value.find((g) => g.id === goalId)
    if (!goal) return { success: false, error: 'Goal not found' }

    return updateGoal(goalId, { is_active: !goal.is_active })
  }

  const refreshGoalProgress = async () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    await fetchUserGoals(authStore.user.id)
  }

  const getRecommendedGoals = computed(() => {
    const userStats = useUserStatsStore()
    const recommendations = []

    // Recommend based on user level and activity
    if (userStats.userLevel.level < 5) {
      // Beginners - focus on consistency
      recommendations.push(
        defaultGoalTemplates.find((t) => t.id === 'daily_tasting'),
        defaultGoalTemplates.find((t) => t.id === 'weekly_tastings'),
      )
    } else if (userStats.userLevel.level < 8) {
      // Intermediate - focus on exploration
      recommendations.push(
        defaultGoalTemplates.find((t) => t.id === 'weekly_origins'),
        defaultGoalTemplates.find((t) => t.id === 'monthly_pro'),
      )
    } else {
      // Advanced - focus on mastery
      recommendations.push(
        defaultGoalTemplates.find((t) => t.id === 'weekly_score'),
        defaultGoalTemplates.find((t) => t.id === 'monthly_time'),
      )
    }

    // Filter out already active goals
    const activeGoalTypes = activeGoals.value.map((g) => g.type)
    return recommendations.filter((r) => r && !activeGoalTypes.includes(r.type))
  })

  const initializeGoals = async (userId) => {
    try {
      loading.value = true
      goalTemplates.value = defaultGoalTemplates
      await fetchUserGoals(userId)
    } catch (err) {
      console.error('Error initializing goals:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    userGoals,
    goalTemplates,
    loading,
    error,

    // Constants
    GOAL_TYPES,
    GOAL_PERIODS,

    // Computed
    activeGoals,
    completedGoals,
    inProgressGoals,
    todaysGoals,
    weeklyGoals,
    monthlyGoals,
    overallProgress,
    achievementRate,
    getRecommendedGoals,

    // Actions
    fetchUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalActive,
    refreshGoalProgress,
    initializeGoals,
  }
})
