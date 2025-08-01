/**
 * Achievement System Types
 * 16개 배지 시스템
 * 
 * @version 1.0.0
 * @since 2025-01-31
 */

export type AchievementCategory = 
  | 'tasting' 
  | 'expertise' 
  | 'exploration' 
  | 'community' 
  | 'consistency' 
  | 'special'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  icon: string
  targetValue: number
  currentValue?: number
  unlockedAt?: string
  isUnlocked: boolean
  progress: number // 0-100
  requirements: string[]
  reward?: {
    type: 'title' | 'badge' | 'feature'
    value: string
  }
}

export interface UserAchievements {
  userId: string
  achievements: Record<string, Achievement>
  totalUnlocked: number
  totalPoints: number
  currentTitle?: string
  unlockedTitles: string[]
  lastUpdated: string
}

export interface AchievementProgress {
  achievementId: string
  progress: number
  isComplete: boolean
  completedAt?: string
}

export interface AchievementEvent {
  type: 'tasting_completed' | 'match_score' | 'flavor_discovery' | 'streak' | 'special'
  data: Record<string, any>
  timestamp: string
}

// Achievement 점수 시스템
export const ACHIEVEMENT_POINTS: Record<AchievementTier, number> = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
}

// Achievement 색상 테마
export const ACHIEVEMENT_COLORS: Record<AchievementTier, string> = {
  bronze: 'from-amber-500 to-amber-600',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-purple-500 to-purple-600',
}

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { name: string; icon: string; color: string }> = {
  tasting: { name: '테이스팅', icon: '☕', color: 'bg-coffee-100' },
  expertise: { name: '전문성', icon: '🎯', color: 'bg-blue-100' },
  exploration: { name: '탐험', icon: '🗺️', color: 'bg-green-100' },
  community: { name: '커뮤니티', icon: '👥', color: 'bg-purple-100' },
  consistency: { name: '꾸준함', icon: '📈', color: 'bg-orange-100' },
  special: { name: '특별', icon: '⭐', color: 'bg-yellow-100' },
}